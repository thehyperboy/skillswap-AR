import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/moderation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // "suspended", "flagged", "all"
    const search = searchParams.get("search"); // Search by email or name
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {
      NOT: {
        id: session.user.id, // Don't show self
      },
    };

    if (status === "suspended") {
      where.isSuspended = true;
    } else if (status === "flagged") {
      where.isFlagged = true;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { profile: { displayName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
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
            city: true,
          },
        },
        skillKarma: {
          select: {
            points: true,
            level: true,
            badge: true,
            averageRating: true,
            totalReviewsReceived: true,
          },
        },
        _count: {
          select: {
            reviewsReceived: true,
            reportsReceived: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        users,
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

    console.error("Users retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
