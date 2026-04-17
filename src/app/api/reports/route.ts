import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireNotSuspended } from "@/lib/moderation";
import { z } from "zod";

const reportSchema = z.object({
  reportedUserId: z.string().cuid("Invalid user ID"),
  contentType: z.enum(["USER_PROFILE", "COLLABORATION_REQUEST", "REVIEW", "MESSAGE"]),
  contentId: z.string(),
  reason: z.enum([
    "HARASSMENT",
    "SCAM_OR_FRAUD",
    "INAPPROPRIATE_CONTENT",
    "SEXUAL_CONTENT",
    "OFFENSIVE_LANGUAGE",
    "SPAM",
    "MISREPRESENTATION",
    "NO_SHOW",
    "OTHER",
  ]),
  description: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is suspended
    await requireNotSuspended(session.user.id);

    // Parse and validate request
    const body = await request.json();
    const data = reportSchema.parse(body);

    // Prevent self-reporting
    if (data.reportedUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report yourself" },
        { status: 400 }
      );
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: data.reportedUserId },
      select: { id: true },
    });

    if (!reportedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already reported by this user (prevent duplicate reports within 7 days)
    const existingReport = await prisma.report.findFirst({
      where: {
        reportedUserId: data.reportedUserId,
        reporterId: session.user.id,
        contentType: data.contentType,
        contentId: data.contentId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content recently" },
        { status: 400 }
      );
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reportedUserId: data.reportedUserId,
        reporterId: session.user.id,
        contentType: data.contentType,
        contentId: data.contentId,
        reason: data.reason,
        description: data.description,
        status: "PENDING",
      },
      include: {
        reportedUser: {
          select: { id: true, email: true, name: true },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Your account has been suspended") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error("Report creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's own reports (what they submitted)
    const reports = await prisma.report.findMany({
      where: {
        reporterId: session.user.id,
      },
      include: {
        reportedUser: {
          select: { id: true, email: true, name: true },
        },
        resolvedBy: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error("Report retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
