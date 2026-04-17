# Phase 9 Implementation Guide - EXACT COMMANDS

## Step-by-Step Execution

### Step 1: Regenerate Prisma Client
The schema has been updated with Review, SkillKarma, and SkillKarmaLog models.

```bash
npm run prisma:generate
```

**What this does**: Regenerates Prisma Client to match the schema. This is required before running the app.

---

### Step 2: Run Database Migration
Create a new migration to add the new tables and enums to your database.

```bash
npm run prisma:migrate
```

**Prompts you'll see**:
- "Enter a name for this migration" → Type: `add_reviews_karma_system` or just press Enter
- Creates migration file in `prisma/migrations/`
- Applies migration to your database

**What this does**: 
- Creates Review table
- Creates SkillKarmaLog table  
- Adds KarmaReason enum
- Adds KarmaBadge enum
- Updates User model relations

---

### Step 3: Verify Database Schema
Open Prisma Studio to visually inspect the database:

```bash
npm run prisma:studio
```

**Visual Checks**:
- [ ] Can see User model with skillKarma and karmaLogs relations
- [ ] Can see Review model with all 5 rating fields
- [ ] Can see SkillKarma model with points, level, badge fields
- [ ] Can see SkillKarmaLog model with transactional entries
- [ ] No errors in the console

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
info - Creating an optimized production build...
✓ Build completed
```

**If you see errors**:
- Clear cache: `rm -rf .next`
- Regenerate Prisma: `npm run prisma:generate`
- Try build again: `npm run build`

---

### Step 5: Start Development Server
Launch the app with hot reload:

```bash
npm run dev
```

**Expected output**:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
```

---

## Testing Phase 9 End-to-End

### Test 1: User Signup & Karma Initialization

1. **Open** `http://localhost:3000/signup`
2. **Sign up** as User A
   - Email: `tester1@example.com`
   - Password: `Test123!@#`
   - Name: `Tester One`
3. **Verify**: Check Prisma Studio → SkillKarma table
   - Should have new record with `points: 0, level: 1, badge: NOVICE`

### Test 2: Add Skills to Profiles

**User A**:
1. Go to `/onboarding`
2. Add 1-2 skills you can teach
3. Add 1-2 skills you want to learn
4. Save

**User B** (signup another account):
1. Repeat signup and onboarding with different email
2. Add complementary skills (opposite of User A)

### Test 3: Send & Accept Collaboration Request

1. **User A**: Go to `/explore`
2. **Find User B** and click their profile
3. **Click** "Send Request" → Select skill → Send message → Submit
4. **User B**: Go to `/requests/inbox`
5. **Click** "Accept" on the pending request
6. ✅ **Verify**: Request now shows "✓ Accepted" status

### Test 4: Mark Collaboration Complete (Karma +50 each)

1. **User A** or **User B**: Go to `/requests/inbox`
2. **Click** "✓ Mark Complete"
   - You should see success toast: "Collaboration marked as complete! You can now review."
3. **Verify in Prisma Studio**:
   - SkillKarma for both users should have `points: 50, level: 1` (still NOVICE)
   - SkillKarmaLog should have 2 new entries (one per user) with `reason: COLLABORATION_COMPLETED`

### Test 5: Submit Review (Karma adjustment based on rating)

1. **User A**: Click "⭐ Leave Review"
   - You're now at `/reviews/submit/[collaborationRequestId]`
2. **Rate the experience**:
   - Communication: 5 stars
   - Punctuality: 5 stars
   - Teaching/Helpfulness: 5 stars
   - Overall: 5 stars
3. **Add comment**: "Great experience learning from them!"
4. **Choose not anonymous** (so we can see who reviewed)
5. **Click** "Submit Review"

**Expected Result**:
- Toast: "Review submitted! Karma updated."
- Reviewing user (A) gets no karma change (only reviewee gets it)
- Reviewed user (B) gets +30 bonus (50 completion + 30 for 5-star = 80 total)

### Test 6: Verify Karma Update on Reviewed User

1. **User B**: Go to `/profile/[userBId]` (or click profile link)
2. **Check SkillKarmaCard**:
   - Points should be `80` (50 completion + 30 bonus)
   - Level should still be `1`
   - Badge should be `🌱 NOVICE`
   - Average Rating should be `5.0`
3. **Check ReviewDisplay**:
   - Should show the review you just submitted
   - Should show category ratings: 5★ for each
   - Should show the comment you wrote
   - Should show reviewer name (not anonymous)

### Test 7: Submit 2nd Review with Lower Rating

1. **User B** (reviewing User A):
   - Go to `/requests/inbox` → Find the completed request
   - Click "⭐ Leave Review"
2. **Rate poorly**:
   - Communication: 2 stars
   - Punctuality: 2 stars
   - Teaching/Helpfulness: 3 stars
   - Overall: 2 stars
3. **Add comment**: "Wasn't as helpful as expected"
4. **Submit review**

**Expected Result**:
- Toast: "Review submitted! Karma updated."
- User A's karma should DECREASE by 20 points (below 3-star average)
- User A's SkillKarmaLog shows `reason: NEGATIVE_REVIEW`

### Test 8: Check Karma History API

1. **User A**: Open browser DevTools (F12)
2. **Go to Console** and run:
   ```javascript
   const res = await fetch('/api/karma');
   const data = await res.json();
   console.log(data);
   ```
3. **Verify output shows**:
   ```json
   {
     "karma": {
       "points": 30,
       "level": 1,
       "badge": "NOVICE",
       "completedSessions": 1,
       "averageRating": 2
     },
     "recentActivity": [
       {
         "points": -20,
         "reason": "NEGATIVE_REVIEW",
         "description": "..."
       },
       {
         "points": 50,
         "reason": "COLLABORATION_COMPLETED",
         "description": "..."
       }
    ]
   }
   ```

### Test 9: Check Public Profile Karma History

1. **User A**: Visit User B's profile
2. **Open DevTools** (F12) and run:
   ```javascript
   const res = await fetch('/api/karma/[userBId]/history');
   const data = await res.json();
   console.log(data);
   ```
3. **Verify**: Shows User B's karma and complete history

### Test 10: Try to Submit Duplicate Review (Should Fail)

1. **User A**: Try to review User B again
2. **Try to go to** `/reviews/submit/[same-collaborationRequestId]`
3. **Expected**: Should see error message "Review Already Submitted"

---

## Verification Checklist

### Database
- [ ] `npm run prisma:migrate` completes successfully
- [ ] Prisma Studio shows Review, SkillKarma, SkillKarmaLog tables
- [ ] New users get SkillKarma record on signup
- [ ] New users have `points: 0, level: 1, badge: NOVICE`

### Frontend
- [ ] Profile pages show SkillKarmaCard with score, level, badge
- [ ] Profile pages show ReviewDisplay with all reviews
- [ ] Category ratings show in each review (4 star displays)
- [ ] Review form works with all 4 category ratings

### APIs
- [ ] POST /api/reviews creates review and updates karma
- [ ] GET /api/reviews?userId=X returns user's reviews
- [ ] GET /api/karma returns current user's karma
- [ ] GET /api/karma/[userId]/history returns public history
- [ ] PATCH /api/requests/[id] with "COMPLETED" adds karma

### Business Logic
- [ ] Completion adds +50 to both participants
- [ ] 5-star review adds +30 bonus to reviewed user
- [ ] 4-star review adds +15 bonus to reviewed user
- [ ] Below 3-star review subtracts -20 to reviewed user
- [ ] Cancellation subtracts -25 from canceller
- [ ] Cannot review before completion
- [ ] Cannot review twice for same collaboration
- [ ] Cannot review as non-participant

### Karma Progression
- [ ] 0-99 points = NOVICE (🌱)
- [ ] 100-299 points = APPRENTICE (📚)
- [ ] 300-599 points = CRAFTSMAN (🎯)
- [ ] 600-999 points = EXPERT (⭐)
- [ ] 1000+ points = MASTER (👑)

---

## Troubleshooting

### Error: "SkillKarma model not found in Prisma"
```bash
npm run prisma:generate
npm run build
```

### Error: "Review table doesn't exist"
```bash
npm run prisma:migrate
# This creates the new tables
```

### Error: "Cannot POST /api/reviews"
1. Check that review-form.tsx is using correct endpoint
2. Verify reviews.ts validator exists
3. Ensure review API route.ts exists

### Error: "Karma not updating on complete"
1. Check that `/api/requests/[id]/route.ts` has updated karma functions
2. Verify SkillKarmaLog is being created
3. Run migrations if new fields missing

### Blank SkillKarmaCard
1. Verify user has SkillKarma record: `prisma studio`
2. Ensure profile page passes correct props
3. Check browser console for errors (F12)

### Review form won't submit
1. Open DevTools → Network tab
2. Check POST /api/reviews response
3. Look for validation errors in response
4. Verify collaborationRequestId is correct

---

## Files Modified/Created

### New Files
- ✨ `src/app/api/karma/route.ts` - Get current user's karma
- ✨ `src/app/api/karma/[userId]/history/route.ts` - Get any user's karma history
- ✅ `PHASE_9_COMPLETED.md` - Complete documentation

### Updated Files
- 🔄 `src/app/api/requests/[id]/route.ts` - Added karma update functions
- ✅ Prisma schema already had Review, SkillKarma, SkillKarmaLog models

### Existing Components (No Changes Needed)
- ✓ `src/components/reviews/review-form.tsx`
- ✓ `src/components/reviews/review-display.tsx`
- ✓ `src/components/reviews/skill-karma-card.tsx`
- ✓ `src/lib/karma.ts`
- ✓ `src/lib/validators/reviews.ts`

---

## Performance Considerations

### Database Indexes
Already added in schema:
- Review: indexed on `reviewedId`, `reviewerId`, `collaborationRequestId`
- SkillKarmaLog: indexed on `userId, createdAt` and `collaborationRequestId`

### Query Optimization
- Reviews use `include` to fetch reviewer info once
- SkillKarma fetched with single query per user
- Limits on SkillKarmaLog prevents loading huge arrays

### Caching Opportunities (Future)
- Cache karma stats per user (invalidate on review)
- Cache average ratings (recalculate on new review)
- Cache user profiles with karma included

---

## Next: What to Do After Phase 9

1. **Seed meaningful data** for testing
2. **Stress test** with many reviews/users
3. **Add messaging** (Phase 10)
4. **Implement disputes** system
5. **Add verification badges**
6. **Create karma perks** (badges unlock features)

---

## Success Message 🎉

Phase 9 is complete when:
✅ New users auto-get SkillKarma on signup
✅ Collaborations award +50 points to both when completed
✅ Reviews update karma based on quality
✅ Profiles show karma with badge and level
✅ Review history is transparent and queryable
✅ All business rules enforced (no duplicates, etc.)

You now have a complete trust and reputation system for SkillSwap AR! 🏆
