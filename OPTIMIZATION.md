# SkillSwap AR - Database & Performance Optimization Guide

## Database Query Optimization

### 1. Current Indexes (from schema)

```prisma
@@index([email])        // User email lookup
@@index([role])         // Filter by user role
@@index([isSuspended])  // Filter suspended users
```

### 2. Recommended Additional Indexes

Add to `prisma/schema.prisma`:

```prisma
model User {
  // Existing fields...
  
  @@index([email])
  @@index([role])
  @@index([isSuspended])
  @@index([createdAt])        // NEW: For sorting/filtering by date
}

model CollaborationRequest {
  // Existing fields...
  
  @@index([senderId])         // NEW: For sender's requests
  @@index([recipientId])      // NEW: For recipient's requests
  @@index([status])           // NEW: For pending requests
  @@index([createdAt])        // NEW: For recent requests
  @@unique([senderId, recipientId, status])  // NEW: Prevent duplicates
}

model Review {
  // Existing fields...
  
  @@index([reviewerId])       // NEW: Reviewer's reviews
  @@index([reviewedUserId])   // NEW: Reviews about user
  @@index([collaborationRequestId])
  @@index([createdAt])        // NEW: For sorting reviews
}

model Skill {
  // Existing fields...
  
  @@index([category])         // NEW: Filter by category
  @@index([name])             // NEW: Search by name
}

model SkillKarma {
  // Existing fields...
  
  @@index([userId])
  @@index([level])            // NEW: Filter by karma level
}
```

### 3. Migration to Add Indexes

```bash
# Create migration
npm run prisma:migrate -- --name "add_performance_indexes"

# Apply migration
npm run prisma:migrate
```

---

## API Route Optimization

### 1. Optimize Nearby Users Search

**File**: `src/app/api/users/nearby/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!apiLimiter.check(request, ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const latitude = parseFloat(searchParams.get("lat") || "0");
  const longitude = parseFloat(searchParams.get("lng") || "0");
  const radiusKm = parseInt(searchParams.get("radius") || "10") || 10;
  const limit = Math.min(parseInt(searchParams.get("limit") || "20") || 20, 100);
  const offset = parseInt(searchParams.get("offset") || "0") || 0;

  // Use raw SQL for geographic queries (more efficient)
  const nearbyUsers = await prisma.$queryRaw`
    SELECT 
      u.id,
      u.name,
      u.email,
      p."displayName",
      p.city,
      p.locality,
      p."locationLatitude",
      p."locationLongitude",
      u."createdAt",
      sk.points as "karmaPoints",
      sk.level as "karmaLevel",
      ARRAY_AGG(DISTINCT usk."skillId") as "skillIds",
      SQRT(
        POW(69.1 * (p."locationLatitude" - ${latitude}), 2) +
        POW(69.1 * (${longitude} - p."locationLongitude") * COS(p."locationLatitude"/57.3), 2)
      ) as distance
    FROM "User" u
    LEFT JOIN "Profile" p ON u.id = p."userId"
    LEFT JOIN "SkillKarma" sk ON u.id = sk."userId"
    LEFT JOIN "UserSkillOffered" usk ON u.id = usk."userId"
    WHERE 
      u.id != ${session.user.id}
      AND u."isSuspended" = false
      AND SQRT(
        POW(69.1 * (p."locationLatitude" - ${latitude}), 2) +
        POW(69.1 * (${longitude} - p."locationLongitude") * COS(p."locationLatitude"/57.3), 2)
      ) <= ${radiusKm}
    GROUP BY u.id, p.id, sk.id
    ORDER BY distance ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return NextResponse.json({
    users: nearbyUsers,
    count: nearbyUsers.length,
    hasMore: nearbyUsers.length === limit,
  });
}
```

### 2. Optimize Requests Inbox

**File**: `src/app/api/requests/[id]/route.ts` (GET)

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use select() to fetch only needed fields
  const collaborationRequest = await prisma.collaborationRequest.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: { displayName: true, city: true },
          },
          skillKarma: {
            select: { points: true, level: true },
          },
        },
      },
      skill: {
        select: { id: true, name: true, category: true },
      },
    },
  });

  if (!collaborationRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify user is sender or recipient
  if (
    collaborationRequest.sender.id !== session.user.id &&
    params.id !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(collaborationRequest);
}
```

---

## Frontend Performance Optimization

### 1. Lazy Load Components

```typescript
// src/components/explore/explore-lazy.tsx
import dynamic from "next/dynamic";

// Load map only when visible
const SkillMap = dynamic(
  () => import("./skill-map"),
  { loading: () => <div>Loading map...</div> }
);

// Load modals only when needed
const RequestFormModal = dynamic(
  () => import("@/components/requests/send-request-form"),
  { ssr: false }
);

export function ExplorePageWithLazyComponents() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <>
      <SkillMap />
      {showRequestForm && (
        <RequestFormModal
          onClose={() => setShowRequestForm(false)}
        />
      )}
    </>
  );
}
```

### 2. Implement Pagination

```typescript
// src/components/requests/requests-list.tsx
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

export function RequestsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["requests"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/requests?limit=20&offset=${pageParam}`
      );
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length * 20 : undefined;
    },
  });

  return (
    <>
      {data?.pages.map((page) =>
        page.requests.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </>
  );
}
```

### 3. Image Optimization

```typescript
// src/components/profile-avatar.tsx
import Image from "next/image";
import { cloudinaryClient } from "@/lib/cloudinary";

export function ProfileAvatar({ userId, name }: Props) {
  // Use Cloudinary for auto-optimization
  const imageUrl = cloudinaryClient.url(
    `skillswap/${userId}-avatar`,
    {
      width: 200,
      height: 200,
      fetch_format: "auto", // Auto format conversion
      quality: "auto",      // Auto quality
      crop: "fill",
      gravity: "face",      // Smart cropping
    }
  );

  return (
    <Image
      src={imageUrl}
      alt={name}
      width={200}
      height={200}
      placeholder="blur"
      blurDataURL={`data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0"/%3E%3C/svg%3E`}
      priority={false}
    />
  );
}
```

---

## Caching Strategies

### 1. Server-Side Caching with Unstable_Cache

```typescript
import { unstable_cache } from "next/cache";

// Cache nearby users for 1 hour
export const getNearbyUsers = unstable_cache(
  async (lat: number, lng: number) => {
    return prisma.user.findMany({
      where: {
        profile: {
          locationLatitude: {
            gte: lat - 1,
            lte: lat + 1,
          },
        },
      },
      take: 20,
    });
  },
  ["nearby-users"],
  { revalidate: 3600, tags: ["nearby-users"] }
);
```

### 2. Browser Caching with Cache-Control

```typescript
// src/app/api/skills/category/route.ts
export async function GET(request: Request) {
  // Cache for 1 hour on CDN
  const headers = new Headers();
  headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  const skills = await getNearbyUsers(/* ... */);
  return NextResponse.json(skills, { headers });
}
```

### 3. SWR (Stale While Revalidate) Pattern

```typescript
// src/components/user-profile.tsx
import useSWR from "swr";

export function UserProfile({ userId }: Props) {
  const { data, error, isLoading } = useSWR(
    `/api/profile/${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      focusThrottleInterval: 300000,
    }
  );

  return <ProfileCard profile={data} loading={isLoading} />;
}
```

---

## Database Connection Pooling

For Vercel Postgres, connections are automatically pooled. For other databases:

### PgBouncer (Connection Pooling)

```bash
# docker-compose.yml
version: "3.9"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: skillswap_ar
    ports:
      - 5432:5432

  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    environment:
      DATABASES_HOST: postgres
      DATABASES_PORT: 5432
      DATABASES_USER: postgres
      DATABASES_PASSWORD: password
      DATABASES_DBNAME: skillswap_ar
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 25
    ports:
      - 6432:6432
    depends_on:
      - postgres

# Update .env.local:
DATABASE_URL=postgresql://postgres:password@pgbouncer:6432/skillswap_ar
```

---

## Monitoring Query Performance

### 1. Enable Query Logs

```typescript
// prisma/middleware.ts
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  console.log(
    `Query ${params.model}.${params.action} took ${after - before}ms`
  );

  // Alert if query > 1 second
  if (after - before > 1000) {
    console.warn(`SLOW QUERY: ${params.model}.${params.action} took ${after - before}ms`);
  }

  return result;
});
```

### 2. Analyze Query Plans

```bash
# Connect to database
psql $DATABASE_URL

# Run EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM "User" WHERE "email" = 'test@example.com';

# Should use index, not full table scan
```

---

## Load Testing

### Using k6

```bash
npm install -g k6
```

```javascript
// tests/load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/users/nearby');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

```bash
k6 run tests/load-test.js
```

---

## Optimization Checklist

- [ ] Database indexes added
- [ ] Query optimization (use .select())
- [ ] Pagination implemented
- [ ] Lazy loading for heavy components
- [ ] Image optimization with Cloudinary
- [ ] Cache-Control headers set
- [ ] Connection pooling configured
- [ ] Query performance monitoring
- [ ] Load tests passing
- [ ] Lighthouse audit >90
