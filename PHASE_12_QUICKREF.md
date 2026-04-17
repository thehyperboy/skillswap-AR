# Phase 12: Availability System - Quick Reference

## For Users

### Setting Your Availability

1. **Navigate:** User menu → Settings → Availability
2. **Quick Setup:** Click "Weekdays" preset (sets Mon-Fri 9am-5pm)
3. **Custom:** Toggle ON for each day, adjust times
4. **Save:** Click "Save Availability"
5. **Verify:** Go to your profile to see it displayed

### What Others See

- Your profile shows: "Available Mon-Fri 9am-5pm"
- Public visibility: Everyone can see your availability
- Privacy: Only hours shown, no location tracking

---

## For Developers

### Quick API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/availability` | GET | Yes | Get current user's slots |
| `/api/availability` | PUT | Yes | Save weekly schedule |
| `/api/availability` | POST | Yes | Add single slot |
| `/api/availability/[id]` | DELETE | Yes | Delete specific slot |
| `/api/users/[id]/availability` | GET | No | Get any user's schedule |

### Quick Function Reference

```typescript
// Format time
formatTime("14:30") // "2:30 PM"

// Check if available now
isAvailableAtTime(schedule)

// Find overlap
const overlap = getOverlappingAvailability(user1Schedule, user2Schedule)

// Get summary
getAvailabilitySummary(schedule) // "Available weekdays"
```

### Common Use Cases

#### 1. Display User Availability on Profile
```tsx
import { AvailabilityDisplay } from "@/components/availability/availability-display"

// Fetch slots from DB
const slots = await prisma.availabilitySlot.findMany({where: {userId}})
// Convert to schedule format (see profile page for example)
const schedule = slotsToSchedule(slots)

// Render
<AvailabilityDisplay schedule={schedule} />
```

#### 2. Show Available Now Badge
```tsx
import { AvailabilityCheckmark } from "@/components/availability/availability-matcher"

<AvailabilityCheckmark availability={schedule} userName="Jane" />
// Shows "Available now" or "Available 9am-5pm" depending on current time
```

#### 3. Find Overlapping Times
```tsx
import { AvailabilityMatcher } from "@/components/availability/availability-matcher"

<AvailabilityMatcher
  requesterName="Alice"
  targetUserName="Bob"
  requesterAvailability={aliceSchedule}
  targetUserAvailability={bobSchedule}
/>
```

#### 4. Handle Availability in Form
```tsx
import { AvailabilityPickerClient } from "@/components/availability/availability-picker-client"

// On page
<AvailabilityPickerClient initialSchedule={currentSchedule} />
```

### Data Model

```
User
  ├─ availabilitySlots: AvailabilitySlot[]
     ├─ id: string
     ├─ userId: string
     ├─ startsAt: DateTime     // Day + start time
     ├─ endsAt: DateTime       // Day + end time
     ├─ recurring: RecurrenceRule
     ├─ createdAt: DateTime
     └─ updatedAt: DateTime

RecurrenceRule enum: DAILY | WEEKLY | WEEKDAYS | WEEKENDS
```

### File Structure

```
src/
├─ lib/
│  └─ availability.ts          ← Core utilities
├─ app/
│  ├─ api/
│  │  ├─ availability/route.ts ← GET, PUT, POST
│  │  ├─ availability/[slotId]/route.ts ← DELETE, GET
│  │  └─ users/[userId]/availability/route.ts ← GET (public)
│  ├─ settings/availability/page.tsx ← Settings UI
│  └─ profile/[userId]/page.tsx ← Display (enhanced)
└─ components/
   └─ availability/
      ├─ availability-picker.tsx ← Day selector UI
      ├─ availability-picker-client.tsx ← Form handler
      ├─ availability-display.tsx ← Display components
      └─ availability-matcher.tsx ← Overlap display
```

### Common Tasks

#### Task: Add availability filter to explore page

1. Fetch requester's availability:
```tsx
const requesterSlots = await prisma.availabilitySlot.findMany({
  where: { userId: session.user.id }
})
```

2. Use in search filter:
```tsx
// When filtering users, check overlap with their availability
const targetSlots = await prisma.availabilitySlot.findMany({
  where: { userId: targetUser.id }
})
const overlap = getOverlappingAvailability(requesterSchedule, targetSchedule)
const hasOverlap = Object.values(overlap).some(day => day.isAvailable)
```

#### Task: Show "Available Now" on user cards

```tsx
import { AvailabilityCheckmark } from "@/components/availability/availability-matcher"

function UserCard({ user, schedule }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <AvailabilityCheckmark availability={schedule} userName={user.name} />
    </div>
  )
}
```

#### Task: Export availability as iCal

```typescript
// (Not implemented yet, but would use AvailabilitySlot data)
// Generate icalendar format from slots
```

---

## Troubleshooting

### Q: Availability not showing on profile
**A:** Check that:
1. availabilitySlots included in profile query
2. User has set availability (slots aren't empty)
3. Slots are being converted to schedule format correctly

### Q: Save button not working
**A:** 
1. Check browser console for errors
2. Verify session is still valid
3. Check that times are in HH:mm format
4. Ensure startTime < endTime

### Q: API returning wrong timezone
**A:** DateTime stored in UTC. Client handles local timezone conversion via JavaScript Date object.

### Q: Can't delete availability
**A:** Only slot owner can delete. Check that userId matches sessionUser.id.

---

## Integration Checklist (Phase 13+)

- [ ] Add availability filter to explore page
- [ ] Show "Available Now" badges on user cards
- [ ] Suggest meeting times during request creation
- [ ] Calendar integration
- [ ] Timezone support
- [ ] Analytics on availability patterns

---

## Performance Notes

- Availability queries indexed by userId
- ~7 slots per user (one per day)
- Schedule conversion happens in-memory (no DB query)
- API response < 100ms typical

---

## Notes for Future Enhancement

1. **Smart Scheduling:** Use availability to suggest meeting times
2. **Recurring Rules:** Fully implement WEEKLY/DAILY/WEEKENDS
3. **Timezone:** Convert availability for users in different timezones
4. **Analytics:** Track most popular available times
5. **Blocking:** Let users block specific dates/times

