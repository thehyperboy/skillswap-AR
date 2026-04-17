# Phase 11 Integration Guide 🔗

How to integrate moderation throughout your app.

---

## Overview

Phase 11 creates the moderation infrastructure. Now you can hook it into existing features:
- Block suspended users from collaborating
- Prevent flagged users from taking key actions
- Auto-check for abuse patterns
- Surface trust indicators on profiles

---

## 1️⃣ Block Suspended Users

### Where to Add
Every API route that accepts user actions: requests, reviews, collaborations, etc.

### Add to Route Handler

**File: `src/app/api/requests/route.ts`** (or similar)

```typescript
import { requireNotSuspended } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // NEW: Check if user is suspended
    await requireNotSuspended(session.user.id);

    // ... rest of your route
  } catch (error) {
    if (error instanceof Error && error.message === "Your account has been suspended") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    // ... other error handling
  }
}
```

### Apply To:
- `POST /api/requests` - Send collaboration request
- `POST /api/requests/[id]` - Accept/decline request
- `POST /api/reviews` - Submit review
- `POST /api/profile` - Update profile
- `POST /api/messages` (if messaging exists)

---

## 2️⃣ Auto-Award Badges on Report Threshold

### Scenario
If a user receives many reports → flag them automatically

**File: `src/lib/moderation.ts`** (add function)

```typescript
export async function checkForAutoFlag(userId: string): Promise<void> {
  // Count reports against this user in last 30 days
  const reportCount = await prisma.report.count({
    where: {
      reportedUserId: userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Auto-flag if 3+ reports
  if (reportCount >= 3) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isFlagged: true },
    });

    if (!user?.isFlagged) {
      await flagUser(
        userId,
        "system", // or admin id
        `Auto-flagged: ${reportCount} reports in 30 days`
      );
    }
  }
}
```

### Call After Report Submitted
**File: `src/app/api/reports/route.ts`**

```typescript
// After creating report
const report = await prisma.report.create({...});

// Check if reported user should be auto-flagged
await checkForAutoFlag(data.reportedUserId);

return NextResponse.json({...});
```

---

## 3️⃣ Show Suspension Status in UI

### User Profile Page
**File: `src/app/profile/[userId]/page.tsx`**

```typescript
import { isSuspended } from "@/lib/moderation";

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const user = await getUser(params.userId);
  const suspended = await isSuspended(params.userId);

  return (
    <div>
      {suspended && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          <strong>⚠️ This account has been suspended</strong>
        </div>
      )}
      
      {/* rest of profile */}
    </div>
  );
}
```

### Collaboration Cards
**File: `src/app/explore/page.tsx`**

```typescript
import { User } from "@prisma/client";

function UserCard({ user }: { user: User }) {
  return (
    <Card>
      {user.isSuspended && (
        <Badge className="bg-red-100 text-red-800">🚫 Suspended</Badge>
      )}
      {user.isFlagged && (
        <Badge className="bg-orange-100 text-orange-800">⚠️ Flagged</Badge>
      )}
      {/* rest of card */}
    </Card>
  );
}
```

---

## 4️⃣ Prevent Interactions with Flagged Users

### Disable "Send Request" Button
**File: `src/components/requests/send-request-form.tsx`**

```typescript
"use client";

interface SendRequestProps {
  recipientUser: any;
}

export function SendRequestForm({ recipientUser }: SendRequestProps) {
  if (recipientUser.isSuspended) {
    return (
      <div className="p-4 bg-red-50 rounded">
        This user is currently suspended. You cannot collaborate with them.
      </div>
    );
  }

  if (recipientUser.isFlagged) {
    return (
      <div className="p-4 bg-orange-50 rounded text-sm">
        ⚠️ This user has been flagged for review. Proceed with caution.
        {/* Still allow interaction but warn */}
      </div>
    );
  }

  return <Button>Send Request</Button>;
}
```

---

## 5️⃣ Dashboard Trust Score Integration

### Show Suspension Notice
**File: `src/app/dashboard/page.tsx`**

```typescript
import { isSuspended } from "@/lib/moderation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const suspended = await isSuspended(userId);

  return (
    <div>
      {suspended && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
          <strong>Your account is temporarily suspended</strong>
          <p>Check your email for details. Suspension expires on [DATE].</p>
        </div>
      )}

      {/* rest of dashboard */}
    </div>
  );
}
```

---

## 6️⃣ Review Submission Integration

### Block Reviews from Suspended Users
**File: `src/app/api/reviews/route.ts`**

```typescript
import { requireNotSuspended } from "@/lib/moderation";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // NEW: Check suspension status
  await requireNotSuspended(session.user.id);

  // Check for excessive negative reviews (spam prevention)
  const recentNegativeReviews = await prisma.review.count({
    where: {
      reviewerId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
      },
      overallRating: { lte: 2 }, // 1 or 2 stars
    },
  });

  if (recentNegativeReviews > 3) {
    return NextResponse.json(
      { error: "Please wait before submitting more negative reviews" },
      { status: 429 }
    );
  }

  // ... rest of review submission
}
```

---

## 7️⃣ Audit Log for Key Actions

### Log Important User Actions
**File: `src/lib/moderation.ts`** (add function)

```typescript
export async function logUserAction(
  userId: string,
  actionType: string,
  details: string
): Promise<void> {
  // Optional: track user behavior for patterns
  // Could auto-flag if concerning pattern detected
  
  console.log(`[USER_ACTION] ${userId} - ${actionType}: ${details}`);
  
  // In future: Could store to analytics/logging service
}
```

### Use It:
```typescript
import { logUserAction } from "@/lib/moderation";

// After sending collaboration request
await logUserAction(session.user.id, "COLLABORATION_REQUEST", "Sent to user123");

// After receiving multiple rejections
await logUserAction(session.user.id, "MULTIPLE_REJECTIONS", "5 rejections in 2 hours");
```

---

## 8️⃣ Trust Score Display

### Add to User Cards
**File: `src/components/ui/user-card.tsx`**

```typescript
interface UserCardProps {
  user: any;
}

export function UserCard({ user }: UserCardProps) {
  // Calculate trust (from Phase 10)
  const trustScore = calculateTrustScore(user.skillKarma);

  // Adjust for moderation status
  let displayTrustScore = trustScore;
  if (user.isSuspended) {
    displayTrustScore = 0;
  } else if (user.isFlagged) {
    displayTrustScore = Math.max(0, trustScore - 20);
  }

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          {user.profile?.displayName}
          {user.isSuspended && " 🚫"}
          {user.isFlagged && " ⚠️"}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{displayTrustScore}</p>
          <p className="text-sm text-gray-600">Trust Score</p>
        </div>
      </div>
    </Card>
  );
}
```

---

## 9️⃣ Collaboration Cancellation Prevention

### Don't Penalize Suspended Users
**File: `src/app/api/requests/[id]/route.ts`**

```typescript
// When marking collaboration as cancelled
if (status === "CANCELLED") {
  const requestData = await prisma.collaborationRequest.findUnique({
    where: { id: params.id },
    include: { sender: true, recipient: true },
  });

  // Check if canceller is suspended (might be unfair penalty)
  const cancellerId = session.user.id;
  const suspended = await isSuspended(cancellerId);

  if (!suspended) {
    // Normal penalty: -25 karma
    await prisma.skillKarma.update({
      where: { userId: cancellerId },
      data: { points: { decrement: 25 } },
    });
  }
  // If suspended: no additional penalty
}
```

---

## 1️⃣0️⃣ Gradual Enforcement

### Light Touch Approach
Don't permanently ban for every report. Use progression:

```typescript
const reportCount = await prisma.report.count({
  where: { reportedUserId: userId },
});

if (reportCount === 1) {
  // Warn user via email
  sendWarningEmail(userId, "First report received");
} else if (reportCount === 3) {
  // Flag for monitoring
  await flagUser(userId, "admin", "Multiple reports");
} else if (reportCount >= 5) {
  // Temporary suspension
  await suspendUser(userId, "admin", "Multiple violations", 7);
}
```

---

## 1️⃣1️⃣ Email Notifications

### Send Suspension Notice
**File: `src/lib/moderation.ts`**

```typescript
export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string,
  durationDays?: number
): Promise<void> {
  // ... existing suspension code ...

  // Send email notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (user) {
    const until = durationDays
      ? `${durationDays} days`
      : "indefinitely";

    sendEmail({
      to: user.email,
      subject: "Account Suspension Notice",
      body: `Your account has been suspended until ${until} for the following reason: ${reason}`,
    });
  }
}
```

---

## 1️⃣2️⃣ Checklist for Integration

### Minimum Integration
- [ ] Add `requireNotSuspended()` to API routes
- [ ] Show suspension badge on profiles
- [ ] Block collaboration requests to/from suspended users
- [ ] Test suspension blocking

### Full Integration
- [ ] Add all from above
- [ ] Log user actions for patterns
- [ ] Auto-flag on report threshold
- [ ] Gradual enforcement policy
- [ ] Email notifications
- [ ] Trust score adjustments
- [ ] Prevent spam reviews
- [ ] Monitor multiple rejections

---

## 🚀 Quick Integration Checklist

```bash
# 1. Add to collaboration requests
# File: src/app/api/requests/route.ts
await requireNotSuspended(session.user.id);

# 2. Add to reviews
# File: src/app/api/reviews/route.ts
await requireNotSuspended(session.user.id);

# 3. Add to profile updates
# File: src/app/api/profile/route.ts
await requireNotSuspended(session.user.id);

# 4. Display in profiles
# File: src/app/profile/[userId]/page.tsx
show suspension badge

# 5. Display in explore page
# File: src/app/explore/page.tsx
show suspension badge on user cards

# 6. Test everything
npm run dev
```

---

## Real-World Examples

### Example 1: Report Harassment → Suspend
```
1. User A reports User B for harassment
2. Admin reviews report at /admin/reports
3. Admin clicks "Resolve"
4. Admin enters: "Confirmed harassment behavior"
5. Admin goes to /admin/users
6. Admin finds User B and clicks "Suspend"
7. Admin enters: "Harassment", duration: 30 days
8. User B's account locked for 30 days
9. System logs action to AdminAction table
10. User B can see suspension notice on login
11. After 30 days, system auto-unsuspends
```

### Example 2: Multiple Reports → Auto-Flag
```
1. User receives 3 reports in 7 days
2. checkForAutoFlag() called
3. System notices pattern
4. User flagged automatically
5. Admin can monitor user's behavior
6. If behavior improves, admin can unflag
7. If escalates, admin can suspend
```

---

## Performance Considerations

### Cache Suspension Status
Calling `isSuspended()` every request is expensive. Consider:

```typescript
// Cache in session or Redis
const suspensionStatus = await redis.get(`suspended:${userId}`);
if (!suspensionStatus) {
  const status = await isSuspended(userId);
  await redis.set(`suspended:${userId}`, status, { ex: 3600 }); // 1 hour
}
```

### Batch Check
For pages showing multiple users:

```typescript
const suspensionStatus = await prisma.user.findMany({
  where: { id: { in: userIds } },
  select: { id: true, isSuspended: true },
});
```

---

## Complete Integration Summary

| Feature | File | Action |
|---------|------|--------|
| Block Requests | `/api/requests/route.ts` | Add `requireNotSuspended()` |
| Block Reviews | `/api/reviews/route.ts` | Add `requireNotSuspended()` |
| Block Profile Updates | `/api/profile/route.ts` | Add `requireNotSuspended()` |
| Show Status - Profile | `/profile/[userId]/page.tsx` | Display suspension badge |
| Show Status - Explore | `/explore/page.tsx` | Display badges in cards |
| Show Status - Dashboard | `/dashboard/page.tsx` | Show suspension notice |
| Trust Adjustment | `trust-indicators.tsx` | Reduce score if flagged |
| Request Disable | `send-request-form.tsx` | Disable button if suspended |
| Auto-Flag | `moderation.ts` | Call after report creation |
| Gradual Enforcement | `moderation.ts` | Check report count thresholds |

---

**Phase 11 Integration Complete!** 🎉

Your app now has enterprise-grade moderation built in.
