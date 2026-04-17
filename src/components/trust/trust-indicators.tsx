'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TrustIndicatorsProps {
  karmaBadge: string; // e.g., "NOVICE", "EXPERT"
  karmaBadgeEmoji: string;
  level: number;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  compact?: boolean;
}

export function TrustIndicators({
  karmaBadge,
  karmaBadgeEmoji,
  level,
  averageRating,
  totalReviews,
  completedSessions,
  compact = false,
}: TrustIndicatorsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="info" className="text-xs">
          {karmaBadgeEmoji} L{level}
        </Badge>
        <Badge variant="success" className="text-xs">
          ⭐ {averageRating.toFixed(1)}
        </Badge>
        <Badge variant="neutral" className="text-xs">
          ✓ {completedSessions}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Karma Level */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-brand-soft/30 to-transparent border border-brand-soft/30">
        <div>
          <p className="text-xs text-slate-600 font-medium">Karma Level</p>
          <p className="text-sm font-bold text-charcoal">
            {karmaBadgeEmoji} {karmaBadge}
          </p>
        </div>
        <p className="text-2xl font-bold text-brand">L{level}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <div>
          <p className="text-xs text-slate-600 font-medium">Rating</p>
          <p className="text-sm font-bold text-charcoal">{totalReviews} reviews</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
          <p className="text-xs text-yellow-700">out of 5</p>
        </div>
      </div>

      {/* Completions */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
        <div>
          <p className="text-xs text-slate-600 font-medium">Experience</p>
          <p className="text-sm font-bold text-charcoal">Sessions</p>
        </div>
        <p className="text-2xl font-bold text-green-600">{completedSessions}</p>
      </div>

      {/* Trust Score */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-slate-600">Trust Score</p>
          <p className="text-sm font-bold text-charcoal">
            {calculateTrustScore(level, averageRating, completedSessions)}%
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${calculateTrustScore(level, averageRating, completedSessions)}%`,
            }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {getTrustLabel(calculateTrustScore(level, averageRating, completedSessions))}
        </p>
      </div>
    </div>
  );
}

/**
 * Calculate a trust score (0-100) based on multiple factors
 */
function calculateTrustScore(
  level: number,
  averageRating: number,
  completedSessions: number
): number {
  // Level contributes up to 30 points (5 levels * 6 points each)
  const levelScore = Math.min(level * 6, 30);

  // Rating contributes up to 50 points (5 stars * 10 points each)
  const ratingScore = averageRating * 10;

  // Sessions contribute up to 20 points (capped at 10 sessions)
  const sessionScore = Math.min(completedSessions * 2, 20);

  return Math.round(levelScore + ratingScore + sessionScore);
}

/**
 * Get trust label based on score
 */
function getTrustLabel(score: number): string {
  if (score < 20) return 'Just getting started';
  if (score < 40) return 'Building trust';
  if (score < 60) return 'Established member';
  if (score < 80) return 'Highly trusted';
  return 'Community leader';
}
