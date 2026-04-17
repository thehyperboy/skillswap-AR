'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface CredibilityPanelProps {
  userId: string;
  displayName: string;
  karmaBadge: string;
  karmaBadgeEmoji: string;
  points: number;
  level: number;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  trustScore: number;
  email?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  joined?: Date;
}

export function CredibilityPanel({
  userId,
  displayName,
  karmaBadge,
  karmaBadgeEmoji,
  points,
  level,
  averageRating,
  totalReviews,
  completedSessions,
  trustScore,
  email,
  emailVerified,
  profileComplete,
  joined,
}: CredibilityPanelProps) {
  const nextLevel = level < 5 ? level + 1 : 5;
  const nextLevelPoints = getPointsForLevel(nextLevel);
  const currentLevelPoints = getPointsForLevel(level);
  const progressToNextLevel = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
      <div className="space-y-8">
        {/* Main Credibility Badge */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="text-7xl mb-3">{karmaBadgeEmoji}</div>
            <h2 className="text-2xl font-bold text-charcoal">{karmaBadge} (Level {level})</h2>
            <p className="text-sm text-slate-600 mt-1">{getCredibilityDescription(level)}</p>
          </div>
        </div>

        {/* Trust Score Gauge */}
        <div className="p-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Overall Trust Score</h3>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">{trustScore}</p>
              <p className="text-xs text-slate-600">/ 100</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-green-400 to-green-600"
              style={{ width: `${trustScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-700 mt-3 font-medium">{getTrustBadge(trustScore)}</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Karma Points */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-2">Karma Points</p>
            <p className="text-3xl font-bold text-blue-600">{points}</p>
            <p className="text-xs text-blue-700 mt-1">Total earned</p>
          </div>

          {/* Sessions Completed */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-2">Sessions</p>
            <p className="text-3xl font-bold text-green-600">{completedSessions}</p>
            <p className="text-xs text-green-700 mt-1">Collaborations</p>
          </div>

          {/* Average Rating */}
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-2">Rating</p>
            <p className="text-3xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
            <p className="text-xs text-yellow-700 mt-1">Out of 5</p>
          </div>

          {/* Total Reviews */}
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-2">Reviews</p>
            <p className="text-3xl font-bold text-purple-600">{totalReviews}</p>
            <p className="text-xs text-purple-700 mt-1">Received</p>
          </div>
        </div>

        {/* Level Progress */}
        {level < 5 && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-charcoal">Progress to Next Level</p>
              <Badge variant="info">
                {points}/{nextLevelPoints}
              </Badge>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-400 to-blue-600"
                style={{ width: `${Math.min(progressToNextLevel, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              {Math.round(nextLevelPoints - points)} points until {getNextLevelName(level)}
            </p>
          </div>
        )}

        {/* Verification & Profile Status */}
        <div className="grid grid-cols-2 gap-3">
          {/* Email Verification */}
          <div
            className={`p-4 rounded-lg border-2 flex items-center justify-between ${
              emailVerified
                ? 'bg-green-50 border-green-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-600 font-medium">Email</p>
              <p className={`text-sm font-semibold ${emailVerified ? 'text-green-700' : 'text-slate-600'}`}>
                {emailVerified ? 'Verified ✓' : 'Unverified'}
              </p>
            </div>
            <span className="text-2xl">{emailVerified ? '✅' : '⚠️'}</span>
          </div>

          {/* Profile Status */}
          <div
            className={`p-4 rounded-lg border-2 flex items-center justify-between ${
              profileComplete
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div>
              <p className="text-xs text-slate-600 font-medium">Profile</p>
              <p className={`text-sm font-semibold ${profileComplete ? 'text-green-700' : 'text-amber-700'}`}>
                {profileComplete ? 'Complete ✓' : 'Incomplete'}
              </p>
            </div>
            <span className="text-2xl">{profileComplete ? '⭐' : '📝'}</span>
          </div>
        </div>

        {/* Member Since */}
        {joined && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p className="text-xs text-slate-600 font-medium mb-1">Member Since</p>
            <p className="text-lg font-semibold text-charcoal">
              {new Date(joined).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {getMonthsSince(joined)} months active
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Get credibility description for level
 */
function getCredibilityDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Getting started in the community',
    2: 'Building experience and trust',
    3: 'Skilled and reliable contributor',
    4: 'Highly trusted mentor',
    5: 'Community leader and expert',
  };
  return descriptions[level] || '';
}

/**
 * Get trust badge label
 */
function getTrustBadge(score: number): string {
  if (score < 20) return '🌱 New Community Member';
  if (score < 40) return '🔵 Building Trust';
  if (score < 60) return '🟢 Established Member';
  if (score < 80) return '⭐ Highly Trusted';
  return '👑 Community Leader';
}

/**
 * Get points required for level
 */
function getPointsForLevel(level: number): number {
  const points: Record<number, number> = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
  };
  return points[level] || 0;
}

/**
 * Get next level name
 */
function getNextLevelName(level: number): string {
  const names: Record<number, string> = {
    1: 'Apprentice',
    2: 'Craftsman',
    3: 'Expert',
    4: 'Master',
    5: 'Master',
  };
  return names[level] || '';
}

/**
 * Calculate months since joined
 */
function getMonthsSince(date: Date): number {
  const now = new Date();
  const joined = new Date(date);
  const diffTime = Math.abs(now.getTime() - joined.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
}
