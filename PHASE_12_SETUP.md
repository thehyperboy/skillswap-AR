# Phase 12: Availability System - Setup & Implementation Guide

## Overview

Phase 12 adds a comprehensive availability scheduling system to SkillSwap AR. Users can now:
- Set weekly availability for each day of the week
- Display their availability on their profile
- See overlapping availability with potential collaborators
- Filter potential collaborators by availability (optional)

## What Was Added

### 1. Core Library: `src/lib/availability.ts`

**Functions:**
- `getDayAvailability()` - Get availability for a specific day
- `getAvailabilitySummary()` - Human-readable summary (e.g., "Available weekdays")
- `formatTime()` - Convert time strings to display format (12-hour)
- `isAvailableAtTime()` - Check if user is available at a specific datetime
- `getOverlappingAvailability()` - Find common time slots between two users
- `isValidTimeRange()` - Validate start/end times
- `timeToMinutes()` - Convert time string to total minutes
- `getDefaultWeeklySchedule()` - Bootstrap default availability

**Data Types:**
```typescript
type DayOfWeek = "Monday" | "Tuesday" | ... | "Sunday"

interface DayAvailability {
  day: DayOfWeek
  startTime: string  // "HH:mm" format
  endTime: string    // "HH:mm" format
  isAvailable: boolean
}

interface WeeklySchedule {
  Monday: DayAvailability
  Tuesday: DayAvailability
  // ... etc
}
```

### 2. API Endpoints

#### `GET /api/availability`
- **Auth:** Required (current user)
- **Returns:** Array of AvailabilitySlot records for current user
- **Usage:** Fetch user's availability slots on settings page

#### `PUT /api/availability`
- **Auth:** Required (current user)
- **Body:** `{ schedule: WeeklySchedule }`
- **Returns:** Updated slots with count
- **Usage:** Save weekly availability (replaces all existing slots)

#### `POST /api/availability`
- **Auth:** Required (current user)
- **Body:** `{ startsAt, endsAt, recurring }`
- **Returns:** Created slot
- **Usage:** Add single availability slot

#### `DELETE /api/availability/[slotId]`
- **Auth:** Required (ownership check)
- **Returns:** Success confirmation
- **Usage:** Delete specific availability slot

#### `GET /api/availability/[slotId]`
- **Auth:** Optional (public endpoint)
- **Returns:** Specific slot details
- **Usage:** View single slot

#### `GET /api/users/[userId]/availability`
- **Auth:** Optional (public endpoint)
- **Returns:** User's weekly schedule (converted from slots)
- **Usage:** Display any user's availability on their profile

### 3. UI Components

#### `AvailabilityPicker` (`src/components/availability/availability-picker.tsx`)
- Day-by-day selector with time range input
- Preset buttons: Weekdays, Weekends, Evenings, Clear All
- Toggle availability on/off per day
- Simple time picker UI
- Mobile-responsive grid layout

#### `AvailabilityDisplay` (`src/components/availability/availability-display.tsx`)
- Read-only view of availability
- Compact badge mode or expanded day-by-day view
- Handles "not available" state

#### `AvailabilityCard` (in availability-display.tsx)
- Profile card showing user's availability
- Formatted for display in profile sidebar

#### `TimelineView` (in availability-display.tsx)
- Visual timeline representation of weekly availability
- Shows hours 0-24 with available time blocks
- Useful for quick visual scanning

#### `AvailabilityMatcher` (`src/components/availability/availability-matcher.tsx`)
- Shows overlapping availability between two users
- Highlights common meeting times
- Includes "available now" indicator

### 4. Pages

#### `/settings/availability`
- User availability management page
- Displays current schedule
- Server-side rendered with client form submission
- Includes info card explaining the feature
- Shows current schedule preview

#### `/profile/[userId]` (Enhanced)
- Added availability display section
- Shows availability before skills section
- Fetches user's availability slots
- Converts slots to WeeklySchedule for display

### 5. Client Component

#### `AvailabilityPickerClient` (`src/components/availability/availability-picker-client.tsx`)
- Handles form submission and error states
- Converts UI state to API format
- Shows success/error messages
- Manages loading state

## Database Integration

**Existing Schema Used:**
```prisma
model AvailabilitySlot {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  startsAt   DateTime
  endsAt     DateTime
  recurring  RecurrenceRule @default(WEEKLY)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([userId])
}

enum RecurrenceRule {
  DAILY
  WEEKLY
  WEEKDAYS
  WEEKENDS
}
```

**No schema changes needed** — AvailabilitySlot model was already defined!

## How It Works

### Setting Availability

1. User navigates to `/settings/availability`
2. Sees day-by-day picker (7 days)
3. For each day, can:
   - Toggle available/unavailable
   - Set start and end time (only if available)
4. Uses preset quicklinks for common patterns
5. Clicks "Save Availability"
6. Client sends PUT request to `/api/availability` with WeeklySchedule
7. API deletes all existing slots and creates 7 new ones (one per day)
8. Slots use reference dates (Jan 1 2024 = Monday reference)

### Displaying Availability

#### On Profile
- `/profile/[userId]` queries availabilitySlots
- Converts slots back to WeeklySchedule format
- Shows via `AvailabilityDisplay` component
- Displays "Mon 9am-5pm", "Tue 9am-5pm", etc.

#### When Viewing Collaborator
- Can use `AvailabilityMatcher` to show overlapping times
- Helps requester pick meeting time

### Finding Overlaps

```typescript
const overlap = getOverlappingAvailability(requesterAvail, targetUserAvail);
// overlap contains only times when BOTH are available
```

## Integration with Collaboration Requests

**Future Enhancement (Phase 13+):**
- Suggest meeting times based on availability overlap
- Let users propose specific times from available slots
- Automatic scheduling helpers

**For Now (Phase 12):**
- Display availability context when viewing requester/target
- Use `AvailabilityMatcher` to show common times

## User Workflow

### Step 1: Set Up Availability
1. Go to settings (user menu → Settings)
2. Click "Availability Settings" or navigate to `/settings/availability`
3. Toggle days and set times
4. Use Weekdays preset (quick setup)
5. Click Save
6. See confirmation message

### Step 2: View Your Profile
1. Click your profile
2. See "Availability" section in left sidebar
3. Shows "Available Mon-Fri 9am-5pm" or similar
4. Others can see this when viewing your profile

### Step 3: Finding Collaborators
1. Browse explore page
2. Check if collaborators are available at your times
3. Send request with confidence about scheduling
4. (Future) Propose meeting time from overlapping slots

## Mobile UX

The implementation is fully mobile-responsive:
- Day selector cards stack in single column on mobile
- Time input fields are responsive
- Preset buttons wrap on small screens
- AvailabilityDisplay is compact by default
- TimelineView scales to mobile viewport

## Testing Checklist

See `PHASE_12_VERIFICATION.md` for complete verification steps.

## Files Created/Modified

### New Files (11 total)
- `src/lib/availability.ts` - Core utilities
- `src/app/api/availability/route.ts` - Main availability endpoints
- `src/app/api/availability/[slotId]/route.ts` - Slot management
- `src/app/api/users/[userId]/availability/route.ts` - Public availability API
- `src/settings/availability/page.tsx` - Settings page
- `src/components/availability/availability-picker.tsx` - Day selector UI
- `src/components/availability/availability-picker-client.tsx` - Form handler
- `src/components/availability/availability-display.tsx` - Display components
- `src/components/availability/availability-matcher.tsx` - Overlap display

### Modified Files (1 total)
- `src/app/profile/[userId]/page.tsx` - Added availability display section

## Environment Notes

- No new environment variables needed
- No additional dependencies (uses existing: prisma, zod, next-auth, tailwind)
- No database migrations needed (schema already had AvailabilitySlot)

## Performance Considerations

- AvailabilitySlots indexed by userId for fast queries
- Availability converted to WeeklySchedule in-memory (no extra DB calls)
- Public endpoints don't require auth (profile display is public)
- Form submission debounced via react state updates

## Future Enhancements (Phase 13+)

1. **Availability Filtering in Discovery**
   - Add checkbox: "Only show available now"
   - Add time range filter: "Find people available 6pm-8pm"
   
2. **Smart Scheduling**
   - Suggest specific meeting times
   - Calendar integration
   
3. **Timezone Support**
   - Store user timezone
   - Convert availability for different regions
   
4. **Recurring Rules**
   - Use WEEKLY/DAILY/WEEKENDS enum fully
   - Non-repeating one-off slots
   
5. **Availability Analytics**
   - Most common available times
   - Peak collaboration hours

## Troubleshooting

### Availability Not Saving
- Check browser console for errors
- Verify NextAuth session is valid
- Check API endpoint returns 200

### Profile Not Showing Availability
- Ensure user has set availability (not empty slots array)
- Check that availabilitySlots are included in profile query
- Verify slot dates use consistent reference week

### Time Display Issues
- Check formatTime() function is being used
- Verify input time format is "HH:mm"
- Check browser timezone settings

## Summary

Phase 12 provides a complete foundation for availability-based collaboration matching. The system is ready for scheduling enhancements in future phases.

**Status: Complete** ✓

All core components, APIs, and features implemented and integrated.
