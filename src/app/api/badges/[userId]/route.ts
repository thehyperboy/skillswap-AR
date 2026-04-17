import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/badges/[userId]
 * Get any user's badges (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    if (!params.userId) {
      return NextResponse.json(
        { error: "userId parameter required" },
        { status: 400 }
      );
    }

    // Get user's badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: params.userId },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({
      badges: badges.map((b: any) => ({
        name: b.badgeName,
        earnedAt: b.earnedAt,
      })),
      count: badges.length,
    });
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
