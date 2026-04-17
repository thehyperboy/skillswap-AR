# Phase 11 Verification Guide ✅

Complete these verification steps to ensure Phase 11 is working correctly.

---

## 1️⃣ Database Verification

### Check Tables Exist
```bash
npm run prisma:studio
```

**Verify these tables:**
- ✅ `Report` (created)
- ✅ `AdminAction` (created)
- ✅ `User` (updated with 5 new fields)

**Check Report fields:**
- id, reportedUserId, reporterId, reason, status, description
- adminNotes, resolution, resolvedById, resolvedAt, createdAt

**Check AdminAction fields:**
- id, adminId, action, targetUserId, targetReportId, reason, createdAt

**Check User new fields:**
- isSuspended, suspensionReason, suspendedAt, suspendedUntil
- isFlagged, flagReason, flaggedAt

---

## 2️⃣ API Endpoint Verification

Use Postman or curl to test these endpoints.

### Setup: Login First
```bash
# Get auth cookie/token
# Or use your browser's cookies
```

### Test: Create Report (User)
```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Cookie: [your auth cookie]" \
  -d '{
    "reportedUserId": "user123",
    "contentType": "USER_PROFILE",
    "contentId": "user123",
    "reason": "HARASSMENT",
    "description": "This user is harassing other members"
  }'
```

**Expected:** 201 Created with report details

### Test: Get Own Reports (User)
```bash
curl http://localhost:3000/api/reports \
  -H "Cookie: [your auth cookie]"
```

**Expected:** 200 OK with array of reports user submitted

### Test: List All Reports (Admin Only)
```bash
curl "http://localhost:3000/api/admin/reports" \
  -H "Cookie: [your auth cookie]"
```

**Expected:**
- 200 OK (if admin) - list of all reports
- 403 Forbidden (if not admin)
- 401 Unauthorized (if not logged in)

### Test: Get Report Details (Admin)
```bash
curl "http://localhost:3000/api/admin/reports/report123" \
  -H "Cookie: [your auth cookie]"
```

**Expected:** 200 OK with full report details including user info

### Test: Resolve Report (Admin)
```bash
curl -X PATCH http://localhost:3000/api/admin/reports/report123 \
  -H "Content-Type: application/json" \
  -H "Cookie: [your auth cookie]" \
  -d '{
    "action": "resolve",
    "resolution": "User warned about harassment",
    "adminNotes": "Pattern of behavior confirmed"
  }'
```

**Expected:** 200 OK, report status changed to RESOLVED

### Test: List Users (Admin)
```bash
curl "http://localhost:3000/api/admin/users" \
  -H "Cookie: [your auth cookie]"
```

**Expected:** 200 OK with paginated user list (including karma stats)

### Test: Get User Details (Admin)
```bash
curl "http://localhost:3000/api/admin/users/user123" \
  -H "Cookie: [your auth cookie]"
```

**Expected:** 200 OK with detailed user info

### Test: Suspend User (Admin)
```bash
curl -X POST "http://localhost:3000/api/admin/users/user123?action=suspend" \
  -H "Content-Type: application/json" \
  -H "Cookie: [your auth cookie]" \
  -d '{
    "reason": "Harassment violation",
    "durationDays": 7
  }'
```

**Expected:** 200 OK, `isSuspended` set to true in database

### Test: View Audit Log (Admin)
```bash
curl "http://localhost:3000/api/admin/actions" \
  -H "Cookie: [your auth cookie]"
```

**Expected:** 200 OK with list of all admin actions

---

## 3️⃣ Frontend Page Verification

### Test: Admin Dashboard
1. Login as admin user
2. Visit http://localhost:3000/admin
3. **Verify you see:**
   - ✅ "Admin Dashboard" heading
   - ✅ 5 stat cards (Pending Reports, Suspended Users, Flagged Users, etc.)
   - ✅ Quick action buttons
   - ✅ Platform safety guide

### Test: Reports Page
1. Visit http://localhost:3000/admin/reports
2. **Verify you see:**
   - ✅ Filter buttons (All, Pending, Investigating, Resolved, Dismissed)
   - ✅ Report cards with status badges
   - ✅ "View" buttons for each report

3. Click on a report's "View" button
4. **Verify modal shows:**
   - ✅ Report details (reason, description, dates)
   - ✅ Reporter and reported user info
   - ✅ Action buttons (Resolve, Dismiss, Investigate)

5. Click "Resolve"
6. **Verify you can:**
   - ✅ Enter resolution text
   - ✅ Add admin notes
   - ✅ Click confirm to save

### Test: Users Page
1. Visit http://localhost:3000/admin/users
2. **Verify you see:**
   - ✅ Search input box
   - ✅ Filter buttons (All Users, Suspended, Flagged)
   - ✅ User cards with kafka stats
   - ✅ Suspend/Unsuspend buttons
   - ✅ Flag/Unflag buttons

3. Click "Suspend" on a user
4. **Verify modal shows:**
   - ✅ Duration input field
   - ✅ Reason textarea
   - ✅ Confirm button

5. Enter reason and click confirm
6. **Verify:**
   - ✅ User now shows "Suspended" badge
   - ✅ Card shows suspension reason

---

## 4️⃣ Access Control Verification

### Test: Non-Admin Access
1. Logout from admin account
2. Login as regular user
3. Try to access http://localhost:3000/admin
4. **Verify:** ✅ Redirected to /dashboard

### Test: Unauthenticated Access
1. Logout
2. Try to access http://localhost:3000/admin
3. **Verify:** ✅ Redirected to /login

### Test: API Access Control
```bash
# As non-admin user, try:
curl http://localhost:3000/api/admin/reports

# Expected: 403 Forbidden
```

---

## 5️⃣ Moderation Logic Verification

### Test: Duplicate Report Prevention
1. Submit report against user123
2. Try to submit another report against same user (same content)
3. **Verify:** ✅ Error: "You have already reported this content recently"
4. ✅ Wait a few seconds, try again - should succeed (7 day check uses timestamp)

### Test: Self-Report Prevention
1. Try to report your own user
2. **Verify:** ✅ Error: "You cannot report yourself"

### Test: Suspension Logic
1. Admin suspends user for 7 days
2. Check database - verify `suspendedUntil` is 7 days in future
3. Try to login as suspended user
4. **Verify:** ✅ Error or login blocked
5. After 7 days... suspension should auto-expire (check with admin)

### Test: Flag System
1. Admin flags user
2. Visit user profile or admin page
3. **Verify:** ✅ Show "⚠️ Flagged" badge
4. Verify show flag reason

---

## 6️⃣ Audit Trail Verification

### Check AdminAction Log
```bash
npm run prisma:studio
# Click AdminAction table
# Verify entries for:
# - SUSPENDED_USER
# - FLAGGED_USER
# - CLOSED_REPORT
# - etc.

# Each should show:
# - adminId (who did it)
# - action (what they did)
# - targetUserId or targetReportId (what they did it to)
# - reason (why)
# - createdAt (when)
```

---

## 7️⃣ Component Rendering

### Reports Table Component
Visit `/admin/reports` and verify:
- ✅ Reports display in card format
- ✅ Status shows with color badge (yellow/PENDING, blue/INVESTIGATING, etc.)
- ✅ Reason shows with color coding
- ✅ Reporter and reported user names display
- ✅ "View" button works
- ✅ "Profile" button links to user

### Report Details Modal
When modal opens:
- ✅ Modal appears centered with overlay
- ✅ All fields populated (no undefined)
- ✅ Close (X) button works
- ✅ Action buttons visible
- ✅ Form inputs accept text

### User List Component
Visit `/admin/users` and verify:
- ✅ Users display in card format
- ✅ Suspended users show red badge
- ✅ Flagged users show orange badge
- ✅ Admin users show purple badge
- ✅ Karma stats showing (level, rating, reviews)
- ✅ Suspend/Flag buttons functional

---

## 8️⃣ Pagination Verification

### Reports Page
1. Assume >20 reports exist
2. Visit `/admin/reports`
3. Scroll to bottom
4. **Verify:**
   - ✅ "Page X of Y" text
   - ✅ Previous/Next buttons
   - ✅ Buttons disabled appropriately

### Users Page
1. Same as above
2. Filter some users (search or status)
3. Verify pagination updates

---

## 🔟 Performance Checks

### Query Performance
- Reports page loads <1 second
- Users page loads <1 second
- User lookup <500ms
- Pagination works smoothly

### No N+1 Queries
All API responses should use `include` or `select` to load related data in single query.

---

## ✅ Verification Checklist

Print this and check off:

**Database**
- [ ] Report table created
- [ ] AdminAction table created
- [ ] User table has 5 new fields
- [ ] Relationships configured correctly

**APIs**
- [ ] POST /api/reports works
- [ ] GET /api/reports works
- [ ] GET /api/admin/reports requires admin
- [ ] PATCH /api/admin/reports/[id] updates correctly
- [ ] GET /api/admin/users returns paginated list
- [ ] POST /api/admin/users/[id]?action=suspend works

**Pages**
- [ ] /admin accessible by admin only
- [ ] /admin shows dashboard stats
- [ ] /admin/reports shows reports
- [ ] /admin/users shows users
- [ ] All pages have proper navbar

**Features**
- [ ] Users can report content
- [ ] Admins can filter reports
- [ ] Admins can resolve reports
- [ ] Admins can suspend users
- [ ] Admins can flag users
- [ ] Audit log shows all actions
- [ ] Auto-unsuspend works (manually verify later)

**Access Control**
- [ ] Non-admins get 403 on /api/admin/*
- [ ] Non-logged-in users redirect to /login
- [ ] Layout prevents non-admin access to /admin

---

## 🚀 You're Ready!

If all checks pass, Phase 11 is successfully deployed! 🎉

Next: Integrate moderation checks into user actions (reviews, collaborations, etc.)
