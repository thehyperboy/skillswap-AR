import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { KARMA_RULES, calculateKarmaLevel } from "@/lib/karma";

const updateRequestSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = updateRequestSchema.parse(body);
    const requestId = params.id;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the collaboration request
    const collaborationRequest = await prisma.collaborationRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        recipient: true,
      },
    });

    if (!collaborationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check permissions
    const isSender = collaborationRequest.senderId === user.id;
    const isRecipient = collaborationRequest.recipientId === user.id;

    if (!isSender && !isRecipient) {
      return NextResponse.json({ error: "Not authorized to update this request" }, { status: 403 });
    }

    // Validate status transitions
    if (status === "ACCEPTED" && !isRecipient) {
      return NextResponse.json({ error: "Only recipient can accept request" }, { status: 403 });
    }

    if (status === "DECLINED" && !isRecipient) {
      return NextResponse.json({ error: "Only recipient can decline request" }, { status: 403 });
    }

    if (status === "CANCELLED" && !isSender) {
      return NextResponse.json({ error: "Only sender can cancel request" }, { status: 403 });
    }

    if (status === "COMPLETED" && !(isSender || isRecipient)) {
      return NextResponse.json({ error: "Only participants can mark as completed" }, { status: 403 });
    }

    // Prevent invalid transitions
    if (collaborationRequest.status === "COMPLETED") {
      return NextResponse.json({ error: "Cannot update completed request" }, { status: 400 });
    }

    if (collaborationRequest.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot update cancelled request" }, { status: 400 });
    }

    // Update the request
    const updatedRequest = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
        recipient: {
          select: { id: true, name: true, email: true },
        },
        skill: {
          select: { id: true, name: true },
        },
      },
    });

    // If marked as COMPLETED, add karma points to both participants
    if (status === "COMPLETED") {
      await updateKarmaForCompletion(collaborationRequest.senderId, requestId);
      await updateKarmaForCompletion(collaborationRequest.recipientId, requestId);
    }

    // If CANCELLED, deduct karma from sender
    if (status === "CANCELLED") {
      await updateKarmaForCancellation(collaborationRequest.senderId, requestId);
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Error updating collaboration request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Update karma when collaboration is completed
 */
async function updateKarmaForCompletion(userId: string, collaborationRequestId: string) {
  try {
    const skillKarma = await prisma.skillKarma.findUnique({
      where: { userId },
    });

    const karmaPoints = KARMA_RULES.COLLABORATION_COMPLETED;
    const newPoints = (skillKarma?.points || 0) + karmaPoints;
    const karmaLevelInfo = calculateKarmaLevel(newPoints);

    // Update karma
    // @ts-expect-error - Types may need regeneration after schema changes
    await prisma.skillKarma.update({
      where: { userId },
      data: {
        points: newPoints,
        level: karmaLevelInfo.level,
        badge: karmaLevelInfo.badge,
        completedSessionCount: (skillKarma?.completedSessionCount || 0) + 1,
      },
    });

    // Create karma log entry
    // @ts-expect-error - Types may need regeneration after schema changes
    await prisma.skillKarmaLog.create({
      data: {
        userId,
        pointsChanged: karmaPoints,
        reason: "COLLABORATION_COMPLETED",
        collaborationRequestId,
        description: "Completed a collaboration session",
      },
    });
  } catch (error) {
    console.error(`Error updating karma for user ${userId}:`, error);
    // Don't throw - continue even if karma update fails
  }
}

/**
 * Update karma when collaboration is cancelled
 */
async function updateKarmaForCancellation(userId: string, collaborationRequestId: string) {
  try {
    const skillKarma = await prisma.skillKarma.findUnique({
      where: { userId },
    });

    const karmaPoints = KARMA_RULES.CANCELLATION;
    const newPoints = Math.max(0, (skillKarma?.points || 0) + karmaPoints); // Don't go below 0
    const karmaLevelInfo = calculateKarmaLevel(newPoints);

    // Update karma
    // @ts-expect-error - Types may need regeneration after schema changes
    await prisma.skillKarma.update({
      where: { userId },
      data: {
        points: newPoints,
        level: karmaLevelInfo.level,
        badge: karmaLevelInfo.badge,
      },
    });

    // Create karma log entry
    // @ts-expect-error - Types may need regeneration after schema changes
    await prisma.skillKarmaLog.create({
      data: {
        userId,
        pointsChanged: karmaPoints,
        reason: "CANCELLATION",
        collaborationRequestId,
        description: "Cancelled a collaboration session",
      },
    });
  } catch (error) {
    console.error(`Error updating karma for cancellation for user ${userId}:`, error);
    // Don't throw - continue even if karma update fails
  }
}