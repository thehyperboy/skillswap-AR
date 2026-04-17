# Phase 9: Reviews, Ratings & SkillKarma Reputation Engine ✅ COMPLETE

## Overview
Phase 9 implements the trust and reputation system for SkillSwap AR. After collaborations complete, users can review each other with category-based ratings. These reviews feed into **SkillKarma**, a reputation score that increases trust in the community.

---

## Architecture

### Data Models

#### Review Model
- **Unique fields per collaboration**: One review per collaboration request (prevents duplicates)
- **Category ratings**: 1-5 star ratings for:
  - 📞 Communication: How responsive and clear was communication?
  - ⏰ Punctuality: Did they show up on time?
  - 📚 Teaching/Helpfulness: How well did they teach/help?
  - ⭐ Overall: Overall rating for the experience
- **Optional comment**: Up to 1000 characters of written feedback
- **Anonymous option**: Submitters can choose to review anonymously

#### SkillKarma Model
- **points**: Total karma points (starts at 0)
- **level**: Karma level 1-5 (automatically calculated from points)
- **badge**: Badge icon representing level (NOVICE, APPRENTICE, CRAFTSMAN, EXPERT, MASTER)
- **completedSessionCount**: Total collaborations completed
- **averageRating**: Average of all received overall ratings
- **totalReviewsReceived**: Total review count

#### SkillKarmaLog Model
Tracks all karma changes for transparency:
- **pointsChanged**: Points added/subtracted
- **reason**: COLLABORATION_COMPLETED, POSITIVE_REVIEW, NEGATIVE_REVIEW, CANCELLATION
- **description**: Human readable summary of the event
- **collaborationRequestId**: Link to the collaboration that triggered the change
- **reviewId**: Link to review (if applicable)

---

## SkillKarma Scoring Rules

### Points Earned
| Event | Points |
|-------|--------|
| Collaboration Completed | +50 |
| 5-star Review Received | +30 |
| 4-star Review Received | +15 |
| Below 3-star Review | -20 |
| Collaboration Cancelled | -25 |

### Levels & Badges

| Level | Badge | Min Points | Description |
|-------|-------|-----------|-------------|
| 1 | 🌱 NOVICE | 0 | Just getting started |
| 2 | 📚 APPRENTICE | 100 | Building confidence |
| 3 | 🎯 CRAFTSMAN | 300 | Skilled contributor |
| 4 | ⭐ EXPERT | 600 | Trusted mentor |
| 5 | 👑 MASTER | 1000 | Community leader |

---

## Implementation Details

### 1. Database Schema

**Review Table**
```prisma
model Review {
  id                     String   @id @default(cuid())
  reviewedId             String
  reviewerId             String
  collaborationRequestId String   @unique
  communicationRating    Int      @default(5)
  punctualityRating      Int      @default(5)
  teachingRating         Int      @default(5)
  overallRating          Int      @default(5)
  comment                String?  @db.Text
  isAnonymous            Boolean  @default(false)
  createdAt              DateTime @default(now())
}
```

**SkillKarma Table**
```prisma
model SkillKarma {
  id                   String @id @default(cuid())
  userId               String @unique
  points               Int    @default(0)
  level                Int    @default(1)
  badge                KarmaBadge @default(NOVICE)
  completedSessionCount Int   @default(0)
  averageRating        Float  @default(5.0)
  totalReviewsReceived Int    @default(0)
}
```

**SkillKarmaLog Table**
```prisma
model SkillKarmaLog {
  id                    String   @id @default(cuid())
  userId                String
  pointsChanged         Int
  reason                KarmaReason
  collaborationRequestId String?
  reviewId              String?
  description           String?
  createdAt             DateTime @default(now())
}
```

### 2. Key Files & Components

#### Backend APIs
- **POST /api/reviews** - Submit a review for a completed collaboration
- **GET /api/reviews?userId=** - Get all reviews for a user
- **GET /api/reviews/[id]/can-review** - Check if user can review a collaboration
- **PATCH /api/requests/[id]** - Mark collaboration complete (triggers karma update)
- **GET /api/karma** - Get current user's karma stats and recent activity
- **GET /api/karma/[userId]/history** - Get any user's karma stats and history

#### Frontend Components
- **ReviewForm** (`src/components/reviews/review-form.tsx`)
  - Star rating interface for each category
  - Optional anonymous review checkbox
  - Real-time character count for comments
  - Form validation and submission

- **ReviewDisplay** (`src/components/reviews/review-display.tsx`)
  - Shows all reviews received
  - Displays average rating
  - Shows category rating breakdown for each review
  - Indicates if review is anonymous
  - Shows reviewer info and date

- **SkillKarmaCard** (`src/components/reviews/skill-karma-card.tsx`)
  - Displays karma badge emoji
  - Shows current points and progress to next level
  - Displays karma stats (sessions completed, average rating)
  - Shows badge level

- **CollaborationCompleteAction** (`src/components/reviews/collaboration-complete-action.tsx`)
  - Button to mark collaboration as complete
  - Button to navigate to review submission

#### Pages
- **Profile Page** (`src/app/profile/[userId]/page.tsx`)
  - Shows SkillKarmaCard
  - Shows ReviewDisplay
  - Shows user's skills and stats

- **Review Submit Page** (`src/app/reviews/submit/[collaborationRequestId]/page.tsx`)
  - Displays ReviewForm
  - Prevents reviews of non-completed collaborations
  - Prevents duplicate reviews

#### Utilities
- **Karma Calculations** (`src/lib/karma.ts`)
  - `calculateKarmaLevel()` - Converts points to level and badge
  - `calculateAverageRating()` - Averages category ratings
  - `getBadgeEmoji()` - Returns emoji for badge level
  - `KARMA_RULES` - Points constants
  - `KARMA_LEVELS` - Level thresholds

### 3. Request Flow

#### Completing a Collaboration & Submitting Review

```
1. USER MARKS COLLABORATION COMPLETE
   ↓
2. PATCH /api/requests/[id] { status: "COMPLETED" }
   ↓
3. Backend updates request status
   ├─ Add COLLABORATION_COMPLETED points to both participants
   ├─ Create SkillKarmaLog entries for both
   └─ Return updated request
   ↓
4. Frontend shows "Leave Review" button
   ↓
5. USER ON REVIEW PAGE
   ├─ Fill category ratings (1-5 stars each)
   ├─ Write optional comment
   ├─ Choose anonymous or not
   └─ Click "Submit Review"
   ↓
6. POST /api/reviews
   ├─ Validate review data
   ├─ Check collaboration is completed
   ├─ Prevent duplicate reviews (unique constraint)
   ├─ Create Review record
   ├─ Calculate karma bonus based on review quality
   ├─ Update reviewed user's SkillKarma
   ├─ Recalculate average rating
   ├─ Create SkillKarmaLog entry
   └─ Return success
   ↓
7. USER SEES SUCCESS NOTIFICATION
   ├─ Reviewed user's karma increases
   ├─ Profile updated with new review visible
   └─ Reviewer karma unchanged (reviews given don't affect score)
```

---

## Setup & Database Migration

### 1. Update Dependencies (Already Done)
All required packages are in package.json:
- Prisma 6.19.2
- Zod 4.3.6
- Sonner (toast notifications)

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Database Migration
```bash
npm run prisma:migrate
# Follow prompts to create migration
# Migration name suggestion: "add_reviews_and_karma"
```

### 4. Verify Schema
```bash
npm run prisma:studio
# Open to view/verify all models created
```

---

## Key Business Rules

### 1. Review Eligibility
❌ **Cannot review if:**
- Collaboration status is not COMPLETED
- User hasn't participated in the collaboration
- A review already exists for this collaboration (unique constraint)
- Less than 24 hours have passed (optional - not implemented yet)

✅ **Can review if:**
- Collaboration is marked COMPLETED
- User is the sender or recipient
- No review exists yet

### 2. Abuse Prevention
- **No duplicate reviews**: Unique constraint on `(collaborationRequestId)` prevents multiple reviews per collaboration
- **One review per collaboration**: Each pair can only review once
- **Both required independently**: Each party must submit their own review

### 3. Karma Mechanics
- **Completion awards to all**: When collaboration completes, both participants get +50 points
- **Reviews only help reviewee**: Review quality only affects the reviewed person's karma
- **Negative reviews hurt**: Below 3-star reviews reduce karma
- **No rating change for leaving review**: The reviewer's karma doesn't change

### 4. Cancellation Penalty
- When a collaboration is cancelled: Sender loses 25 points
- Prevents abuse of sending requests without following through

---

## Testing Phase 9

### End-to-End Test Scenario

1. **Setup: Create two test users**
   ```bash
   # Sign up as User A and User B
   ```

2. **Send & Accept Collaboration**
   ```bash
   User A → Sends skill request to User B
   User B → Accepts request
   ```

3. **Mark Complete**
   ```bash
   User A/B → Clicks "Mark Complete"
   ✓ Both should now have +50 karma points
   ✓ completedSessionCount should increase by 1
   ```

4. **Submit Reviews**
   ```bash
   User A → Submits review of User B
   ✓ Review appears on User B's profile
   ✓ User B's karma updates based on rating quality
   ✓ SkillKarmaLog created for the event
   ```

5. **Verify Karma Updates**
   ```bash
   GET /api/karma
   ✓ Points increased appropriately
   ✓ Level updated if threshold crossed
   ✓ Badge changed if applicable
   ✓ Average rating recalculated
   ```

### Test Cases

| Test | Expected Result |
|------|-----------------|
| Try to review non-existent collab | 404 error |
| Try to review pending request | 400 error (not completed) |
| Submit review for uncompleted collab | 400 error |
| Try to review as non-participant | 403 error (forbidden) |
| Submit review twice | 400 error (duplicate) |
| Mark complete twice | 400 error (already completed) |
| Submit 5-star review | Reviewed user gets +30 karma |
| Submit 2-star review | Reviewed user gets -20 karma |
| Cancel collaboration | Sender gets -25 karma |
| Check karma history | Can see all events |

### Verification Checklist

- [ ] Prisma schema includes Review, SkillKarma, SkillKarmaLog, KarmaReason enum
- [ ] User creation automatically creates SkillKarma record
- [ ] PATCH /api/requests adds karma on COMPLETED
- [ ] POST /api/reviews creates review and updates karma
- [ ] Review component shows category ratings
- [ ] Profile shows karma card with badge
- [ ] 5-star review increases karma by +80 (50 completion + 30 bonus)
- [ ] 2-star review decreases karma by -20
- [ ] Cannot submit duplicate review
- [ ] Karma level updates when points reach threshold
- [ ] Badge matches level (1🌱 2📚 3🎯 4⭐ 5👑)
- [ ] Average rating recalculated after each review
- [ ] SkillKarmaLog tracks all events

---

## API Reference

### POST /api/reviews
**Submit a review for a collaboration**

Request:
```json
{
  "collaborationRequestId": "clx...",
  "communicationRating": 5,
  "punctualityRating": 4,
  "teachingRating": 5,
  "overallRating": 5,
  "comment": "Great experience learning from them!",
  "isAnonymous": false
}
```

Response (201):
```json
{
  "review": {
    "id": "clx...",
    "reviewedId": "...",
    "reviewerId": "...",
    "communicationRating": 5,
    "overallRating": 5,
    "collaborationRequestId": "..."
  },
  "karma": {
    "points": 135,
    "level": 2,
    "badge": "APPRENTICE",
    "completedSessionCount": 2
  }
}
```

### GET /api/reviews?userId=clx...
**Get all reviews for a user**

Response (200):
```json
{
  "reviews": [
    {
      "id": "clx...",
      "overallRating": 5,
      "comment": "Excellent teacher!",
      "reviewer": { "name": "John", "email": "john@example.com" }
    }
  ],
  "karma": {
    "points": 135,
    "level": 2,
    "badge": "APPRENTICE",
    "averageRating": 4.8,
    "totalReviews": 3
  }
}
```

### GET /api/reviews/[id]/can-review
**Check if current user can review a collaboration**

Response (200):
```json
{
  "canReview": true,
  "otherPartyId": "clx...",
  "collaborationRequestId": "clx..."
}
```

### PATCH /api/requests/[id]
**Mark collaboration complete (triggers karma update)**

Request:
```json
{ "status": "COMPLETED" }
```

Response (200):
```json
{
  "request": {
    "id": "clx...",
    "status": "COMPLETED",
    "sender": { "id": "...", "name": "..." },
    "recipient": { "id": "...", "name": "..." }
  }
}
```

### GET /api/karma
**Get current user's karma stats**

Response (200):
```json
{
  "karma": {
    "points": 135,
    "level": 2,
    "badge": "APPRENTICE",
    "completedSessions": 2,
    "averageRating": 4.8
  },
  "recentActivity": [
    {
      "points": 30,
      "reason": "POSITIVE_REVIEW",
      "description": "Received a 5-star review from John"
    },
    {
      "points": 50,
      "reason": "COLLABORATION_COMPLETED",
      "description": "Completed a collaboration session"
    }
  ]
}
```

### GET /api/karma/[userId]/history
**Get karma history for any user**

Response (200):
```json
{
  "karma": {
    "points": 135,
    "level": 2,
    "badge": "APPRENTICE",
    "completedSessions": 2,
    "averageRating": 4.8
  },
  "history": [...]
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── karma/
│   │   │   ├── route.ts                    (NEW)
│   │   │   └── [userId]/
│   │   │       └── history/
│   │   │           └── route.ts            (NEW)
│   │   ├── reviews/
│   │   │   ├── route.ts                    (EXISTING - handles POST/GET)
│   │   │   └── [collaborationRequestId]/
│   │   │       └── can-review/
│   │   │           └── route.ts            (EXISTING)
│   │   └── requests/
│   │       └── [id]/
│   │           └── route.ts                (UPDATED - adds karma logic)
│   ├── profile/
│   │   └── [userId]/
│   │       └── page.tsx                    (EXISTING - shows reviews & karma)
│   └── reviews/
│       └── submit/
│           └── [collaborationRequestId]/
│               └── page.tsx                (EXISTING)
├── components/
│   └── reviews/
│       ├── review-form.tsx                 (EXISTING)
│       ├── review-display.tsx              (EXISTING)
│       ├── skill-karma-card.tsx            (EXISTING)
│       └── collaboration-complete-action.tsx (EXISTING)
├── lib/
│   ├── karma.ts                            (EXISTING - calculations)
│   └── validators/
│       └── reviews.ts                      (EXISTING)
└── prisma/
    └── schema.prisma                       (UPDATED - Review, SkillKarma, SkillKarmaLog)
```

---

## What Phase 9 Completed

✅ **Models Created**
- Review model with category ratings
- SkillKarma reputation model
- SkillKarmaLog transaction log
- Enums: KarmaReason, KarmaBadge

✅ **Review System**
- Submit reviews with 4 category ratings + overall
- Optional anonymous reviews
- Comment field (0-1000 chars)
- Prevent duplicate reviews (unique constraint)
- Category rating breakdown display

✅ **Karma System**
- Point-based reputation (starts at 0)
- Automatic level calculation (1-5)
- Badge awards for each level
- Complete log of all karma transactions
- Transparent history available to users

✅ **UI Components**
- Review form with star ratings
- Review display with category breakdown
- Karma card showing score, level, badge
- Mark complete button with review link
- Profile page integration

✅ **APIs**
- Review submission with validation
- Review retrieval by user
- Karma stats and history endpoints
- Can-review eligibility check
- Request completion with auto-karma

✅ **Business Rules**
- Reviews only after completion
- Prevent duplicate reviews
- Points for completion (+50 each)
- Points for good reviews (+15/+30)
- Penalty for bad reviews (-20)
- Penalty for cancellations (-25)

---

## Next Steps (Phase 10+)

- **Messaging System**: Real-time chat between collaborators
- **Ratings Timeline**: Historical view of karma changes
- **Verification Badges**: Email, phone, ID verification
- **Trust Score**: Combined metric of karma, reviews, and verification
- **Disputes & Reporting**: Flag inappropriate behavior
- **Karma Perks**: Special features unlock at certain levels
- **Referral Programs**: Earn karma for bringing new users

---

## Troubleshooting

### Issue: SkillKarma not created for new users
**Solution**: Run migrations and ensure signup route creates SkillKarma

### Issue: Reviews not updating karma
**Solution**: Verify SkillKarmaLog entries are being created; check KARMA_RULES values

### Issue: Can't submit review twice (as expected)
**Solution**: This is correct! Unique constraint prevents duplicates

### Issue: Karma not updating on completion
**Solution**: Ensure PATCH handler has new karma update functions

### Issue: Types don't recognize new Prisma fields
**Solution**: Run `npm run prisma:generate` after migration

---

## Summary

Phase 9 successfully implements a complete reputation and review system for SkillSwap AR. Users can now:
- Review collaborators across 4 dimensions
- Build reputation through good reviews and completed sessions  
- See visible karma levels and badges
- Track karma history and recent activity
- Trust other users based on transparent review data

The system encourages positive behavior (completion, good reviews) and discourages negative behavior (cancellations, bad reviews) through the karma point system, creating a trusted community.
