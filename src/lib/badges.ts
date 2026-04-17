/**
 * Badge definitions and utilities
 */

export type BadgeCategory = 'MILESTONE' | 'QUALITY' | 'ENGAGEMENT' | 'GROWTH' | 'COMMUNITY';

export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: BadgeCategory;
  criteria: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

/**
 * Predefined badges for the platform
 */
export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  // Milestone badges
  FIRST_FIVE: {
    id: 'FIRST_FIVE',
    name: 'Five Exchangers',
    icon: '🎯',
    description: 'Completed 5 skill exchanges',
    category: 'MILESTONE',
    criteria: 'completedSessionCount >= 5',
    rarity: 'common',
  },
  TEN_STRONG: {
    id: 'TEN_STRONG',
    name: 'Seasoned Teacher',
    icon: '📚',
    description: 'Completed 10 skill exchanges',
    category: 'MILESTONE',
    criteria: 'completedSessionCount >= 10',
    rarity: 'uncommon',
  },
  QUARTER_CENTURY: {
    id: 'QUARTER_CENTURY',
    name: 'Quarter Century Club',
    icon: '🌟',
    description: 'Completed 25 skill exchanges',
    category: 'MILESTONE',
    criteria: 'completedSessionCount >= 25',
    rarity: 'rare',
  },
  HALF_CENTURY: {
    id: 'HALF_CENTURY',
    name: 'Community Pillar',
    icon: '👑',
    description: 'Completed 50 skill exchanges',
    category: 'MILESTONE',
    criteria: 'completedSessionCount >= 50',
    rarity: 'epic',
  },

  // Quality badges
  TRUSTED: {
    id: 'TRUSTED',
    name: 'Trusted Teacher',
    icon: '✨',
    description: 'Maintained 4.5+ average rating across 5+ reviews',
    category: 'QUALITY',
    criteria: 'averageRating >= 4.5 AND totalReviewsReceived >= 5',
    rarity: 'uncommon',
  },
  EXCELLENT: {
    id: 'EXCELLENT',
    name: 'Excellent Reputation',
    icon: '🏆',
    description: 'Maintained 4.8+ average rating across 10+ reviews',
    category: 'QUALITY',
    criteria: 'averageRating >= 4.8 AND totalReviewsReceived >= 10',
    rarity: 'rare',
  },
  FLAWLESS: {
    id: 'FLAWLESS',
    name: 'Perfect Record',
    icon: '💎',
    description: 'Achieved 5.0 average rating',
    category: 'QUALITY',
    criteria: 'averageRating === 5.0 AND totalReviewsReceived >= 3',
    rarity: 'epic',
  },

  // Engagement badges
  PROFILE_COMPLETE: {
    id: 'PROFILE_COMPLETE',
    name: 'Complete Profile',
    icon: '✅',
    description: 'Filled out all profile information',
    category: 'ENGAGEMENT',
    criteria: 'profile.displayName AND profile.bio AND profile.city AND profile.latitude',
    rarity: 'common',
  },
  RESPONSIVE: {
    id: 'RESPONSIVE',
    name: 'Quick Responder',
    icon: '⚡',
    description: 'Consistently responds quickly to requests',
    category: 'ENGAGEMENT',
    criteria: 'profile complete AND high engagement rate',
    rarity: 'uncommon',
  },

  // Growth badges
  RISING_STAR: {
    id: 'RISING_STAR',
    name: 'Rising Star',
    icon: '🚀',
    description: 'Reached CRAFTSMAN level (Level 3)',
    category: 'GROWTH',
    criteria: 'level >= 3',
    rarity: 'uncommon',
  },
  MASTER_TEACHER: {
    id: 'MASTER_TEACHER',
    name: 'Master Teacher',
    icon: '⭐',
    description: 'Reached EXPERT level (Level 4)',
    category: 'GROWTH',
    criteria: 'level >= 4',
    rarity: 'rare',
  },
  LEGEND: {
    id: 'LEGEND',
    name: 'Legend',
    icon: '👑',
    description: 'Reached MASTER level (Level 5)',
    category: 'GROWTH',
    criteria: 'level >= 5',
    rarity: 'legendary',
  },

  // Community badges
  EARLY_ADOPTER: {
    id: 'EARLY_ADOPTER',
    name: 'Early Adopter',
    icon: '🎪',
    description: 'Part of SkillSwap AR from the beginning',
    category: 'COMMUNITY',
    criteria: 'createdAt in first month',
    rarity: 'rare',
  },
};

/**
 * Get all badges for a user based on their stats
 */
export function calculateEarnedBadges(userStats: {
  completedSessionCount: number;
  averageRating: number;
  totalReviewsReceived: number;
  level: number;
  profileComplete: boolean;
}): string[] {
  const earned: string[] = [];

  // Milestone badges
  if (userStats.completedSessionCount >= 5) earned.push('FIRST_FIVE');
  if (userStats.completedSessionCount >= 10) earned.push('TEN_STRONG');
  if (userStats.completedSessionCount >= 25) earned.push('QUARTER_CENTURY');
  if (userStats.completedSessionCount >= 50) earned.push('HALF_CENTURY');

  // Quality badges
  if (userStats.averageRating >= 4.5 && userStats.totalReviewsReceived >= 5) {
    earned.push('TRUSTED');
  }
  if (userStats.averageRating >= 4.8 && userStats.totalReviewsReceived >= 10) {
    earned.push('EXCELLENT');
  }
  if (userStats.averageRating === 5.0 && userStats.totalReviewsReceived >= 3) {
    earned.push('FLAWLESS');
  }

  // Engagement badges
  if (userStats.profileComplete) {
    earned.push('PROFILE_COMPLETE');
  }

  // Growth badges
  if (userStats.level >= 3) earned.push('RISING_STAR');
  if (userStats.level >= 4) earned.push('MASTER_TEACHER');
  if (userStats.level >= 5) earned.push('LEGEND');

  return earned;
}

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS[badgeId];
}

/**
 * Get all badges in a category
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return Object.values(BADGE_DEFINITIONS).filter((badge) => badge.category === category);
}

/**
 * Get rarity color for badge
 */
export function getRarityColor(rarity: string): string {
  const rarityColors: Record<string, string> = {
    common: 'text-slate-600 bg-slate-100',
    uncommon: 'text-green-700 bg-green-100',
    rare: 'text-blue-700 bg-blue-100',
    epic: 'text-purple-700 bg-purple-100',
    legendary: 'text-yellow-700 bg-yellow-100',
  };
  return rarityColors[rarity] || rarityColors.common;
}

/**
 * Get rarity border color
 */
export function getRarityBorder(rarity: string): string {
  const rarityBorders: Record<string, string> = {
    common: 'border-slate-300',
    uncommon: 'border-green-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300',
  };
  return rarityBorders[rarity] || rarityBorders.common;
}
