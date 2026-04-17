import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/karma
 * Get current user's karma stats and recent activity
 */
export async function GET(request: NextRequest) {
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

    // Get karma stats
    const karma = await prisma.skillKarma.findUnique({
      where: { userId: user.id },
    });

    if (!karma) {
      return NextResponse.json({ error: "Karma record not found" }, { status: 404 });
    }

    // Get recent karma logs
    const recentLogs = await prisma.skillKarmaLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      karma: {
        points: karma.points,
        level: karma.level,
        // @ts-expect-error - badge may not be in old Prisma types yet
        badge: karma.badge,
        completedSessions: karma.completedSessionCount,
        // @ts-expect-error - averageRating may not be in old Prisma types yet
        averageRating: karma.averageRating,
        totalReviews: karma.totalReviewsReceived,
      },
      recentActivity: recentLogs.map((log) => ({
        id: log.id,
        points: log.pointsChanged,
        reason: log.reason,
        description: log.description,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching karma stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
