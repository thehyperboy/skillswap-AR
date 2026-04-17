import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/moderation";

// Cast prisma to any due to Prisma client generation issues with AdminAction model
const db = prisma as any;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const adminId = searchParams.get("adminId");
    const targetUserId = searchParams.get("targetUserId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (targetUserId) {
      where.targetUserId = targetUserId;
    }

    // Get total count
    const total = await db.adminAction.count({ where });

    // Get actions with admin and target user info
    const actions = await db.adminAction.findMany({
      where,
      include: {
        admin: {
          select: { id: true, email: true, name: true },
        },
        targetUser: {
          select: { id: true, email: true, name: true },
        },
        targetReport: {
          select: {
            id: true,
            reason: true,
            status: true,
            reportedUser: {
              select: { email: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        actions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.error("Admin actions retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    // Get admin stats
    const stats = await Promise.all([
      db.adminAction.count(),
      db.report.count({ where: { status: "PENDING" } }),
      db.user.count({ where: { isSuspended: true } }),
      db.user.count({ where: { isFlagged: true } }),
      db.report.count({ where: { status: "RESOLVED" } }),
    ]);

    return NextResponse.json(
      {
        totalActions: stats[0],
        pendingReports: stats[1],
        suspendedUsers: stats[2],
        flaggedUsers: stats[3],
        resolvedReports: stats[4],
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.error("Stats retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
