import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/karma/[userId]/history
 * Get karma history and current stats for a user (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get karma stats
    const karma = await prisma.skillKarma.findUnique({
      where: { userId: params.userId },
    });

    if (!karma) {
      return NextResponse.json({ error: "User karma record not found" }, { status: 404 });
    }

    // Get karma history (last 50 entries)
    const history = await prisma.skillKarmaLog.findMany({
      where: { userId: params.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      karma: {
        points: karma.points,
        level: karma.level,
        badge: karma.badge,
        completedSessions: karma.completedSessionCount,
        averageRating: karma.averageRating,
        totalReviews: karma.totalReviewsReceived,
      },
      history: history.map((log: any) => ({
        points: log.pointsChanged,
        reason: log.reason,
        description: log.description,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching karma history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
