'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface UserCardProps {
  userId: string;
  displayName: string;
  city?: string;
  locality?: string;
  distance?: number;
  collaborationMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  karmaBadge: string;
  karmaBadgeEmoji: string;
  level: number;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  trustScore: number;
}

export function UserCard({
  userId,
  displayName,
  city,
  locality,
  distance,
  collaborationMode,
  karmaBadge,
  karmaBadgeEmoji,
  level,
  averageRating,
  totalReviews,
  completedSessions,
  trustScore,
}: UserCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg hover:border-brand/30 transition overflow-hidden relative group">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand/10 to-transparent rounded-bl-3xl group-hover:from-brand/20 transition"></div>

      <div className="relative space-y-4">
        {/* Header with Avatar */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-brand to-[#2a6f3b] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal">{displayName}</h3>
              <p className="text-sm text-slate-500">
                {city && `${city}`}
                {locality && `, ${locality}`}
              </p>
            </div>
          </div>
          {/* Karma Badge */}
          <div className="text-right">
            <p className="text-2xl">{karmaBadgeEmoji}</p>
            <p className="text-xs font-bold text-brand">L{level}</p>
          </div>
        </div>

        {/* Location & Distance */}
        {distance !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>📍</span>
            <span className="font-medium">{distance.toFixed(1)} km away</span>
          </div>
        )}

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={
              collaborationMode === 'ONLINE'
                ? 'info'
                : collaborationMode === 'OFFLINE'
                  ? 'success'
                  : 'warning'
            }
            className="text-xs"
          >
            {collaborationMode === 'ONLINE'
              ? '💻'
              : collaborationMode === 'OFFLINE'
                ? '👥'
                : '🔄'}{' '}
            {collaborationMode}
          </Badge>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50">
          <div className="text-center">
            <p className="text-xs text-slate-600">Rating</p>
            <p className="text-sm font-bold text-yellow-600">
              {averageRating.toFixed(1)}★
            </p>
          </div>
          <div className="text-center border-l border-r border-slate-200">
            <p className="text-xs text-slate-600">Reviews</p>
            <p className="text-sm font-bold text-charcoal">{totalReviews}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-600">Sessions</p>
            <p className="text-sm font-bold text-green-600">{completedSessions}</p>
          </div>
        </div>

        {/* Trust Score Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Trust Score</p>
            <p className="text-xs font-bold text-slate-600">{trustScore}%</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
              style={{ width: `${trustScore}%` }}
            ></div>
          </div>
        </div>

        {/* View Profile Button */}
        <Link href={`/profile/${userId}`} className="block">
          <button className="w-full py-2 px-3 rounded-lg bg-brand text-white font-medium text-sm hover:bg-[#2a6f3b] transition">
            View Profile
          </button>
        </Link>
      </div>
    </Card>
  );
}
