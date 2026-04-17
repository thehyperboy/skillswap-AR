'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardInsightsProps {
  points: number;
  level: number;
  badge: string;
  badgeEmoji: string;
  completedSessions: number;
  averageRating: number;
  reviewsReceived: number;
  profileCompletion: number;
  nextMilestone?: string;
  pointsToNextLevel: number;
}

export function DashboardInsights({
  points,
  level,
  badge,
  badgeEmoji,
  completedSessions,
  averageRating,
  reviewsReceived,
  profileCompletion,
  nextMilestone,
  pointsToNextLevel,
}: DashboardInsightsProps) {
  return (
    <div className="space-y-8">
      {/* Karma Level Card */}
      <Card className="p-8 bg-gradient-to-br from-brand/10 to-brand-soft/5 border-2 border-brand-soft">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              🎯 Your SkillKarma Journey
            </h2>
            <p className="text-slate-600 mb-6">
              You&apos;re a {badge.toLowerCase()} with {points} total karma points
            </p>

            {/* Next Level Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Progress to Level {level + 1}
                </span>
                <Badge variant="info">{points} / {points + pointsToNextLevel}</Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-brand to-green-500 transition-all duration-500"
                  style={{
                    width: `${Math.min((pointsToNextLevel === 0 ? 100 : 0), 100)}%`,
                  }}
                ></div>
              </div>
              {pointsToNextLevel > 0 && (
                <p className="text-xs text-slate-500">
                  {pointsToNextLevel} points until {getNextLevelName(level + 1)}
                </p>
              )}
            </div>
          </div>

          {/* Large Badge Display */}
          <div className="text-center">
            <p className="text-6xl mb-2">{badgeEmoji}</p>
            <p className="text-2xl font-bold text-brand">L{level}</p>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sessions */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Sessions Completed</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-green-600">{completedSessions}</p>
            <p className="text-xs text-green-700 font-medium">
              {getMilestoneLabel(completedSessions)}
            </p>
          </div>
          <div className="mt-4 p-2 rounded bg-green-100 text-xs text-green-700">
            💡 Keep collaborating to earn more badges!
          </div>
        </Card>

        {/* Rating */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Average Rating</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            <p className="text-xs text-yellow-700 font-medium">{reviewsReceived} reviews</p>
          </div>
          <div className="mt-4 p-2 rounded bg-yellow-100 text-xs text-yellow-700">
            ⭐ Maintain quality interactions
          </div>
        </Card>

        {/* Reviews */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Reviews Received</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-blue-600">{reviewsReceived}</p>
            {reviewsReceived < 3 && (
              <p className="text-xs text-blue-700 font-medium">{3 - reviewsReceived} to unlock</p>
            )}
          </div>
          <div className="mt-4 p-2 rounded bg-blue-100 text-xs text-blue-700">
            📝 Complete collaborations to get reviews
          </div>
        </Card>

        {/* Profile */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <p className="text-xs text-slate-600 font-medium mb-2">Profile Completion</p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-4xl font-bold text-purple-600">{profileCompletion}%</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full bg-purple-600 transition-all"
              style={{ width: `${profileCompletion}%` }}
            ></div>
          </div>
          <Link href="/onboarding" className="block">
            <div className="p-2 rounded bg-purple-100 text-xs text-purple-700 font-medium text-center hover:bg-purple-200 transition cursor-pointer">
              ⚙️ Complete profile
            </div>
          </Link>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 border-2 border-slate-200">
        <h3 className="text-lg font-bold text-charcoal mb-4">🚀 Ways to Grow</h3>
        <div className="space-y-3">
          {completedSessions < 5 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-xl">🎯</span>
              <div className="flex-1">
                <p className="font-medium text-charcoal">Reach 5 Collaborations</p>
                <p className="text-sm text-slate-600">
                  {5 - completedSessions} more to earn your "Five Exchangers" badge
                </p>
              </div>
              <Badge variant="info">{completedSessions}/5</Badge>
            </div>
          )}

          {averageRating < 4.5 && reviewsReceived > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <span className="text-xl">⭐</span>
              <div className="flex-1">
                <p className="font-medium text-charcoal">Improve Rating to 4.5+</p>
                <p className="text-sm text-slate-600">
                  Focus on quality interactions to earn the "Trusted Teacher" badge
                </p>
              </div>
              <Badge variant="warning">{averageRating.toFixed(1)}/4.5</Badge>
            </div>
          )}

          {profileCompletion < 100 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <span className="text-xl">✅</span>
              <div className="flex-1">
                <p className="font-medium text-charcoal">Complete Your Profile</p>
                <p className="text-sm text-slate-600">
                  Unlock the "Complete Profile" badge and appear higher in discovery
                </p>
              </div>
              <Badge variant="neutral">{profileCompletion}%</Badge>
            </div>
          )}

          {level < 3 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <span className="text-xl">📈</span>
              <div className="flex-1">
                <p className="font-medium text-charcoal">Reach CRAFTSMAN Level</p>
                <p className="text-sm text-slate-600">
                  Earn {300 - points} more points to reach Level 3 and unlock new features
                </p>
              </div>
              <Badge variant="success">{points}/300</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Get milestone label for session count
 */
function getMilestoneLabel(sessions: number): string {
  if (sessions >= 50) return '👑 50+ Legend';
  if (sessions >= 25) return '🌟 25+ Pillar';
  if (sessions >= 10) return '📚 10+ Seasoned';
  if (sessions >= 5) return '🎯 5+ Explorer';
  return '🌱 Newcomer';
}

/**
 * Get next level name
 */
function getNextLevelName(level: number): string {
  const names: Record<number, string> = {
    2: 'Apprentice',
    3: 'Craftsman',
    4: 'Expert',
    5: 'Master',
  };
  return names[level] || 'Master';
}
