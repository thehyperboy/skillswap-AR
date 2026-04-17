# Phase 10 Integration Guide

This guide shows exactly how to integrate Phase 10 components into existing pages.

## 1. Update Dashboard Page (`src/app/dashboard/page.tsx`)

### What to Add
Import and use DashboardInsights component to replace basic stats cards with beautiful growth insights.

### Location in File
Add this import at the top:
```typescript
import { DashboardInsights } from '@/components/dashboard/dashboard-insights';
import { getBadgeEmoji } from '@/lib/karma';
```

### Replace Section
Find the "Quick Stats Grid" section (around line 30-50) and replace with:

```tsx
{/* Dashboard Insights - Growth & Recommendations */}
<DashboardInsights
  points={user.skillKarma?.points ?? 0}
  level={user.skillKarma?.level ?? 1}
  badge={user.skillKarma?.badge ?? 'NOVICE'}
  badgeEmoji={getBadgeEmoji(user.skillKarma?.badge ?? 'NOVICE')}
  completedSessions={user.skillKarma?.completedSessionCount ?? 0}
  averageRating={user.skillKarma?.averageRating ?? 5.0}
  reviewsReceived={user.skillKarma?.totalReviewsReceived ?? 0}
  profileCompletion={(() => {
    const profile = user.profile;
    if (!profile) return 0;
    const fields = [
      !!profile.displayName,
      !!profile.bio,
      !!profile.city,
      !!profile.latitude,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })()}
  pointsToNextLevel={Math.max(0, getPointsForLevel(user.skillKarma?.level ?? 1 + 1) - (user.skillKarma?.points ?? 0))}
/>
```

### Helper Function to Add
Add this at the bottom of the file:
```typescript
function getPointsForLevel(level: number): number {
  const points: Record<number, number> = {
    1: 0, 2: 100, 3: 300, 4: 600, 5: 1000,
  };
  return points[Math.min(level, 5)] || 0;
}
```

---

## 2. Update Profile Page (`src/app/profile/[userId]/page.tsx`)

### What to Add
Import and use CredibilityPanel and BadgeShowcase components for beautiful profile credibility display.

### Imports to Add
```typescript
import { CredibilityPanel } from '@/components/trust/credibility-panel';
import { BadgeShowcase } from '@/components/badges/badge-showcase';
import { getUserBadges } from '@/lib/badge-service';
import { getBadgeEmoji } from '@/lib/karma';
```

### Fetch User Badges
Update the `ProfilePage` function to fetch badges:

```typescript
export default async function ProfilePage({ params }: ProfilePageProps) {
  // ... existing code ...

  // Add this line after fetching user data:
  const userBadges = user ? await getUserBadges(user.id) : [];

  // ... rest of existing code ...
}
```

### Add Credibility Panel
Find the Main Content Grid section (around line 45) and add this BEFORE the stats cards:

```tsx
{/* Credibility Panel - Detailed Trust & Badges */}
<div className="lg:col-span-3 mb-8">
  <CredibilityPanel
    userId={user.id}
    displayName={user.profile?.displayName || user.name || 'User'}
    karmaBadge={karma.badge}
    karmaBadgeEmoji={getBadgeEmoji(karma.badge)}
    points={karma.points}
    level={karma.level}
    averageRating={karma.averageRating}
    totalReviews={user.reviewsReceived.length}
    completedSessions={karma.completedSessionCount}
    trustScore={calculateTrustScore(
      karma.level,
      karma.averageRating,
      karma.completedSessionCount
    )}
    emailVerified={user.emailVerified}
    profileComplete={
      !!user.profile?.displayName &&
      !!user.profile?.bio &&
      !!user.profile?.city &&
      !!user.profile?.latitude
    }
    joined={user.createdAt}
  />
</div>
```

### Add Badge Showcase
In the left column after SkillKarmaCard, add:

```tsx
{/* Earned Badges */}
{userBadges.length > 0 && (
  <BadgeShowcase
    badges={userBadges}
    showTitle={true}
    showRarity={true}
    compact={false}
  />
)}
```

### Helper Function
Add at the bottom of the file:
```typescript
function calculateTrustScore(
  level: number,
  averageRating: number,
  completedSessions: number
): number {
  const levelScore = Math.min(level * 6, 30);
  const ratingScore = averageRating * 10;
  const sessionScore = Math.min(completedSessions * 2, 20);
  return Math.round(levelScore + ratingScore + sessionScore);
}
```

---

## 3. Update Explore Page (`src/app/explore/page.tsx`)

### What to Add
Replace basic user cards with UserCard component that shows trust indicators and scores.

### Imports to Add
```typescript
import { UserCard } from '@/components/users/user-card';
import { getBadgeEmoji } from '@/lib/karma';
```

### Replace User Card Section
Find the user card rendering section in the grid (around line 80-120) and replace with:

```tsx
{filteredUsers.map((user) => {
  const trustScore = calculateTrustScore(
    user.karmaBadge?.level || 1,
    user.karmaBadge?.averageRating || 5.0,
    user.karmaBadge?.completedSessionCount || 0
  );

  return (
    <UserCard
      key={user.userId}
      userId={user.userId}
      displayName={user.displayName}
      city={user.city}
      locality={user.locality}
      distance={user.distanceKm}
      collaborationMode={user.collaborationMode}
      karmaBadge={user.karmaBadge?.badge || 'NOVICE'}
      karmaBadgeEmoji={getBadgeEmoji(user.karmaBadge?.badge || 'NOVICE')}
      level={user.karmaBadge?.level || 1}
      averageRating={user.karmaBadge?.averageRating || 5.0}
      totalReviews={user.karmaBadge?.totalReviewsReceived || 0}
      completedSessions={user.karmaBadge?.completedSessionCount || 0}
      trustScore={trustScore}
    />
  );
})}
```

### Update NearbyUser Interface
Update the interface to include karma data:

```typescript
interface NearbyUser {
  userId: string;
  displayName: string;
  city?: string;
  locality?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  collaborationMode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  locationPrivacy: 'PUBLIC' | 'APPROXIMATE' | 'PRIVATE';
  karmaBadge?: {
    badge: string;
    level: number;
    averageRating: number;
    totalReviewsReceived: number;
    completedSessionCount: number;
  };
}
```

### Update API Fetch
Update the `/api/nearby` endpoint to return karma data (if not already included).

### Helper Function
Add at the bottom:
```typescript
function calculateTrustScore(
  level: number,
  averageRating: number,
  completedSessions: number
): number {
  const levelScore = Math.min(level * 6, 30);
  const ratingScore = averageRating * 10;
  const sessionScore = Math.min(completedSessions * 2, 20);
  return Math.round(levelScore + ratingScore + sessionScore);
}
```

---

## 4. Optional: Create a Badges Gallery Page

Create a new page to showcase all badges and their earning criteria:

```bash
# File: src/app/badges/page.tsx
```

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { BADGE_DEFINITIONS, BadgeCategory } from '@/lib/badges';
import { getRarityColor, getRarityBorder } from '@/lib/badges';

const categories: BadgeCategory[] = ['MILESTONE', 'QUALITY', 'ENGAGEMENT', 'GROWTH', 'COMMUNITY'];

export default function BadgesPage() {
  return (
    <div className="space-y-12 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-charcoal">🏅 Achievement Badges</h1>
        <p className="text-slate-600">Earn badges by completing collaborations and maintaining high standards</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-2xl font-bold text-charcoal">
            {getCategoryEmoji(category)} {category} Badges
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(BADGE_DEFINITIONS)
              .filter((badge) => badge.category === category)
              .map((badge) => (
                <Card key={badge.id} className={`p-6 border-2 ${getRarityBorder(badge.rarity)}`}>
                  <div className="text-center space-y-3">
                    <p className="text-4xl">{badge.icon}</p>
                    <h3 className="text-lg font-bold text-charcoal">{badge.name}</h3>
                    <p className="text-sm text-slate-600">{badge.description}</p>
                    <div className={`inline-block px-3 py-1 rounded ${getRarityColor(badge.rarity)}`}>
                      <p className="text-xs font-semibold capitalize">{badge.rarity}</p>
                    </div>
                    <p className="text-xs text-slate-600 italic">Criteria: {badge.criteria}</p>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getCategoryEmoji(category: BadgeCategory): string {
  const emojis: Record<BadgeCategory, string> = {
    MILESTONE: '🎯',
    QUALITY: '✨',
    ENGAGEMENT: '⚡',
    GROWTH: '📈',
    COMMUNITY: '👥',
  };
  return emojis[category];
}
```

---

## 5. Call Badge Awarding Function

### When to Award Badges
Badges should be checked and awarded after:
1. Profile update
2. Review submission
3. Collaboration completion

### In Review API (`src/app/api/reviews/route.ts`)

Add at the end of the review submission:
```typescript
// Award badges if earned
await awardBadges(reviewedUserId);
```

Import:
```typescript
import { awardBadges } from '@/lib/badge-service';
```

### In Requests API (`src/app/api/requests/[id]/route.ts`)

Add when marking complete:
```typescript
// Award badges for both participants
await awardBadges(collaborationRequest.senderId);
await awardBadges(collaborationRequest.recipientId);
```

Import:
```typescript
import { awardBadges } from '@/lib/badge-service';
```

---

## 6. Type Updates

Make sure to add `@ts-expect-error` comments where needed for Prisma types:

```typescript
// For badge fields that may not be in older Prisma types
const badges = await prisma.userBadge.findMany({
  where: { userId },
  // @ts-expect-error - UserBadge may not be in older Prisma types
});
```

---

## Testing Integration

1. **Dashboard**: Login, verify insights with recommendations
2. **Profile**: View own profile, see credibility panel and badges
3. **Explore**: View other profiles, see trust scores
4. **Badges**: Complete profiles and collaborations to earn badges

---

## Summary of Changes

| Page | Change | Component | Status |
|------|--------|-----------|--------|
| Dashboard | Replace stats | DashboardInsights | 📝 Optional |
| Profile | Add credibility | CredibilityPanel | ✅ Recommended |
| Profile | Add badges | BadgeShowcase | ✅ Recommended |
| Explore | Enhance cards | UserCard | ✅ Recommended |
| New | Badges gallery | - | 📝 Optional |
| Reviews API | Call awarding | awardBadges() | ✅ Required |
| Requests API | Call awarding | awardBadges() | ✅ Required |

---

**Integration Priority**: 
1. ✅  Add to Profile (highest impact)
2. ✅ Add to Explore (visible to others)
3. ✅ Call awardBadges in APIs (earn logic)
4. 📝 Add to Dashboard (personal)
5. 📝 Add badges gallery (informational)
