import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin, suspendUser, unsuspendUser, flagUser, unflagUser } from "@/lib/moderation";
import { z } from "zod";

const suspendSchema = z.object({
  reason: z.string().min(5).max(500),
  durationDays: z.number().int().positive().optional(),
});

const flagSchema = z.object({
  reason: z.string().min(5).max(500),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuspended: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedUntil: true,
        isFlagged: true,
        flagReason: true,
        flaggedAt: true,
        createdAt: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            bio: true,
            city: true,
          },
        },
        skillKarma: {
          select: {
            points: true,
            level: true,
            badge: true,
            averageRating: true,
            completedSessionCount: true,
            totalReviewsReceived: true,
          },
        },
        _count: {
          select: {
            reviewsReceived: true,
            reportsReceived: true,
            reportsSubmitted: true,
            collaborationRequestsSent: true,
            collaborationRequestsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.error("User retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    // Get action from query
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "suspend") {
      const body = await request.json();
      const data = suspendSchema.parse(body);

      await suspendUser(params.userId, session.user.id, data.reason, data.durationDays);

      return NextResponse.json(
        { success: true, message: "User suspended successfully" },
        { status: 200 }
      );
    } else if (action === "unsuspend") {
      const body = await request.json();
      const { reason } = z.object({ reason: z.string() }).parse(body);

      await unsuspendUser(params.userId, session.user.id, reason);

      return NextResponse.json(
        { success: true, message: "User unsuspended successfully" },
        { status: 200 }
      );
    } else if (action === "flag") {
      const body = await request.json();
      const { reason } = flagSchema.parse(body);

      await flagUser(params.userId, session.user.id, reason);

      return NextResponse.json(
        { success: true, message: "User flagged successfully" },
        { status: 200 }
      );
    } else if (action === "unflag") {
      const body = await request.json();
      const { reason } = z.object({ reason: z.string() }).parse(body);

      await unflagUser(params.userId, session.user.id, reason);

      return NextResponse.json(
        { success: true, message: "User unflagged successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use ?action=suspend|unsuspend|flag|unflag" },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.error("User action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
