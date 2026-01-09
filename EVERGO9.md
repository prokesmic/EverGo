# EVERGO V5 - Comprehensive Technical Documentation

**Version:** 5.0
**Last Updated:** January 2026
**Platform:** Next.js 16 + React 19 + Prisma + PostgreSQL

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Reference](#5-api-reference)
6. [Core Features](#6-core-features)
7. [V5 New Features](#7-v5-new-features)
8. [Ranking System](#8-ranking-system)
9. [Integrations](#9-integrations)
10. [Authentication & Security](#10-authentication--security)
11. [Cron Jobs & Background Tasks](#11-cron-jobs--background-tasks)
12. [Testing & Quality Assurance](#12-testing--quality-assurance)
13. [Deployment](#13-deployment)
14. [Environment Variables](#14-environment-variables)
15. [Feature Flags](#15-feature-flags)
16. [Migration Guide (V4 → V5)](#16-migration-guide-v4--v5)

---

## 1. Executive Summary

**Evergo** is a sports performance and social fitness platform that combines activity tracking, competitive rankings, gamification, and social features into a unified experience for athletes of all levels.

### Key Capabilities

- **Activity Tracking**: Manual logging and automatic import from Strava/Garmin
- **Multi-Dimensional Rankings**: Global, country, city, friends, and team leaderboards
- **Competitive Features**: Weekly rank battles, challenges, rivalries
- **Social Platform**: Activity feed, posts, following, teams
- **Gamification**: Badges, streaks, achievements, effort scores
- **Verification System**: Bronze/Silver/Gold tiers for result verification

### V5 Highlights

- **Effort Score System**: Universal cross-sport effort metric
- **Rank Battles**: Weekly automated 1v1 competitions
- **First Week Magic**: Enhanced onboarding for new users
- **Floating Rank Pill**: Mobile-first rank display
- **Almost There Notifications**: Encouraging push when close to goals
- **Feature Pruning**: Deprecated unused features for simplicity

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 4.x | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Framer Motion | 11.18.2 | Animations |
| Zustand | 5.0.9 | State management |
| React Hook Form | 7.67.0 | Form handling |
| Zod | 3.x | Schema validation |
| Recharts | 3.5.1 | Data visualization |
| Leaflet | 1.9.4 | Maps |
| Lucide React | 0.555.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 6.19.0 | ORM & database toolkit |
| PostgreSQL | 15+ | Primary database |
| NextAuth | 4.24.13 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| date-fns | 4.1.0 | Date manipulation |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & deployment |
| Supabase | Storage & optional realtime |
| Stripe | Payment processing |
| Strava API | Activity import |

---

## 3. Project Structure

```
/Users/michal/Evergo/
├── app/                          # Next.js App Router
│   ├── api/                      # REST API endpoints (60+ routes)
│   │   ├── activities/           # Activity CRUD
│   │   ├── auth/                 # Authentication
│   │   ├── cron/                 # Scheduled jobs
│   │   ├── feed/                 # Social feed
│   │   ├── rankings/             # Leaderboards
│   │   ├── strava/               # Strava integration
│   │   ├── teams/                # Team management
│   │   └── ...
│   ├── home/                     # Main dashboard
│   ├── profile/[username]/       # User profiles
│   ├── rankings/                 # Rankings page
│   ├── activity/                 # Activity pages
│   ├── challenges/               # Challenges
│   ├── teams/                    # Teams
│   ├── settings/                 # User settings
│   ├── (onboarding)/             # Onboarding flow
│   └── layout.tsx                # Root layout
│
├── components/                   # React components (54+ directories)
│   ├── ui/                       # Radix UI wrappers
│   ├── home/                     # Dashboard components
│   ├── rankings/                 # Ranking displays
│   ├── battles/                  # Rank battle UI
│   ├── effort/                   # Effort score UI
│   ├── first-week/               # Onboarding UI
│   ├── feed/                     # Social feed
│   ├── activity/                 # Activity UI
│   └── ...
│
├── lib/                          # Core business logic (57+ modules)
│   ├── rankings/                 # Ranking computation
│   ├── sport-index/              # Sport Index calculation
│   ├── integrations/strava/      # Strava sync
│   ├── effort-score.ts           # Effort scoring
│   ├── rank-battles.ts           # Battle matching
│   ├── first-week.ts             # Onboarding logic
│   ├── almost-there.ts           # Encouragement notifications
│   ├── notifications.ts          # Notification system
│   ├── features.ts               # Feature flags
│   ├── auth.ts                   # NextAuth config
│   └── db.ts                     # Prisma client
│
├── prisma/
│   ├── schema.prisma             # Database schema (2700+ lines)
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Demo data seeder
│
├── hooks/                        # Custom React hooks
├── schemas/                      # Zod validation schemas
├── types/                        # TypeScript definitions
├── e2e/                          # Playwright E2E tests
├── tests/                        # Unit tests
├── scripts/                      # Utility scripts
├── public/                       # Static assets
│
├── middleware.ts                 # Auth middleware
├── next.config.ts                # Next.js config
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies
```

---

## 4. Database Schema

### Core Models

#### User
Primary identity model with profile, location, and settings.

```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  emailVerified       DateTime?
  username            String?   @unique
  displayName         String?
  avatarUrl           String?
  bio                 String?

  // Location (normalized)
  city                String?
  country             String?
  countryCode         String?   // ISO 3166-1 alpha-2
  cityId              String?

  // Profile
  dateOfBirth         DateTime?
  gender              String?
  privacyLevel        String    @default("PUBLIC")
  onboardingCompleted Boolean   @default(false)
  primarySportId      String?

  // Relations
  activities          Activity[]
  posts               Post[]
  stats               UserStats?
  badges              UserBadge[]
  teams               TeamMember[]
  weeklyEffortScores  WeeklyEffortScore[]
  battlesAsChallenger RankBattle[] @relation("BattleChallenger")
  battlesAsOpponent   RankBattle[] @relation("BattleOpponent")
  // ... 30+ relations
}
```

#### Activity
Individual workout/activity with metrics and verification.

```prisma
model Activity {
  id               String    @id @default(cuid())
  userId           String
  disciplineId     String?
  sportId          String?

  // Core data
  title            String?
  description      String?
  activityDate     DateTime
  durationSeconds  Int?
  distanceMeters   Float?
  elevationGain    Float?
  caloriesBurned   Int?

  // Heart rate
  avgHeartRate     Int?
  maxHeartRate     Int?

  // Performance
  avgPace          Float?
  avgSpeed         Float?
  score            Float?

  // V5 Effort System
  effortScore      Float?
  effortMultiplier Float?    @default(1.0)
  isRace           Boolean   @default(false)
  rpe              Int?      // Rate of Perceived Exertion (1-10)

  // GPS & Media
  gpsRoute         Json?
  mapImageUrl      String?
  photos           Json?     // Array of URLs

  // Source & Verification
  source           ActivitySource @default(MANUAL)
  externalId       String?
  verificationTier VerificationTier @default(BRONZE)

  // Anti-cheat
  anomalyScore     Float?
  isAnomalous      Boolean   @default(false)

  // Visibility
  visibility       Visibility @default(PUBLIC)
}

enum ActivitySource {
  MANUAL
  STRAVA
  GARMIN
  APPLE_HEALTH
  GOOGLE_FIT
  WAHOO
  POLAR
  SUUNTO
  COROS
  FILE_IMPORT
}

enum VerificationTier {
  BRONZE  // Manual, no proof
  SILVER  // Manual + proof OR trusted device without GPS
  GOLD    // Device sync with GPS
}
```

#### WeeklyEffortScore (V5)
Weekly effort aggregation for rankings and battles.

```prisma
model WeeklyEffortScore {
  id              String   @id @default(cuid())
  userId          String
  weekStart       DateTime
  weekEnd         DateTime

  totalScore      Float    @default(0)
  easyMinutes     Int      @default(0)
  moderateMinutes Int      @default(0)
  hardMinutes     Int      @default(0)
  raceMinutes     Int      @default(0)
  activityCount   Int      @default(0)

  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, weekStart])
  @@index([weekStart, totalScore(sort: Desc)])
}
```

#### RankBattle (V5)
Weekly 1v1 competitive battles.

```prisma
model RankBattle {
  id                   String           @id @default(cuid())
  weekStart            DateTime
  weekEnd              DateTime

  challengerId         String
  opponentId           String

  scope                String           // 'city', 'country', 'global'
  scopeValue           String?          // e.g., "Prague"

  challengerStartRank  Int
  opponentStartRank    Int
  challengerScore      Float            @default(0)
  opponentScore        Float            @default(0)

  status               RankBattleStatus @default(ACTIVE)
  winnerId             String?

  challenger           User             @relation("BattleChallenger", ...)
  opponent             User             @relation("BattleOpponent", ...)

  @@unique([challengerId, weekStart])
  @@index([weekStart, status])
}

enum RankBattleStatus {
  ACTIVE
  CHALLENGER_WON
  OPPONENT_WON
  TIE
  EXPIRED
}
```

### Social Models

```prisma
model Post {
  id           String     @id @default(cuid())
  userId       String
  type         PostType   @default(STATUS)
  content      String?
  photos       Json?
  visibility   Visibility @default(PUBLIC)
  likesCount   Int        @default(0)
  commentsCount Int       @default(0)
  activityId   String?    @unique
}

model Follow {
  followerId   String
  followingId  String
  createdAt    DateTime @default(now())
  @@id([followerId, followingId])
}

model Team {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String?
  logoUrl      String?
  sportId      String?
  isPublic     Boolean  @default(true)
  memberCount  Int      @default(0)
  avgSportIndex Float?
  globalRank   Int?
}
```

### Gamification Models

```prisma
model Badge {
  id          String        @id @default(cuid())
  name        String
  description String?
  iconUrl     String?
  category    BadgeCategory
  criteria    BadgeCriteria
  threshold   Float?
  rarity      BadgeRarity   @default(COMMON)
}

model UserStreak {
  id              String   @id @default(cuid())
  userId          String   @unique
  currentStreak   Int      @default(0)
  longestStreak   Int      @default(0)
  lastActivityDate DateTime?
  weeklyGoal      Int      @default(3)
  weeklyProgress  Int      @default(0)
}

model Challenge {
  id          String   @id @default(cuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime
  targetType  String   // 'distance', 'duration', 'activities'
  targetValue Float
  scope       ChallengeScope @default(GLOBAL)
  sportId     String?
  badgeId     String?
}
```

### Complete Schema Statistics

| Category | Model Count |
|----------|-------------|
| Core (User, Activity, Sport) | 8 |
| Rankings & Benchmarks | 12 |
| Social (Posts, Teams, Communities) | 15 |
| Gamification (Badges, Challenges) | 8 |
| V5 Features (Effort, Battles) | 3 |
| Integrations (Strava, Imports) | 7 |
| Admin & Ops | 6 |
| **Total** | **~60 models** |

---

## 5. API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/auth/register` | User registration |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | List user activities |
| POST | `/api/activities` | Create activity |
| GET | `/api/activities/[id]` | Get activity detail |

### Rankings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rankings/leaderboard` | Get leaderboard |
| GET | `/api/rankings/benchmark` | Benchmark-specific rankings |
| GET | `/api/rankings/most-active` | 28-day activity leaderboard |
| GET | `/api/rankings/user/[userId]` | User's ranking summary |
| GET | `/api/me/rankings/hero` | Current user's hero ranks |

### Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/posts` | List/create posts |
| POST | `/api/posts/[id]/like` | Like/unlike post |
| GET/POST | `/api/posts/[id]/comments` | Post comments |
| GET | `/api/feed` | Primary feed |
| GET | `/api/feed/highlights` | Curated highlights |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/teams` | List/create teams |
| GET/PUT | `/api/teams/[slug]` | Team detail |
| POST | `/api/teams/[slug]/join` | Join team |
| GET/POST | `/api/teams/[slug]/posts` | Team feed |

### Strava

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/strava/connect` | OAuth redirect |
| GET | `/api/strava/callback` | OAuth callback |
| POST | `/api/strava/sync` | Manual sync |
| POST | `/api/strava/disconnect` | Disconnect |
| POST | `/api/strava/webhook` | Webhook handler |

### Cron Jobs

| Method | Endpoint | Schedule | Description |
|--------|----------|----------|-------------|
| GET | `/api/cron/rank-battles` | Daily 5 AM UTC (Mon) | Match & finalize battles |
| GET | `/api/cron/recalculate-rankings` | Daily | Rebuild ranking caches |
| GET | `/api/cron/strava-sync` | Daily 6 AM UTC | Queue Strava syncs |
| GET | `/api/jobs/run` | Daily 7 AM UTC | Process job queue |

---

## 6. Core Features

### Activity Tracking

**Supported Metrics:**
- Distance (km/mi)
- Duration (hh:mm:ss)
- Elevation gain (m/ft)
- Calories burned
- Heart rate (avg/max)
- Pace/Speed
- GPS route & map
- Photos & notes

**Input Methods:**
1. Manual entry via form
2. Strava import (automatic sync)
3. File upload (.fit, .gpx, .tcx)
4. Apple Health (future)
5. Garmin Connect (future)

**Verification Tiers:**
- **Bronze**: Manual entry, no proof
- **Silver**: Manual + evidence OR trusted device without GPS
- **Gold**: Device sync with GPS verification

### Social Feed

**Post Types:**
- Activity posts (auto-generated from workouts)
- Status updates (text)
- Photo posts
- Achievement posts (PBs, badges)
- Milestone posts (streaks, rank changes)

**Engagement:**
- Likes (reaction types)
- Comments
- Shares (future)

**Feed Algorithms:**
- **Following**: Chronological from followed users
- **Highlights**: Curated based on engagement + significance
- **Combined**: Mix with highlight priority

### Teams & Clubs

**Features:**
- Create public/private teams
- Team leaderboards (aggregate Sport Index)
- Team feed & posts
- Team challenges
- Role-based permissions (Owner, Admin, Member)

**Statistics:**
- Member count
- Total distance
- Average Sport Index
- Team rankings (global, country, city)

### Challenges

**Types:**
- Distance goals (run 100km)
- Duration goals (train 20 hours)
- Activity count (30 workouts)
- Elevation goals (climb 5000m)
- Streak challenges (7 consecutive days)

**Scopes:**
- Global (anyone can join)
- Team-specific
- Personal goals

**Rewards:**
- Badges on completion
- Sponsor prizes (partner discounts)
- Leaderboard position

### Gamification

**Badges:**
- Distance milestones (10km, 100km, 1000km)
- Consistency (7-day, 30-day streaks)
- Performance (PB achievements)
- Social (followers, team joins)
- Challenge completion

**Rarity Tiers:**
- Common → Uncommon → Rare → Epic → Legendary

**Streaks:**
- Daily activity streak
- Weekly goal streak
- All-time longest streak

---

## 7. V5 New Features

### Effort Score System

**Purpose:** Universal cross-sport effort metric that works regardless of sport type.

**Formula:**
```
Effort Score = Duration (minutes) × Effort Multiplier
```

**Multipliers by Intensity:**
| Intensity | RPE Range | Multiplier |
|-----------|-----------|------------|
| Easy | 1-4 | 1.0x |
| Moderate | 5-7 | 1.5x |
| Hard | 8-10 | 2.0x |
| Race/Competition | Any | 3.0x |

**Weekly Aggregation:**
- Tracks easy/moderate/hard/race minutes
- Activity count
- Total weekly score
- Used for effort-based leaderboards

**Implementation:** `lib/effort-score.ts`

```typescript
export function calculateEffortScore(
  durationSeconds: number,
  rpe: number = 5,
  isRace: boolean = false
): { score: number; multiplier: number; category: EffortCategory }
```

### Rank Battles

**Concept:** Weekly automated 1v1 competitions between similarly-ranked users.

**Matching Algorithm:**
1. Find users with activity in last 2 weeks
2. Group by city (prefer local battles)
3. Match users within ±3 rank positions
4. Create battle records

**Timeline:**
- **Monday 5 AM UTC**: Match new battles, notify users
- **Throughout week**: Scores update as activities logged
- **Sunday 11:59 PM**: Battles finalize
- **Monday**: Winners determined, notifications sent

**Status Flow:**
```
ACTIVE → CHALLENGER_WON / OPPONENT_WON / TIE / EXPIRED
```

**Implementation:** `lib/rank-battles.ts`

```typescript
export async function matchRankBattles(): Promise<number>
export async function updateBattleScores(userId: string): Promise<void>
export async function finalizeBattles(): Promise<void>
export async function getUserActiveBattle(userId: string)
```

**UI Component:** `components/battles/RankBattleCard.tsx`

### First Week Magic

**Purpose:** Simplified onboarding experience for new users with milestone-based progress.

**Milestones (7-day period):**
1. Log first activity
2. Log 3 activities
3. Reach 100 effort points
4. Log 5 activities

**Features:**
- Progress card showing completion status
- Contextual tips based on current state
- Encouraging notifications
- Quick path to seeing first rank

**Implementation:** `lib/first-week.ts`

```typescript
export async function getFirstWeekProgress(userId: string): Promise<FirstWeekProgress>
export function getFirstWeekTips(progress: FirstWeekProgress): FirstWeekTip[]
export async function isUserInFirstWeek(userId: string): Promise<boolean>
```

**UI Components:**
- `components/first-week/FirstWeekCard.tsx`
- `components/first-week/FirstWeekTips.tsx`

### Floating Rank Pill

**Purpose:** Mobile-first floating UI element showing current rank and effort score.

**Features:**
- Expandable for more detail
- Scope switcher (global/country/city)
- Shows rank delta from last week
- Links to full rankings

**Implementation:** `components/rankings/FloatingRankPill.tsx`

### Almost There Notifications

**Purpose:** Encouraging notifications when users are close to goals.

**Triggers:**
| Type | Threshold | Message Example |
|------|-----------|-----------------|
| Rank Up | Within 10 pts | "Just 8 pts to pass John!" |
| Battle Win | Within 15 pts | "Only 12 pts behind in your battle!" |
| Weekly Goal | Within 20 pts | "15 pts to hit your weekly goal!" |

**Implementation:** `lib/almost-there.ts`

```typescript
export async function checkAlmostThere(userId: string): Promise<AlmostThereCheck[]>
export async function sendAlmostThereNotifications(userId: string): Promise<void>
export async function getAlmostThereInsights(userId: string): Promise<AlmostThereInsight[]>
```

**UI Component:** `components/notifications/AlmostThereCard.tsx`

### Rank Ladder

**Purpose:** Shows users ranked immediately above and below current user.

**Display:** ±2 entries around user (5 total entries)

**Data:**
- User rank in scope
- Points to next rank
- Points behind previous rank
- Weekly delta

**Implementation:** `lib/rankings/rank-ladder.ts`

**UI Components:**
- `components/rankings/RankLadder.tsx`
- `components/rankings/RankScopeTabs.tsx`

---

## 8. Ranking System

### Scopes

| Scope | Description | Filter |
|-------|-------------|--------|
| Global | All users worldwide | None |
| Country | Users in same country | `country = user.country` |
| City | Users in same city | `city = user.city` |
| Friends | Users you follow | `userId IN following` |
| Team | Team members | `teamId = team.id` |

### Dimensions

| Dimension | Description | Calculation |
|-----------|-------------|-------------|
| Sport Index | Overall cross-sport score | Weighted combination of all sports |
| Fitness Score | Effort-based | Sum of effort scores |
| Benchmark | Specific metric | Best time/score in discipline |

### Verification Modes

| Mode | Description | Eligibility |
|------|-------------|-------------|
| Community | All users | Any verification tier |
| Verified | Sensor-verified only | Gold tier activities |

### Caching Strategy

**RankingCache Table:**
- Top 100 users per scope/dimension
- Refreshed daily by cron job
- 1-minute TTL for real-time queries

**Query Pattern:**
```typescript
// Fast path: cached leaderboard
const cached = await prisma.rankingCache.findFirst({
  where: { dimension, scope, scopeIdentifier, verifiedOnly }
})

// Slow path: compute on demand
if (!cached || isStale(cached)) {
  const leaderboard = await computeLeaderboard(...)
  await updateCache(...)
}
```

### Sport Index Calculation

**Concept:** Universal 0-1000 score combining all user's sports.

**Factors:**
- Personal bests in benchmarks
- Activity volume (weighted by recency)
- Sport-specific weighting
- Decay for inactivity (after 24 months)

**Events Tracked:**
- ACTIVITY_ADDED
- PERSONAL_BEST_ADDED
- DECAY_APPLIED
- ADMIN_ADJUSTMENT

---

## 9. Integrations

### Strava Integration

**OAuth Flow:**
1. User clicks "Connect Strava"
2. Redirect to Strava authorization
3. User grants permissions
4. Callback receives OAuth code
5. Exchange code for tokens
6. Store connection (encrypted refresh token)
7. Trigger backfill of activities

**Sync Operations:**

| Operation | Trigger | Activities |
|-----------|---------|------------|
| Backfill | Initial connection | Last 1 year |
| Incremental | Daily cron | Last 30 days |
| Webhook | Real-time | Single activity |

**Data Mapping:**
```typescript
// Strava activity type → Evergo sport
const sportMap = {
  'Run': 'running',
  'Ride': 'cycling',
  'Swim': 'swimming',
  'Walk': 'walking',
  'Hike': 'hiking',
  // ... 30+ mappings
}
```

**Webhook Events:**
- `activity.create` → Import new activity
- `activity.update` → Update existing
- `activity.delete` → Mark as deleted

**Security:**
- Refresh tokens encrypted at rest
- Access tokens short-lived (6 hours)
- Webhook signature verification

**Implementation:** `lib/integrations/strava/`

### Future Integrations (Planned)

- Garmin Connect
- Apple Health
- Google Fit
- Wahoo
- Polar
- Suunto
- COROS

---

## 10. Authentication & Security

### NextAuth Configuration

**Strategy:** JWT-based sessions

**Token Contents:**
```typescript
{
  sub: string           // User ID
  email: string
  name: string
  picture: string
  onboardingCompleted: boolean
}
```

**Session Lifetime:** 30 days (with refresh)

### Middleware Protection

**Public Routes:**
- `/` (landing)
- `/login`
- `/register`
- `/forgot-password`

**Protected Routes:** All others require authentication

**Onboarding Enforcement:**
- Users with `onboardingCompleted = false` redirected to `/onboarding`
- Cannot access main app until complete

### Password Security

- bcryptjs with 10 salt rounds
- Minimum 8 characters
- Email verification (optional)

### API Security

**Cron Jobs:**
- Bearer token authentication
- `CRON_SECRET` environment variable
- Vercel Cron automatic auth header

**Webhooks:**
- Signature verification (Strava)
- Request timestamp validation
- IP allowlisting (optional)

---

## 11. Cron Jobs & Background Tasks

### Scheduled Jobs

| Job | Schedule | Duration | Purpose |
|-----|----------|----------|---------|
| Rank Battles | Mon 5 AM UTC | ~5 min | Match/finalize battles |
| Strava Sync | Daily 6 AM UTC | ~2 min | Queue activity syncs |
| Job Runner | Daily 7 AM UTC | ~10 min | Process queued jobs |

### Job Infrastructure

**CronJobRun Tracking:**
```prisma
model CronJobRun {
  id               String   @id
  jobName          String
  runId            String
  status           String   // IN_PROGRESS, COMPLETED, FAILED
  startedAt        DateTime
  finishedAt       DateTime?
  durationMs       Int?
  recordsProcessed Int?
  recordsUpdated   Int?
  errorSummary     String?
  statsJson        Json?
}
```

**Locking Mechanism:**
- Prevents concurrent runs of same job
- Stale lock detection (30 min timeout)
- Automatic retry on failure

**Pattern:**
```typescript
export async function GET(request: NextRequest) {
  const authError = verifyCronRequest(request)
  if (authError) return authError

  return runCronJob(
    { jobName: "my-job" },
    async () => {
      // Job logic
      return { recordsProcessed: n }
    }
  )
}
```

### Integration Job Queue

**IntegrationJob Model:**
```prisma
model IntegrationJob {
  id       String   @id
  type     String   // STRAVA_BACKFILL, STRAVA_SYNC_RECENT, etc.
  payload  Json?
  status   String   // PENDING, RUNNING, DONE, FAILED
  runAt    DateTime
  attempts Int      @default(0)
  error    String?
}
```

**Retry Strategy:**
- Max 5 attempts
- Exponential backoff: 1min, 5min, 25min, 2hrs

---

## 12. Testing & Quality Assurance

### E2E Tests (Playwright)

**Location:** `/e2e/`

**Test Suites:**
- Authentication flows
- Activity CRUD
- Ranking displays
- Feed interactions
- Team management
- Strava integration

**Commands:**
```bash
npm test                    # All browsers
npm run test:headed         # Visible browser
npm run test:chromium       # Single browser
npm run test:mobile         # Mobile viewports
npm run test:a11y           # Accessibility
npm run test:visual         # Visual regression
```

### Unit Tests

**Location:** `/tests/`

**Coverage:**
- Effort score calculation
- Rank battle matching
- Verification tier logic
- Feed generation

**Command:**
```bash
npm run test:unit
```

### Type Safety

```bash
npm run typecheck          # TypeScript strict mode
npm run lint               # ESLint + React rules
```

### Multi-User Integration (MIKE)

**Location:** `/mike/`

**Simulates:**
- Multiple concurrent users
- Real-world activity patterns
- Ranking recalculation
- Battle matching

---

## 13. Deployment

### Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "npm run vercel-build",
  "crons": [
    { "path": "/api/cron/strava-sync", "schedule": "0 6 * * *" },
    { "path": "/api/jobs/run", "schedule": "0 7 * * *" }
  ]
}
```

### Build Process

```bash
# Full build
prisma generate            # Generate Prisma client
prisma db push            # Apply schema changes
next build                # Build Next.js app

# Vercel (automatic)
npm run vercel-build      # prisma generate && next build
```

### Database Migrations

```bash
# Development
prisma db push            # Quick schema sync

# Production
prisma migrate dev        # Create migration
prisma migrate deploy     # Apply migrations
```

### Environment Setup

1. Clone repository
2. Copy `.env.example` to `.env`
3. Fill in required variables
4. Run `npm install`
5. Run `prisma db push`
6. Run `npm run dev`

---

## 14. Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_URL=postgresql://user:pass@host/db

# Auth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://evergo.app

# Strava
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=secret
STRAVA_WEBHOOK_VERIFY_TOKEN=token
```

### Optional

```bash
# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Push Notifications
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx

# Cron Security
CRON_SECRET=<random token>
```

---

## 15. Feature Flags

### Configuration

**File:** `lib/features.ts`

```typescript
export const FEATURES = {
  // Core - Always enabled
  activities: true,
  rankings: true,
  challenges: true,
  feed: true,
  following: true,
  teams: true,

  // V5 New Features
  effortScore: true,
  rankLadder: true,
  rankBattles: true,
  floatingRankPill: true,
  almostThereNotifications: true,

  // Deprecated (V5)
  paceBot: false,
  leagues: false,
  cohorts: false,
  communities: false,
  trainingPlans: false,
  partnerFinder: false,
  perks: false,
  productOffers: false,
  benchmarks: false,
} as const

export function isFeatureEnabled(feature: FeatureKey): boolean
export function isDeprecated(feature: FeatureKey): boolean
```

### Usage

```typescript
import { isFeatureEnabled } from '@/lib/features'

// In components
{isFeatureEnabled('rankBattles') && <RankBattleCard />}

// In API routes
if (!isFeatureEnabled('communities')) {
  return NextResponse.json({ error: 'Feature deprecated' }, { status: 410 })
}
```

---

## 16. Migration Guide (V4 → V5)

### Deprecated Features

| Feature | Replacement | Migration Path |
|---------|-------------|----------------|
| PaceBot | Rank Battles | Auto-migrated to weekly battles |
| Leagues | Teams | Merge into team system |
| Cohorts | First Week Magic | New onboarding flow |
| Communities | Teams | Convert to teams or archive |
| Training Plans | - | Archive existing plans |
| Partner Finder | - | Feature removed |
| Perks/Trophy | - | Feature removed |
| Benchmarks UI | Rankings | Merged into ranking system |

### New Schema Fields

**Activity:**
```sql
ALTER TABLE "Activity" ADD COLUMN "effortScore" FLOAT;
ALTER TABLE "Activity" ADD COLUMN "effortMultiplier" FLOAT DEFAULT 1.0;
ALTER TABLE "Activity" ADD COLUMN "isRace" BOOLEAN DEFAULT false;
```

**New Tables:**
- `WeeklyEffortScore`
- `RankBattle`

### Data Migration

1. Run `prisma db push` to apply schema changes
2. Run backfill script for effort scores:
   ```bash
   npm run backfill:effort-scores
   ```
3. Initial rank battle matching will occur on next Monday cron

### UI Updates

Components updated for V5:
- `app/home/page.tsx` - Integrated V5 components
- New components added to `components/`

---

## Appendix A: Key File Locations

| Purpose | File |
|---------|------|
| Database schema | `prisma/schema.prisma` |
| Auth config | `lib/auth.ts` |
| Feature flags | `lib/features.ts` |
| Effort scoring | `lib/effort-score.ts` |
| Rank battles | `lib/rank-battles.ts` |
| First week | `lib/first-week.ts` |
| Notifications | `lib/notifications.ts` |
| Strava sync | `lib/integrations/strava/` |
| Home page | `app/home/page.tsx` |
| Rankings | `lib/rankings/` |
| Cron utilities | `lib/cron/` |

---

## Appendix B: Component Index

### Home Dashboard
- `SlimHero` - Hero section
- `AthleteRibbon` - Rank strip
- `PulseRail` - Friend activity stories
- `CompeteNowDeck` - Active competitions
- `HomeFeedTabs` - Feed switcher

### V5 Components
- `FirstWeekCard` - Onboarding progress
- `FirstWeekTips` - Contextual tips
- `RankLadder` - Users above/below
- `RankScopeTabs` - Scope selector
- `RankBattleCard` - Battle display
- `EffortScoreCard` - Weekly effort
- `FloatingRankPill` - Mobile rank
- `AlmostThereCard` - Encouragement

### Rankings
- `AnimatedLeaderboard` - Scrollable leaderboard
- `HeroRankBar` - Rank position bar
- `ModeToggle` - Community/Verified

### Feed
- `Feed` - Primary feed
- `CreatePostBox` - Post creation
- `FeedItem` - Individual item

---

## Appendix C: API Response Formats

### Leaderboard Response
```json
{
  "scope": "global",
  "dimension": "sport_index",
  "total": 12543,
  "entries": [
    {
      "rank": 1,
      "userId": "clx...",
      "displayName": "John Doe",
      "avatarUrl": "https://...",
      "score": 892,
      "delta": 12
    }
  ],
  "userRank": {
    "rank": 156,
    "percentile": 98.7,
    "score": 654
  }
}
```

### Rank Battle Response
```json
{
  "id": "clx...",
  "status": "ACTIVE",
  "weekStart": "2026-01-06T00:00:00Z",
  "weekEnd": "2026-01-12T23:59:59Z",
  "challenger": {
    "id": "clx...",
    "displayName": "User A",
    "avatarUrl": "..."
  },
  "opponent": {
    "id": "clx...",
    "displayName": "User B",
    "avatarUrl": "..."
  },
  "challengerScore": 145,
  "opponentScore": 132,
  "scope": "city",
  "scopeValue": "Prague"
}
```

---

*Document generated January 2026. For latest updates, see repository.*
