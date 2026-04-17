import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin, resolveReport, dismissReport } from "@/lib/moderation";
import { z } from "zod";

const resolveSchema = z.object({
  action: z.enum(["resolve", "dismiss", "investigate"]),
  resolution: z.string().optional(),
  adminNotes: z.string().optional(),
  reason: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
      include: {
        reportedUser: {
          select: {
            id: true,
            email: true,
            name: true,
            isSuspended: true,
            isFlagged: true,
            suspensionReason: true,
            suspendedAt: true,
            suspendedUntil: true,
          },
        },
        reporter: {
          select: { id: true, email: true, name: true },
        },
        resolvedBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Admin access required")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    console.error("Report retrieval error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await requireAdmin(session.user.id);

    const body = await request.json();
    const data = resolveSchema.parse(body);

    const report = await prisma.report.findUnique({
      where: { id: params.reportId },
      select: { id: true, status: true, reportedUserId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    let updatedReport;

    if (data.action === "resolve") {
      if (!data.resolution) {
        return NextResponse.json(
          { error: "Resolution is required" },
          { status: 400 }
        );
      }

      await resolveReport(
        params.reportId,
        session.user.id,
        data.resolution,
        data.adminNotes
      );

      updatedReport = await prisma.report.findUnique({
        where: { id: params.reportId },
        include: {
          reportedUser: { select: { id: true, email: true, name: true } },
          reporter: { select: { id: true, email: true, name: true } },
          resolvedBy: { select: { id: true, email: true, name: true } },
        },
      });
    } else if (data.action === "dismiss") {
      if (!data.reason) {
        return NextResponse.json(
          { error: "Reason is required" },
          { status: 400 }
        );
      }

      await dismissReport(params.reportId, session.user.id, data.reason);

      updatedReport = await prisma.report.findUnique({
        where: { id: params.reportId },
        include: {
          reportedUser: { select: { id: true, email: true, name: true } },
          reporter: { select: { id: true, email: true, name: true } },
          resolvedBy: { select: { id: true, email: true, name: true } },
        },
      });
    } else if (data.action === "investigate") {
      updatedReport = await prisma.report.update({
        where: { id: params.reportId },
        data: {
          status: "INVESTIGATING",
          adminNotes: data.adminNotes,
        },
        include: {
          reportedUser: { select: { id: true, email: true, name: true } },
          reporter: { select: { id: true, email: true, name: true } },
          resolvedBy: { select: { id: true, email: true, name: true } },
        },
      });
    }

    return NextResponse.json(
      { success: true, report: updatedReport },
      { status: 200 }
    );
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

    console.error("Report update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
