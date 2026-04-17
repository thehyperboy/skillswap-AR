# Phase 12: Availability System - Verification Checklist

## Pre-Flight Checks

### Code Structure
- [ ] `/src/lib/availability.ts` exists with all utility functions
- [ ] `/src/app/api/availability/route.ts` exists (GET, PUT, POST)
- [ ] `/src/app/api/availability/[slotId]/route.ts` exists (DELETE, GET)
- [ ] `/src/app/api/users/[userId]/availability/route.ts` exists (GET public)
- [ ] `/src/settings/availability/page.tsx` exists
- [ ] `/src/components/availability/availability-picker.tsx` exists
- [ ] `/src/components/availability/availability-picker-client.tsx` exists
- [ ] `/src/components/availability/availability-display.tsx` exists
- [ ] `/src/components/availability/availability-matcher.tsx` exists
- [ ] Profile page updated with availability display
- [ ] All files have proper TypeScript types

### Build Check
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No Tailwind warnings

## Feature Testing

### 1. Availability Settings Page

**Test: Navigate to Settings**
```bash
1. Log in as a user
2. Navigate to /settings/availability
3. Verify page loads without errors
```
- [ ] Page loads successfully
- [ ] All 7 day selector cards render
- [ ] Preset buttons visible (Weekdays, Weekends, Evenings, Clear All)

**Test: Set Availability**
```bash
1. Click "Weekdays" preset
2. Monday-Friday should show as available 9am-5pm
3. Saturday-Sunday should show as unavailable
4. Click "Save Availability"
```
- [ ] Preset buttons work
- [ ] Time inputs are shown correctly
- [ ] Save button is enabled and clickable
- [ ] Loading state appears during save
- [ ] Success message appears after save

**Test: Edit Individual Day**
```bash
1. On Monday card, toggle OFF
2. On Saturday, toggle ON and set custom time
3. In Saturday time field, enter 10:00
4. In Saturday end field, enter 18:00
```
- [ ] Toggle switches work
- [ ] Time inputs appear/disappear with toggle
- [ ] Time inputs accept valid times
- [ ] Times display in readable format

**Test: Verify Saved Data**
```bash
1. Refresh the page
2. Availability should persist
3. Same times should display
```
- [ ] Data persists after page refresh
- [ ] API returns saved slots correctly

### 2. Profile Display

**Test: View Own Profile**
```bash
1. Navigate to /profile/[your-user-id]
2. Look for "Availability" section in left sidebar
```
- [ ] Availability card displays
- [ ] Shows correct days and times
- [ ] Formatting looks good

**Test: View Another User's Profile**
```bash
1. Navigate to /profile/[other-user-id] of someone with availability set
2. Look for Availability section
```
- [ ] Other user's availability displays correctly
- [ ] Cannot edit (read-only view)
- [ ] Shows nice formatting

**Test: Empty Availability**
```bash
1. Log in as user with NO availability set
2. View your profile
```
- [ ] Availability section shows "Not currently accepting..."
- [ ] No errors on page

### 3. API Endpoints

**Test: GET /api/availability**
```bash
curl -H "Cookie: [session-cookie]" http://localhost:3000/api/availability
```
- [ ] Returns array of slots
- [ ] Each slot has: id, userId, startsAt, endsAt, recurring
- [ ] Without auth: Returns 401 Unauthorized

**Test: PUT /api/availability**
```bash
curl -X PUT -H "Cookie: [session-cookie]" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule": {
      "Monday": {"startTime":"09:00","endTime":"17:00","isAvailable":true},
      "Tuesday": {"startTime":"09:00","endTime":"17:00","isAvailable":true},
      ...
    }
  }' \
  http://localhost:3000/api/availability
```
- [ ] Returns 200 with created count
- [ ] Slots are updated in database
- [ ] Old slots are replaced (not appended)

**Test: DELETE /api/availability/[slotId]**
```bash
curl -X DELETE -H "Cookie: [session-cookie]" \
  http://localhost:3000/api/availability/[valid-slot-id]
```
- [ ] Returns 200 success
- [ ] Slot is deleted from database
- [ ] Non-existent slot returns 404
- [ ] Other user's slot returns 403 Forbidden

**Test: GET /api/users/[userId]/availability**
```bash
curl http://localhost:3000/api/users/[user-id]/availability
```
- [ ] Returns 200 with schedule object
- [ ] Schedule has all 7 days
- [ ] No auth required
- [ ] Non-existent user returns 500 or empty schedule

### 4. Component Tests

**Test: AvailabilityPicker Component**
```typescript
// In a test component
<AvailabilityPicker 
  onSave={async (schedule) => {...}}
  initialSchedule={testSchedule}
/>
```
- [ ] Renders without errors
- [ ] Preset buttons trigger schedule changes
- [ ] Day toggles work
- [ ] Time inputs update state
- [ ] Save calls onSave callback
- [ ] Handles loading state

**Test: AvailabilityDisplay Component**
```typescript
<AvailabilityDisplay schedule={weeklySchedule} compact={false} />
```
- [ ] Shows all available days
- [ ] Times are formatted correctly (12-hour format)
- [ ] Compact mode shows badge
- [ ] Full mode shows day-by-day list
- [ ] Handles empty schedule gracefully

**Test: AvailabilityCard Component**
```typescript
<AvailabilityCard userName="Jane" schedule={schedule} />
```
- [ ] Displays as nice card
- [ ] Shows all available slots
- [ ] User name appears correctly
- [ ] Times are formatted

**Test: TimelineView Component**
```typescript
<TimelineView schedule={schedule} />
```
- [ ] Shows visual timeline
- [ ] All 7 days displayed
- [ ] Blue blocks show availability
- [ ] Hour labels are correct
- [ ] Responsive to different screen sizes

**Test: AvailabilityMatcher Component**
```typescript
<AvailabilityMatcher
  requesterName="Alice"
  targetUserName="Bob"
  requesterAvailability={alice}
  targetUserAvailability={bob}
/>
```
- [ ] Shows overlapping availability
- [ ] Highlights common times
- [ ] Shows summary badge
- [ ] Handles no overlap case (amber warning)
- [ ] Uses correct user names

### 5. Utility Functions

**Test: getAvailabilitySummary()**
```typescript
const summary = getAvailabilitySummary(schedule);
```
- [ ] Returns "Available daily" for all days
- [ ] Returns "Available weekdays" for Mon-Fri only
- [ ] Returns specific day names for 1-3 days
- [ ] Returns "Not available" for empty schedule

**Test: formatTime()**
```typescript
formatTime("09:00") // "9:00 AM"
formatTime("17:30") // "5:30 PM"
formatTime("00:00") // "12:00 AM"
formatTime("12:00") // "12:00 PM"
```
- [ ] 24-hour to 12-hour conversion works
- [ ] AM/PM designation correct
- [ ] Handles noon and midnight
- [ ] Preserves minutes

**Test: isAvailableAtTime()**
```typescript
const available = isAvailableAtTime(schedule, new Date());
```
- [ ] Returns true if current time is within available slot
- [ ] Returns false if day is unavailable
- [ ] Returns false if time is outside range
- [ ] Works for any date parameter

**Test: getOverlappingAvailability()**
```typescript
const alice = {Monday: {startTime: "09:00", endTime: "17:00", isAvailable: true}, ...}
const bob = {Monday: {startTime: "10:00", endTime: "16:00", isAvailable: true}, ...}
const overlap = getOverlappingAvailability(alice, bob);
// overlap.Monday.startTime should be "10:00", endTime "16:00"
```
- [ ] Correctly finds intersection times
- [ ] Handles no overlap (sets isAvailable to false)
- [ ] Handles full overlap
- [ ] Handles partial overlap
- [ ] Handles unavailable days

### 6. User Workflows

**Complete Workflow: User Setup**
```
1. New user signs up
2. Goes to /settings/availability
3. Clicks "Weekdays" preset
4. Saves (sees success message)
5. Views own profile
6. Sees availability displayed
7. Logs out and views profile as guest
8. Can still see availability (public)
```
- [ ] All steps complete without errors
- [ ] Data persists throughout workflow
- [ ] Profile display works for both authenticated and anonymous users

**Complete Workflow: Find Collaborator's Availability**
```
1. User A navigates to /explore
2. Finds User B
3. Clicks to view User B's profile
4. Sees User B's availability in sidebar
5. Can determine if schedules overlap
6. Sends collaboration request
```
- [ ] All navigation works
- [ ] Availability displays correctly
- [ ] No errors in profile page

### 7. Error Handling

**Test: Invalid Input**
```bash
# Try to save with invalid time format
PUT /api/availability with "startTime": "25:00"
```
- [ ] Returns 400 Validation Error
- [ ] Error message is descriptive

**Test: Unauthorized Access**
```bash
# Try to delete another user's slot
DELETE /api/availability/[other-user-slot]
```
- [ ] Returns 403 Forbidden
- [ ] Slot is not deleted

**Test: Missing Session**
```bash
# Make request without authentication cookie
GET /api/availability
```
- [ ] Returns 401 Unauthorized
- [ ] Error message indicates auth required

### 8. Performance

**Test: Page Load Time**
```
1. Load /settings/availability
2. Open DevTools > Network
3. Check load time
```
- [ ] Settings page loads in < 2s
- [ ] No unused assets
- [ ] API calls complete quickly

**Test: Large Schedule**
```bash
# User has many availability slots
curl /api/availability
```
- [ ] Response time < 500ms
- [ ] Slots are indexed properly

### 9. Mobile Responsiveness

**Test: Mobile View (375px width)**
```
1. Open /settings/availability on mobile
2. Try day selector
3. Try time inputs
4. Try presets
5. Try save button
```
- [ ] Layout is single column
- [ ] Day cards stack properly
- [ ] Time inputs don't overflow
- [ ] Buttons are touch-friendly (> 44px)
- [ ] No horizontal scrolling

**Test: Tablet View (768px width)**
```
1. Open /settings/availability on tablet
2. Verify 2-column layout
3. Try navigation
```
- [ ] Layout uses 2 columns
- [ ] Still responsive and readable
- [ ] All elements clickable

### 10. Database Consistency

**Test: Database State**
```sql
SELECT * FROM "AvailabilitySlot" WHERE "userId" = '[test-user-id]';
```
- [ ] Slots exist after saving
- [ ] startsAt and endsAt are properly formatted DateTime
- [ ] recurring field is set (defaults to WEEKLY)
- [ ] userId is correct
- [ ] Indexed properly

## Edge Cases

- [ ] User with no password (OAuth only) can set availability
- [ ] User deletes own availability while editing
- [ ] Multiple rapid save requests handled gracefully
- [ ] Switching between preset buttons doesn't cause issues
- [ ] Changing time range validates correctly
- [ ] Start time equals end time is rejected
- [ ] End time before start time is rejected

## Accessibility

- [ ] Toggle switches are keyboard accessible
- [ ] Time inputs use HTML5 type="time"
- [ ] Form labels associated with inputs
- [ ] Error messages are clear
- [ ] Color contrast meets WCAG AA
- [ ] Page readable with screen reader
- [ ] Keyboard Tab order is logical

## Browser Compatibility

Test on:
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Safari (iOS)

## Sign-Off

| Item | Tester | Date | Status |
|------|--------|------|--------|
| Code Structure | | | ✅/❌ |
| Build Check | | | ✅/❌ |
| Settings Page | | | ✅/❌ |
| Profile Display | | | ✅/❌ |
| API Endpoints | | | ✅/❌ |
| Components | | | ✅/❌ |
| User Workflows | | | ✅/❌ |
| Error Handling | | | ✅/❌ |
| Mobile UX | | | ✅/❌ |
| Database | | | ✅/❌ |

## Phase 12 Status

- [ ] All verification tests passed
- [ ] No console errors or warnings
- [ ] Code review completed
- [ ] Ready for deployment

---

**Verified By:** ________________________  
**Date:** ________________________  
**Notes:** ___________________________________________________________________
