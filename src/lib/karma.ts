/**
 * Karma Badge definitions
 */
export enum KarmaBadge {
  NOVICE = "NOVICE",
  APPRENTICE = "APPRENTICE",
  CRAFTSMAN = "CRAFTSMAN",
  EXPERT = "EXPERT",
  MASTER = "MASTER",
}

/**
 * Karma points calculation rules
 */
export const KARMA_RULES = {
  COLLABORATION_COMPLETED: 50,          // Base points for completing a session
  POSITIVE_REVIEW_EXCELLENT: 30,        // 5-star review
  POSITIVE_REVIEW_GOOD: 15,              // 4-star review
  NEGATIVE_REVIEW: -20,                  // Poor reviews (below 3 stars)
  CANCELLATION: -25,                     // Cancelling a collaboration
  PROFILE_COMPLETION: 10,                // Completing profile
};

/**
 * SkillKarma badges and their thresholds
 */
export const KARMA_LEVELS = {
  NOVICE: { minPoints: 0, badge: KarmaBadge.NOVICE, level: 1, description: "Just getting started" },
  APPRENTICE: { minPoints: 100, badge: KarmaBadge.APPRENTICE, level: 2, description: "Building confidence" },
  CRAFTSMAN: { minPoints: 300, badge: KarmaBadge.CRAFTSMAN, level: 3, description: "Skilled contributor" },
  EXPERT: { minPoints: 600, badge: KarmaBadge.EXPERT, level: 4, description: "Trusted mentor" },
  MASTER: { minPoints: 1000, badge: KarmaBadge.MASTER, level: 5, description: "Community leader" },
};

/**
 * Calculate karma level and badge based on points
 */
export function calculateKarmaLevel(points: number): {
  level: number;
  badge: KarmaBadge;
  description: string;
} {
  if (points >= KARMA_LEVELS.MASTER.minPoints) {
    return {
      level: KARMA_LEVELS.MASTER.level,
      badge: KARMA_LEVELS.MASTER.badge,
      description: KARMA_LEVELS.MASTER.description,
    };
  }
  if (points >= KARMA_LEVELS.EXPERT.minPoints) {
    return {
      level: KARMA_LEVELS.EXPERT.level,
      badge: KARMA_LEVELS.EXPERT.badge,
      description: KARMA_LEVELS.EXPERT.description,
    };
  }
  if (points >= KARMA_LEVELS.CRAFTSMAN.minPoints) {
    return {
      level: KARMA_LEVELS.CRAFTSMAN.level,
      badge: KARMA_LEVELS.CRAFTSMAN.badge,
      description: KARMA_LEVELS.CRAFTSMAN.description,
    };
  }
  if (points >= KARMA_LEVELS.APPRENTICE.minPoints) {
    return {
      level: KARMA_LEVELS.APPRENTICE.level,
      badge: KARMA_LEVELS.APPRENTICE.badge,
      description: KARMA_LEVELS.APPRENTICE.description,
    };
  }
  return {
    level: KARMA_LEVELS.NOVICE.level,
    badge: KARMA_LEVELS.NOVICE.badge,
    description: KARMA_LEVELS.NOVICE.description,
  };
}

/**
 * Calculate average rating from individual category ratings
 */
export function calculateAverageRating(
  communicationRating: number,
  punctualityRating: number,
  teachingRating: number,
  overallRating: number
): number {
  const avg = (communicationRating + punctualityRating + teachingRating + overallRating) / 4;
  return Math.round(avg * 10) / 10;
}

/**
 * Get badge emoji for karma level
 */
export function getBadgeEmoji(badge: KarmaBadge): string {
  const emojiMap: Record<KarmaBadge, string> = {
    [KarmaBadge.NOVICE]: "🌱",
    [KarmaBadge.APPRENTICE]: "📚",
    [KarmaBadge.CRAFTSMAN]: "🎯",
    [KarmaBadge.EXPERT]: "⭐",
    [KarmaBadge.MASTER]: "👑",
  };
  return emojiMap[badge] || "⭐";
}

/**
 * Get karma points change description
 */
export function getKarmaChangeDescription(
  reason: string,
  pointsChanged: number
): string {
  const reasonMap: Record<string, string> = {
    COLLABORATION_COMPLETED: "Completed a skill exchange session",
    POSITIVE_REVIEW: "Received a positive review",
    NEGATIVE_REVIEW: "Received a negative review",
    CANCELLATION: "Cancelled a collaboration",
    PROFILE_COMPLETION: "Completed profile setup",
  };
  return `${reasonMap[reason] || reason} (${pointsChanged > 0 ? '+' : ''}${pointsChanged} points)`;
}
