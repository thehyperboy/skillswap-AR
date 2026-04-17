# Phase 11 Setup Guide 🚀

Copy & paste each command in order. Total time: ~5 minutes.

---

## Step 1: Generate Prisma Client (30 seconds)

```bash
npm run prisma:generate
```

**What it does:** Regenerates Prisma client with new Report, AdminAction, and enum types.

**Expected output:**
```
✔ Generated Prisma Client (x.y.z) to ./node_modules/@prisma/client
```

---

## Step 2: Create Database Migration (1 minute)

```bash
npm run prisma:migrate -- --name "add_moderation_system"
```

**What it does:** Creates migration file for Report, AdminAction tables and User moderation fields.

**Expected output:**
```
✔ Created directory prisma/migrations/xxx_add_moderation_system
✔ Saved migration to prisma/migrations/xxx_add_moderation_system/migration.sql
```

---

## Step 3: Apply Migration to Database (1 minute)

```bash
npm run prisma:db push
```

**What it does:** Applies all pending migrations to your PostgreSQL database.

**Expected output:**
```
✔ All good! No pending migrations.
```

*Or if migrations pending:*
```
✔ Your database is now in sync with your schema.
```

---

## Step 4: Verify in Prisma Studio (1 minute)

```bash
npm run prisma:studio
```

**What it does:** Opens Prisma Studio UI to inspect your database.

**Should see:**
- ✅ `Report` table with all fields
- ✅ `AdminAction` table with all fields  
- ✅ `User` table with new fields: `isSuspended`, `suspendedAt`, etc.

**How to verify:**
1. Click "Report" in left sidebar
2. Verify columns: id, reportedUserId, reporterId, reason, status, etc.
3. Click "AdminAction"
4. Verify columns: id, adminId, action, targetUserId, reason, etc.

*Press Ctrl+C to close when done*

---

## Step 5: Restart Dev Server (1 minute)

```bash
npm run dev
```

**What it does:** Rebuilds Next.js app with new admin pages and routes.

**Expected output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

---

## Step 6 (Optional): Create Admin User

If you want to test the admin panel, set your user as admin in database.

**Option A: Using Prisma Studio**
1. Run `npm run prisma:studio`
2. Click "User" table
3. Find your user record (by email)
4. Click "Edit"
5. Change `role` from `USER` to `ADMIN`
6. Click "Save"

**Option B: SQL Query**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## ✅ All Done!

Your system is now ready. Visit:
- 🏠 App: http://localhost:3000/dashboard
- 👑 Admin Panel: http://localhost:3000/admin (only if admin role)

---

## Testing the Setup

### Test 1: Create a Report (as regular user)
```
1. Login as regular user
2. Navigate to another user's profile
3. Should see a "Report" button (when built into UI)
4. Click → submit report
5. Report stored in database
```

### Test 2: View Reports (as admin)
```
1. Login as admin user
2. Visit http://localhost:3000/admin/reports
3. Should see list of reports
4. Filter by status (PENDING, INVESTIGATING, RESOLVED, DISMISSED)
```

### Test 3: Suspend a User (as admin)
```
1. Visit http://localhost:3000/admin/users
2. Find a user
3. Click "Suspend"
4. Enter reason + duration
5. User suspended in database
```

---

## Key Files Created

| File | Purpose |
|------|---------|
| `src/lib/moderation.ts` | 13 utility functions for moderation |
| `src/app/api/reports/route.ts` | User report submission |
| `src/app/api/admin/reports/route.ts` | Admin report listing |
| `src/app/api/admin/reports/[reportId]/route.ts` | Report details & actions |
| `src/app/api/admin/users/route.ts` | User management listing |
| `src/app/api/admin/users/[userId]/route.ts` | Suspend/flag users |
| `src/app/api/admin/actions/route.ts` | Audit log |
| `src/components/admin/reports-table.tsx` | Report list component |
| `src/components/admin/report-details.tsx` | Report details modal |
| `src/components/admin/user-list.tsx` | User management component |
| `src/app/admin/layout.tsx` | Admin layout with role guard |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/reports/page.tsx` | Reports page |
| `src/app/admin/users/page.tsx` | Users page |

---

## Environment Check

Make sure you have:

```bash
# Check Node version (should be 18+)
node --version

# Check npm
npm --version

# Check .env.local has DATABASE_URL
cat .env.local | grep DATABASE_URL
```

---

## Troubleshooting

### ❌ "Prisma Client not found"
```bash
rm -rf node_modules/.prisma
npm run prisma:generate
```

### ❌ "Migration already exists"
```bash
# Previous generation may have created migration
# Just apply it:
npm run prisma:db push
```

### ❌ "Permission denied" on macOS
```bash
# Make script executable
chmod +x node_modules/.bin/prisma
npm run prisma:migrate dev
```

### ❌ Database connection error
- Verify DATABASE_URL in `.env.local`
- Ensure PostgreSQL is running
- Test with `npm run prisma:studio`

---

## Next: Verification Checklist

After setup, run through [PHASE_11_VERIFICATION.md](./PHASE_11_VERIFICATION.md)
