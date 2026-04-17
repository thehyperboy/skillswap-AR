import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Check if user is an admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return false;
    userId = session.user.id;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Check if user is suspended
 */
export async function isSuspended(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuspended: true, suspendedUntil: true },
  });

  if (!user?.isSuspended) return false;

  // Check if suspension has expired
  if (user.suspendedUntil && user.suspendedUntil < new Date()) {
    // Unsuspend automatically if duration has passed
    await prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedUntil: null,
      },
    });
    return false;
  }

  return true;
}

/**
 * Suspend a user for moderation
 */
export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string,
  durationDays?: number
): Promise<void> {
  const suspendedUntil = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null;

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      isSuspended: true,
      suspensionReason: reason,
      suspendedAt: new Date(),
      suspendedUntil,
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "SUSPENDED_USER",
      targetUserId: userId,
      reason,
      details: durationDays ? `Suspended for ${durationDays} days` : "Permanently suspended",
    },
  });
}

/**
 * Unsuspend a user
 */
export async function unsuspendUser(userId: string, adminId: string, reason: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isSuspended: false,
      suspensionReason: null,
      suspendedAt: null,
      suspendedUntil: null,
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "UNSUSPENDED_USER",
      targetUserId: userId,
      reason,
    },
  });
}

/**
 * Flag a user for review
 */
export async function flagUser(userId: string, adminId: string, flagReason: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isFlagged: true,
      flagReason,
      flaggedAt: new Date(),
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "FLAGGED_USER",
      targetUserId: userId,
      reason: flagReason,
    },
  });
}

/**
 * Unflag a user
 */
export async function unflagUser(userId: string, adminId: string, reason: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isFlagged: false,
      flagReason: null,
      flaggedAt: null,
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "UNFLAGGED_USER",
      targetUserId: userId,
      reason,
    },
  });
}

/**
 * Resolve a report
 */
export async function resolveReport(
  reportId: string,
  adminId: string,
  resolution: string,
  adminNotes?: string
): Promise<void> {
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "RESOLVED",
      resolution,
      adminNotes,
      resolvedAt: new Date(),
      resolvedById: adminId,
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "CLOSED_REPORT",
      targetReportId: reportId,
      reason: resolution,
      details: adminNotes,
    },
  });
}

/**
 * Dismiss a report
 */
export async function dismissReport(
  reportId: string,
  adminId: string,
  reason: string
): Promise<void> {
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "DISMISSED",
      resolution: `Dismissed: ${reason}`,
      resolvedAt: new Date(),
      resolvedById: adminId,
    },
  });

  // Log action
  await prisma.adminAction.create({
    data: {
      adminId,
      action: "DELETED_REPORT",
      targetReportId: reportId,
      reason,
    },
  });
}

/**
 * Get trust score calculation including suspension status
 */
export function getTrustStatus(user: {
  isSuspended: boolean;
  isFlagged: boolean;
}): "trusted" | "flagged" | "suspended" {
  if (user.isSuspended) return "suspended";
  if (user.isFlagged) return "flagged";
  return "trusted";
}

/**
 * Require admin access middleware
 */
export async function requireAdmin(userId?: string): Promise<boolean> {
  const isAdminUser = await isAdmin(userId);
  if (!isAdminUser) {
    throw new Error("Unauthorized: Admin access required");
  }
  return true;
}

/**
 * Ensure user is not suspended
 */
export async function requireNotSuspended(userId: string): Promise<boolean> {
  const suspended = await isSuspended(userId);
  if (suspended) {
    throw new Error("Your account has been suspended");
  }
  return true;
}
