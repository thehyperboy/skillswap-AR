
# SkillSwap AR - Deployment Guide

## Quick Start for Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url> skillswap-ar
cd skillswap-ar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your local values

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data (optional)
npm run prisma:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Running Tests

```bash
# Run unit tests (vitest)
npm test

# Run E2E tests (Playwright)
npm run test:e2e

# Run linting
npm run lint

# Format code
npm run format
```

---

## Production Deployment on Vercel

### Prerequisites
- Vercel account
- PostgreSQL database (use Vercel Postgres or another provider)
- All service credentials (Mapbox, Pusher, Cloudinary, etc.)

### Step 1: Create Vercel Project

```bash
# Install Vercel CLI (optional, can do from web dashboard)
npm install -g vercel

# Deploy to Vercel
vercel
```

Or use the Vercel Dashboard:
1. Go to https://vercel.com/new
2. Connect your Git repository
3. Select the repository
4. Framework: Next.js
5. Click Deploy

### Step 2: Set Up Database

#### Option A: Vercel Postgres (Recommended for Vercel)
```bash
# Via Vercel Dashboard
1. Go to your project settings
2. Click "Storage"
3. Click "Create New" → "Postgres"
4. Follow the setup wizard
5. Copy the DATABASE_URL to environment variables
```

#### Option B: AWS RDS
```
1. Create RDS instance on AWS
2. Get connection string
3. Format: postgresql://user:password@host:5432/database?sslmode=require
4. Add to Vercel environment variables
```

#### Option C: Azure Database for PostgreSQL
```
1. Create Azure Database instance
2. Get connection string from Connection Strings section
3. Add to Vercel environment variables
```

### Step 3: Configure Environment Variables in Vercel

In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.example`:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate-new-secure-value>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_MAPBOX_TOKEN=...
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=production
```

⚠️ **Important**: Generate a new `NEXTAUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

### Step 4: Run Database Migrations in Production

After deploying to Vercel:

```bash
# Option 1: Via Vercel CLI
vercel env pull
npm run prisma:migrate -- --skip-generate

# Option 2: Manually via psql
psql $DATABASE_URL < schema.sql
```

Or connect to your database directly and run:
```bash
npx prisma migrate deploy
```

### Step 5: Verify Deployment

1. Visit your Vercel domain
2. Test the following flows:
   - Sign up new account
   - Log in
   - View dashboard
   - Edit profile
   - Search skills
   - Send collaboration requests

---

## Database Setup Instructions

### Local PostgreSQL Setup

#### Windows (using PostgreSQL installer)
```bash
# Install from https://www.postgresql.org/download/windows/
# Then create database:
psql -U postgres
CREATE DATABASE skillswap_ar;
\c skillswap_ar
\q
```

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb skillswap_ar
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb skillswap_ar
```

#### Docker (Recommended)
```bash
docker run --name skillswap-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=skillswap_ar \
  -p 5432:5432 \
  -d postgres:15-alpine

# Update .env.local:
DATABASE_URL=postgresql://postgres:password@localhost:5432/skillswap_ar?schema=public
```

### Running Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migrations for schema changes (dev only)
npm run prisma:migrate -- --name "description"

# Apply all pending migrations
npm run prisma:migrate

# Apply migrations in production
npx prisma migrate deploy

# View database in GUI
npm run prisma:studio
```

---

## Authentication Setup

### NextAuth Configuration

The app uses NextAuth.js with credentials (email/password). For production:

1. **Update NEXTAUTH_URL** in environment to your production domain
2. **Generate new NEXTAUTH_SECRET** using OpenSSL
3. **Session storage** uses database (not cookies)

### Optional: Add OAuth Providers

To add Google, GitHub, etc., update `src/lib/auth.ts`:

```typescript
import GoogleProvider from "next-auth/providers/google";

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // ... existing providers
]
```

---

## Security Checklist

- [ ] Generate unique `NEXTAUTH_SECRET` for production
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Enable HTTPS/SSL on your domain
- [ ] Database has backups enabled
- [ ] Rate limiting configured for APIs
- [ ] Input validation in place (✓ implemented)
- [ ] CSRF tokens enabled (✓ implemented)
- [ ] Sensitive data not logged
- [ ] Environment variables never in code
- [ ] Regular security updates scheduled

---

## Monitoring & Logging

### View Logs in Vercel
```bash
# Via CLI
vercel logs

# Or in Dashboard: Settings → Deployments → Logs
```

### Set Up Error Tracking with Sentry
```bash
npm install @sentry/nextjs

# Add to .env.local:
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Database Monitoring
```bash
# Connect to production database
psql $DATABASE_URL

# Check for slow queries
\timing on
SELECT * FROM users LIMIT 10;
```

---

## Troubleshooting

### Issue: Database connection fails
```bash
# Check connection string format
# postgresql://user:password@host:port/database?schema=public

# For Vercel Postgres:
# Should include ?sslmode=require at the end
```

### Issue: NextAuth session not persisting
```
1. Clear browser cookies
2. Verify DATABASE_URL is correct
3. Check NEXTAUTH_SECRET is set
4. Verify sessions table exists: npm run prisma:studio
```

### Issue: Build fails on Vercel
```bash
# View full build logs in Vercel Dashboard
# Common causes:
# 1. Missing environment variable
# 2. Type errors (npm run build locally to debug)
# 3. Missing database migration
```

### Issue: Rate limiting too aggressive
```
Edit src/lib/rate-limit.ts to adjust thresholds:
- signupLimiter: 5 per hour
- loginLimiter: 10 per 15 min
- apiLimiter: 100 per minute
```

---

## Performance Optimization

### Database Query Optimization
1. Use Prisma Studio to analyze queries
2. Add indexes for frequently filtered columns
3. Use `.select()` to fetch only needed fields

### Caching Strategies
- Server-side caching with Redis (optional)
- Browser caching with Cache-Control headers
- Incremental Static Regeneration (ISR) for pages

### Image Optimization
- All images served through Cloudinary CDN
- Automatic format conversion and compression
- Responsive images with srcset

---

## Backup & Recovery

### Automated Backups
- **Vercel Postgres**: Auto backups to AWS S3
- **AWS RDS**: Enable automated backups (7-35 days retention)
- **Azure Database**: Enable automatic backups

### Manual Backup
```bash
# PostgreSQL
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Support & Resources

- Vercel Dashboard: https://vercel.com/dashboard
- NextAuth Documentation: https://next-auth.js.org
- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs
- Next.js Documentation: https://nextjs.org/docs
