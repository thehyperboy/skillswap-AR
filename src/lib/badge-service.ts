import { prisma } from "@/lib/prisma";
import { calculateEarnedBadges } from "@/lib/badges";

/**
 * Check if user has earned any new badges and award them
 */
export async function awardBadges(userId: string) {
  try {
    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skillKarma: true,
        reviewsReceived: true,
      },
    });

    if (!user || !user.skillKarma) {
      return { awarded: [] };
    }

    // Check profile completion
    const profileComplete =
      !!user.profile?.displayName &&
      !!user.profile?.bio &&
      !!user.profile?.city &&
      !!user.profile?.latitude;

    // Calculate earned badges
    const earnedBadges = calculateEarnedBadges({
      completedSessionCount: user.skillKarma.completedSessionCount,
      averageRating: user.skillKarma.averageRating,
      totalReviewsReceived: user.skillKarma.totalReviewsReceived,
      level: user.skillKarma.level,
      profileComplete,
    });

    // Get already awarded badges
    const currentBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeName: true },
    });

    const currentBadgeNames = currentBadges.map((b) => b.badgeName);

    // Find new badges
    const newBadges = earnedBadges.filter((b) => !currentBadgeNames.includes(b));

    // Award new badges
    for (const badgeName of newBadges) {
      // @ts-expect-error - UserBadge model may not be in Prisma types yet
      await prisma.userBadge.create({
        data: {
          userId,
          badgeName,
        },
      });
    }

    return { awarded: newBadges };
  } catch (error) {
    console.error("Error awarding badges:", error);
    return { awarded: [] };
  }
}

/**
 * Get user badges
 */
export async function getUserBadges(userId: string) {
  try {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });

    return badges.map((b) => b.badgeName);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
}
