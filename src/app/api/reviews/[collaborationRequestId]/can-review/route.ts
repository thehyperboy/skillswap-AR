import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { collaborationRequestId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const collaboration = await prisma.collaborationRequest.findUnique({
      where: { id: params.collaborationRequestId },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: "Collaboration request not found" },
        { status: 404 }
      );
    }

    // Check if review already submitted
    const existingReview = await prisma.review.findUnique({
      where: { collaborationRequestId: params.collaborationRequestId },
    });

    // Check if user is involved in collaboration
    const isParticipant = collaboration.senderId === user.id || collaboration.recipientId === user.id;
    
    if (!isParticipant) {
      return NextResponse.json(
        {
          canReview: false,
          reason: "You are not a participant in this collaboration",
        },
        { status: 200 }
      );
    }

    // Check if collaboration is completed
    if (collaboration.status !== "COMPLETED") {
      return NextResponse.json(
        {
          canReview: false,
          reason: "Collaboration must be completed to submit a review",
          currentStatus: collaboration.status,
        },
        { status: 200 }
      );
    }

    // Check if review already submitted
    if (existingReview) {
      return NextResponse.json(
        {
          canReview: false,
          reason: "A review has already been submitted for this collaboration",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        canReview: true,
        collaborationRequestId: params.collaborationRequestId,
        otherPartyId: collaboration.senderId === user.id ? collaboration.recipientId : collaboration.senderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
