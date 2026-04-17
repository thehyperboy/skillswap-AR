# Phase 10 Setup Guide - EXACT COMMANDS

## Step-by-Step Execution

### Step 1: Regenerate Prisma Client
The schema has been updated with Badge and UserBadge models.

```bash
npm run prisma:generate
```

**What this does**: Regenerates Prisma Client to include Badge and UserBadge models.

---

### Step 2: Run Database Migration
Create a new migration to add badge tables.

```bash
npm run prisma:migrate
```

**When prompted for migration name**, enter: `add_badges_and_credibility`

**What this does**:
- Creates Badge table
- Creates UserBadge table
- Adds BadgeCategory enum
- Links User to badges

---

### Step 3: Verify Database Schema
Open Prisma Studio to inspect the new tables:

```bash
npm run prisma:studio
```

**Visual Checks**:
- [ ] Badge table exists with columns: id, name, description, icon, category, criteria
- [ ] UserBadge table exists with columns: id, userId, badgeName, earnedAt
- [ ] BadgeCategory enum has: MILESTONE, QUALITY, ENGAGEMENT, GROWTH, COMMUNITY
- [ ] No errors in console

Press `Ctrl+C` to exit Prisma Studio.

---

### Step 4: Build the Project
Compile TypeScript and verify no errors:

```bash
npm run build
```

**Expected output**:
```
✓ Compiled successfully
```

**If you see errors**:
- Clear cache: `rm -rf .next`
- Regenerate: `npm run prisma:generate`
- Rebuild: `npm run build`

---

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
```

---

## Testing Phase 10

### Test 1: Explore Page with Trust Indicators

1. Start the server: `npm run dev`
2. Go to http://localhost:3000/explore
3. **Verify**:
   - [ ] User cards show trust indicators (trust score %)
   - [ ] Shows level, rating, sessions, reviews
   - [ ] Hover on badges shows tooltips
   - [ ] Colors match (green for trust, yellow for rating, etc.)

### Test 2: Profile Page with Credibility Panel

1. Click on any user to view their profile
2. **Verify**:
   - [ ] See large emoji badge at top (🎯🎪⭐👑)
   - [ ] Trust score gauge shows 0-100
   - [ ] Key metrics displayed (points, sessions, rating, reviews)
   - [ ] Verification status shows (email confirmed?)
   - [ ] Level progress bar visible
   - [ ] Earned badges displayed below

### Test 3: Dashboard Insights

1. Login to your account
2. Go to http://localhost:3000/dashboard
3. **Verify**:
   - [ ] See your karma level with emoji
   - [ ] Progress to next level shows correctly
   - [ ] 4 metric cards showing (sessions, rating, reviews, profile%)
   - [ ] Growth recommendations shown
   - [ ] Recommendations have correct icons and descriptions

### Test 4: Complete Profile to Earn Badge

1. From dashboard, click "Complete Profile"
2. Fill in missing profile info (bio, city, etc.)
3. Save
4. **Verify in Prisma Studio**:
   - [ ] UserBadge table has new entry with badgeName: "PROFILE_COMPLETE"
   - [ ] Go back to profile
   - [ ] ✅ badges section now shows ✅ Complete Profile badge

### Test 5: Complete 5 Collaborations to Earn Milestone Badge

1. **Create test collaborations** (using API or UI):
   - Send 5 collaboration requests
   - Accept them
   - Mark complete
2. **Verify in Prisma Studio**:
   - [ ] SkillKarma.completedSessionCount = 5
   - [ ] UserBadge table has entry with badgeName: "FIRST_FIVE"
3. **Check profile**:
   - [ ] 🎯 Five Exchangers badge visible

### Test 6: Get High Rating to Earn Quality Badge

1. **After last test, get reviewed**:
   - User B reviews User A with 5 stars
   - Multiple reviews to maintain 4.5+ rating
2. **Verify**:
   - [ ] UserBadge shows "TRUSTED" badge
   - [ ] Profile displays ✨ Trusted Teacher badge

### Test 7: Check APIs

**Terminal 2** (keep dev server running in Terminal 1):

```bash
# Test getting current user's badges
curl -s http://localhost:3000/api/badges | jq .

# Test getting public user badges
curl -s http://localhost:3000/api/badges/[userId] | jq .
```

**Expected response**:
```json
{
  "badges": [
    { "name": "PROFILE_COMPLETE", "earnedAt": "2024-04-10T..." },
    { "name": "FIRST_FIVE", "earnedAt": "2024-04-10T..." }
  ],
  "count": 2
}
```

---

## Verification Checklist

### Database ✓
- [ ] Badge table created
- [ ] UserBadge table created
- [ ] BadgeCategory enum exists
- [ ] User.badges relation created
- [ ] Unique constraint on (userId, badgeName)

### Components ✓
- [ ] BadgeShowcase renders without errors
- [ ] TrustIndicators component works
- [ ] CredibilityPanel displays properly
- [ ] UserCard shows in explore
- [ ] DashboardInsights renders

### Trust Score Calculation ✓
- [ ] Score formula: (level × 6) + (rating × 10) + (sessions × 2)
- [ ] Score capped at 100
- [ ] Labels match ranges (Building trust, Established, etc.)

### Badge Display ✓
- [ ] Badges show correct emoji
- [ ] Tooltips appear on hover
- [ ] Rarity colors apply (common=gray, rare=blue, etc.)
- [ ] Multiple badges display in grid

### Badge Earning ✓
- [ ] PROFILE_COMPLETE earned on profile completion
- [ ] FIRST_FIVE earned at 5 sessions
- [ ] TRUSTED earned at 4.5+ rating
- [ ] RISING_STAR earned at level 3
- [ ] All badges only awarded once (no duplicates)

### UX ✓
- [ ] Explore page shows trust indicators
- [ ] Profile page shows credibility panel
- [ ] Dashboard shows growth recommendations
- [ ] All colors and icons render correctly
- [ ] Responsive on mobile

---

## Files Added/Updated

### New Files (9)
- ✨ `src/lib/badges.ts` - Badge definitions
- ✨ `src/lib/badge-service.ts` - Badge awarding logic
- ✨ `src/app/api/badges/route.ts` - Get user badges
- ✨ `src/app/api/badges/[userId]/route.ts` - Get public badges
- ✨ `src/components/badges/badge-showcase.tsx` - Badge display
- ✨ `src/components/trust/trust-indicators.tsx` - Trust metrics
- ✨ `src/components/trust/credibility-panel.tsx` - Detailed credibility
- ✨ `src/components/users/user-card.tsx` - Explore card
- ✨ `src/components/dashboard/dashboard-insights.tsx` - Dashboard progress

### Updated Files (1)
- 🔄 `prisma/schema.prisma` - Added Badge & UserBadge models

### Documentation (1)
- 📄 `PHASE_10_COMPLETED.md` - Complete feature documentation

---

## Troubleshooting

### Issue: Badge table doesn't exist
```bash
npm run prisma:migrate
# If still issues, check schema.prisma for syntax errors
```

### Issue: UserBadge relation error
```bash
# Run migrations again
npm run prisma:migrate
npm run prisma:generate
npm run build
```

### Issue: Components won't render
1. Check console for TypeScript errors
2. Verify all component imports are correct
3. Make sure package.json has all dependencies

### Issue: Badges not showing in Prisma Studio
1. Refresh browser (F5)
2. Close and reopen Prisma Studio
3. Run migration again

### Issue: API returns 404
1. Verify migration ran: `prisma:migrate`
2. Check API file exists at `src/app/api/badges/`
3. Restart dev server

---

## Integrating Into Existing Pages

### To Update Explore Page
```tsx
// In src/app/explore/page.tsx, replace user card with:
<UserCard
  userId={user.userId}
  displayName={user.displayName}
  distance={user.distanceKm}
  collaborationMode={user.collaborationMode}
  karmaBadge={user.skillKarma?.badge}
  karmaBadgeEmoji={getBadgeEmoji(user.skillKarma?.badge)}
  level={user.skillKarma?.level}
  averageRating={user.skillKarma?.averageRating}
  totalReviews={user.skillKarma?.totalReviewsReceived}
  completedSessions={user.skillKarma?.completedSessionCount}
  trustScore={calculateTrustScore(...)}
/>
```

### To Update Profile Page
```tsx
// In src/app/profile/[userId]/page.tsx, add:
<CredibilityPanel
  userId={user.id}
  displayName={user.profile?.displayName}
  karmaBadge={karma.badge}
  karmaBadgeEmoji={getBadgeEmoji(karma.badge)}
  points={karma.points}
  level={karma.level}
  averageRating={karma.averageRating}
  totalReviews={karma.totalReviewsReceived}
  completedSessions={karma.completedSessionCount}
  trustScore={calculateTrustScore(...)}
/>

<BadgeShowcase badges={userBadges} showRarity={true} />
```

### To Update Dashboard
```tsx
// In src/app/dashboard/page.tsx, add:
<DashboardInsights
  points={user.skillKarma?.points}
  level={user.skillKarma?.level}
  badge={user.skillKarma?.badge}
  badgeEmoji={getBadgeEmoji(user.skillKarma?.badge)}
  completedSessions={user.skillKarma?.completedSessionCount}
  averageRating={user.skillKarma?.averageRating}
  reviewsReceived={user.skillKarma?.totalReviewsReceived}
  profileCompletion={calculateProfileCompletion(user.profile)}
  pointsToNextLevel={getPointsToNextLevel(user.skillKarma?.level, user.skillKarma?.points)}
/>
```

---

## Environment Variables

No new environment variables needed. Everything uses existing database connection.

---

## Performance Notes

- Badge queries indexed by userId for fast lookups
- UserBadge unique constraint prevents duplicates
- Trust score calculated client-side (no DB queries needed)
- Badges lazy-load via separate API endpoint

---

## Success Message 🎉

Phase 10 is working when:
✅ Explore page shows user cards with trust scores
✅ Profile page shows credibility panel with all metrics
✅ Dashboard shows karma level and growth opportunities
✅ Badges display with proper emoji and colors
✅ Badge earning works automatically
✅ APIs return badge data correctly

You now have a **beautiful, motivating credibility system** showcasing user trust and reputation! 🏆
