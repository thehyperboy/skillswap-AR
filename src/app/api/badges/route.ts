import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/badges
 * Get current user's badges
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

    // Get user's badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    });

    return NextResponse.json({
      badges: badges.map((b) => ({
        name: b.badgeName,
        earnedAt: b.earnedAt,
      })),
      count: badges.length,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
