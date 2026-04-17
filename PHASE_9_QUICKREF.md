# Phase 9 Quick Reference

## 🎯 What You're Building
A **reputation system** where users review each other after collaborations, building visible **SkillKarma** scores that increase community trust.

## 📊 Data Flow
```
User A → Sends collaboration request → User B accepts
         ↓
User A marks COMPLETE → +50 karma to both
         ↓
User A reviews User B → Review quality determines karma change
         ├─ 5 star: +30 points → User B now has 80 points
         ├─ 4 star: +15 points
         ├─ 2 star: -20 points (negative review)
         └─ Logged in SkillKarmaLog for transparency
         ↓
User B's profile shows:
  ├─ SkillKarmaCard (🎯 CRAFTSMAN, Level 3, 320 points)
  ├─ ReviewDisplay (all reviews with category ratings)
  └─ Average rating (4.8 stars from 5 reviews)
```

## 🗄️ Database Changes
**Three new models**:
1. `Review` - Store reviews with 4 category ratings + comment
2. `SkillKarma` - Store karma score, level, badge per user
3. `SkillKarmaLog` - Log every karma transaction for transparency

**Three new enums**:
1. `KarmaReason` - COLLABORATION_COMPLETED | POSITIVE_REVIEW | NEGATIVE_REVIEW | CANCELLATION
2. `KarmaBadge` - NOVICE | APPRENTICE | CRAFTSMAN | EXPERT | MASTER

## 🔧 API Endpoints (New/Updated)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/reviews` | Submit review for collaboration |
| GET | `/api/reviews?userId=X` | Get all reviews for user |
| GET | `/api/reviews/[id]/can-review` | Check if can review |
| GET | `/api/karma` | Get current user's karma |
| GET | `/api/karma/[userId]/history` | Get user's karma history |
| PATCH | `/api/requests/[id]` | Mark complete → triggers karma |

## 📋 Point System

| Event | Points | Who Gets It? |
|-------|--------|-------------|
| Collaboration Completed | +50 | BOTH participants |
| Receive 5-star review | +30 | Only reviewed user |
| Receive 4-star review | +15 | Only reviewed user |
| Receive <3-star review | -20 | Only reviewed user |
| Cancel collaboration | -25 | Canceller only |

## 🏆 Karma Levels

| Level | Badge | Points | Milestone |
|-------|-------|--------|-----------|
| 1 | 🌱 | 0 | Just starting |
| 2 | 📚 | 100 | Building trust |
| 3 | 🎯 | 300 | Skilled member |
| 4 | ⭐ | 600 | Trusted expert |
| 5 | 👑 | 1000 | Community leader |

## ✅ Review Requirements
- ✅ Can review when collaboration is `COMPLETED`
- ✅ Only reviewer & reviewee can review
- ❌ Can't review twice same collaboration (unique constraint)
- ❌ Can't review someone else's collaboration
- ❌ Can't review before completion

## 📦 Files Changed

**New:**
- `src/app/api/karma/route.ts`
- `src/app/api/karma/[userId]/history/route.ts`
- `PHASE_9_COMPLETED.md`
- `PHASE_9_SETUP.md`

**Updated:**
- `src/app/api/requests/[id]/route.ts` (added karma functions)

**Already existed (no changes):**
- Review/karma components (form, display, card)
- Review APIs (submission, retrieval)
- Karma calculations
- Profile page integration

## 🚀 5-Minute Setup

```bash
# 1. Regenerate Prisma client
npm run prisma:generate

# 2. Apply database schema
npm run prisma:migrate
# → Creates tables, runs migrations

# 3. Verify database
npm run prisma:studio
# → Open browser, check tables exist

# 4. Build
npm run build

# 5. Run
npm run dev
```

## 🧪 Quick Test

1. Sign up as User A
2. Sign up as User B
3. User A sends collaboration request to User B
4. User B accepts
5. User A marks COMPLETED
   - Check Prisma Studio: Both users should have 50 points
6. User A submits 5-star review of User B
   - Check: User B now has 80 points (50 + 30 bonus)
7. Check `/api/karma` endpoint
   - Should show karma stats and activity log

## 🎯 Key Features Delivered

| Feature | Status | Evidence |
|---------|--------|----------|
| Category Ratings (4 types) | ✅ | Review form shows 4 star inputs |
| Anonymous Reviews | ✅ | Checkbox in review form |
| Review Comments | ✅ | 1000 char text field |
| No Duplicates | ✅ | Unique constraint + API checks |
| Karma Points | ✅ | Points increase per rules |
| Karma Levels | ✅ | Calculated from points |
| Karma Badges | ✅ | visual(emoji, NOVICE-MASTER) |
| Review Display | ✅ | Shows category breakdown |
| Karma Card | ✅ | Shows score, level, progress |
| Karma History | ✅ | API endpoint with all events |
| Profile Integration | ✅ | Karma card on every profile |
| Abuse Prevention | ✅ | Unique review, requires completion |

## 💡 Business Logic Highlights

### Positive Reinforcement
- Completing collaboration rewards both users
- Good reviews (4-5 stars) bonus points
- Encourages genuine participation

### Negative Consequences
- Poor reviews (-20 points) discourage low-quality participation
- Cancellations (-25 points) prevent request spam
- Transparent logs show why karma changed

### Trust Building
- Higher karma = higher reputation
- Badge progression shows growth
- Visible review history = transparent accountability
- Average rating on profile proves quality

## 🔍 Validation Rules

**Review Submission Validations**:
- Ratings must be 1-5 (enforced by Zod schema)
- Comment must be <1000 chars
- Collaboration must exist
- Collaboration must be COMPLETED
- User must be participant
- No duplicate review can exist

**Karma Calculations**:
- Points never go below 0 on cancellation
- Level auto-updates when threshold crossed
- Badge updates match new level
- Average rating recalculated per new review

## 📈 Scaling Considerations

- SkillKarmaLog indexed on `(userId, createdAt)` for efficient history queries
- Review queries filtered by `reviewedId` for fast lookups
- Average rating recalculated incrementally
- Badge calculation is O(1) - just point lookup

## 🎓 One Schema, Many Features

The same Review model powers:
1. **Individual reviews display** on profile
2. **Average rating calculation**  
3. **Karma adjustments** on submission
4. **Review eligibility checks** before submission
5. **Duplicate prevention** via unique constraint  
6. **User matching** (who reviewed whom)

## 🏁 What's Complete

**Core Reputation System**: ✅
- Score-based (points)
- Level progression (1-5)
- Badge progression (emojis)
- Transparent logging

**Review System**: ✅
- Multi-dimensional ratings (4 categories)
- Optional anonymity
- Comments + feedback
- Duplicate prevention

**Integration**: ✅
- Auto-karma on completion
- Auto-karma on review
- Profile displays
- History APIs

## 🎉 Result

Users now have:
- ✨ Visible reputation (karma score + badge)
- 📊 Proof of quality (average rating + reviews)
- 🔗 Trust signals (completed collaborations + badges)
- 📜 Transparent history (all karma events logged)
- 😊 Incentives to be good (points, badges, levels)

Phase 9 transforms SkillSwap AR from a simple request system into a **trusted community marketplace**! 🚀
