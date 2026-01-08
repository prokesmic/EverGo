# EVERGO - Comprehensive Technical Documentation

**Version:** 5.0
**Last Updated:** January 2026
**Platform:** Sports Performance & Social Network

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Schema](#4-database-schema)
5. [Feature Catalog](#5-feature-catalog)
6. [API Reference](#6-api-reference)
7. [Authentication & Security](#7-authentication--security)
8. [UI Components](#8-ui-components)
9. [External Integrations](#9-external-integrations)
10. [Deployment & Infrastructure](#10-deployment--infrastructure)
11. [Testing Framework](#11-testing-framework)
12. [Design Patterns](#12-design-patterns)

---

## 1. Executive Summary

**Evergo** is a sophisticated sports performance tracking and social networking platform built on modern web technologies. It combines activity tracking, competitive rankings, team collaboration, and social features into a unified experience for athletes of all levels.

### Core Value Propositions

- **Sport Index System**: Proprietary 0-1000 composite athletic score calculated from multiple benchmarks
- **Multi-Scope Rankings**: Global, country, city, and team-based leaderboards
- **Social Competition**: 1v1 rivalries, challenges, and team battles
- **Activity Tracking**: Manual logging + Strava integration
- **Gamification**: Badges, streaks, challenges, and achievements
- **Training Plans**: Structured workout programs with progress tracking

### Target Users

- Amateur and professional athletes
- Sports enthusiasts tracking personal records
- Teams and clubs managing group activities
- Fitness communities seeking competitive motivation

---

## 2. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | ^16.0.7 | Full-stack React framework (App Router) |
| React | 19.2.0 | UI library |
| TypeScript | ^5 | Type safety |
| Node.js | ES2017 | Runtime environment |

### Database & ORM
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | Latest | Primary database (via Supabase) |
| Prisma | ^6.0.0 | ORM and database toolkit |
| Supabase | ^2.86.2 | Managed PostgreSQL + realtime |

### Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| NextAuth.js | ^4.24.13 | Authentication framework |
| @next-auth/prisma-adapter | ^1.0.7 | Prisma adapter for NextAuth |
| bcryptjs | ^3.0.3 | Password hashing |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | ^4 | Utility-first CSS |
| Radix UI | Various | Accessible UI primitives |
| Framer Motion | ^11.18.2 | Animation library |
| Lucide React | ^0.555.0 | Icon library |
| Recharts | ^3.5.1 | Data visualization |

### Form & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| React Hook Form | ^7.67.0 | Form management |
| Zod | ^4.1.13 | Schema validation |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | ^5.0.9 | Lightweight state management |

### Additional Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| date-fns | ^4.1.0 | Date utilities |
| Leaflet | ^1.9.4 | Map rendering |
| web-push | ^3.6.7 | Push notifications |
| @dnd-kit | ^6.3.1 | Drag and drop |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Playwright | ^1.57.0 | E2E testing |
| @axe-core/playwright | ^4.10.0 | Accessibility testing |

---

## 3. Architecture Overview

### Project Structure

```
/Users/michal/Evergo/
├── app/                        # Next.js App Router
│   ├── (onboarding)/           # Grouped onboarding routes
│   ├── api/                    # API routes (84+ endpoints)
│   ├── activity/               # Activity pages
│   ├── calendar/               # Calendar feature
│   ├── challenges/             # Challenges feature
│   ├── communities/            # Communities feature
│   ├── feed/                   # Social feed
│   ├── home/                   # Main dashboard
│   ├── leaderboard/            # Leaderboard pages
│   ├── login/                  # Authentication
│   ├── notifications/          # Notification center
│   ├── profile/                # User profiles
│   ├── rankings/               # Rankings feature
│   ├── register/               # Registration
│   ├── rivalries/              # Rivalries feature
│   ├── settings/               # User settings
│   ├── sports/                 # Sports management
│   ├── teams/                  # Teams feature
│   └── training-plans/         # Training plans
│
├── components/                 # React components (36 categories)
│   ├── activity/               # Activity components
│   ├── benchmarks/             # Benchmark displays
│   ├── calendar/               # Calendar widgets
│   ├── challenges/             # Challenge UI
│   ├── comments/               # Comment system
│   ├── communities/            # Community components
│   ├── dashboard/              # Dashboard widgets
│   ├── feed/                   # Feed components
│   ├── gamification/           # Badges, streaks
│   ├── gear/                   # Gear management
│   ├── home/                   # Home page components
│   ├── landing/                # Landing page
│   ├── layout/                 # Layout components
│   ├── leaderboard/            # Leaderboard UI
│   ├── notifications/          # Notification UI
│   ├── onboarding/             # Onboarding wizard
│   ├── profile/                # Profile components
│   ├── pwa/                    # PWA components
│   ├── rankings/               # Ranking displays
│   ├── rivalry/                # Rivalry UI
│   ├── settings/               # Settings forms
│   ├── sports/                 # Sports selection
│   ├── teams/                  # Team components
│   ├── training/               # Training plan UI
│   └── ui/                     # Shared UI primitives
│
├── lib/                        # Business logic (69 files)
│   ├── actions/                # Server action utilities
│   ├── benchmarks/             # Benchmark scoring
│   ├── calendar/               # Calendar logic
│   ├── competition/            # Competition engine
│   ├── discover/               # Discovery algorithms
│   ├── feed/                   # Feed generation
│   ├── hero/                   # Hero section data
│   ├── integrations/           # External integrations
│   │   └── strava/             # Strava API client
│   ├── leaderboards/           # Leaderboard queries
│   ├── location/               # Location utilities
│   ├── onboarding/             # Onboarding flow
│   ├── rankings/               # Ranking calculations
│   ├── rivalry/                # Rivalry mechanics
│   ├── sport-index/            # Sport Index algorithm
│   └── sports/                 # Sport data
│
├── hooks/                      # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   ├── use-realtime-feed.ts
│   └── use-toast.ts
│
├── prisma/                     # Database
│   ├── schema.prisma           # Schema definition (2190 lines)
│   ├── migrations/             # Database migrations
│   └── seed/                   # Seed scripts
│
├── schemas/                    # Zod validation schemas
├── e2e/                        # Playwright tests
├── mike/                       # Custom test framework
├── public/                     # Static assets
└── scripts/                    # Build utilities
```

### Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS MIDDLEWARE                         │
│  - Authentication check (JWT validation)                        │
│  - Onboarding completion redirect                               │
│  - Protected route enforcement                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     SERVER COMPONENTS   │     │      API ROUTES         │
│  - Data fetching        │     │  - RESTful endpoints    │
│  - Prisma queries       │     │  - Server actions       │
│  - SSR rendering        │     │  - Webhook handlers     │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRISMA ORM                                 │
│  - Query building                                               │
│  - Transaction management                                       │
│  - Type-safe database access                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   POSTGRESQL (Supabase)                         │
│  - 60+ database models                                          │
│  - Relational data storage                                      │
│  - Full-text search                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### Entity Relationship Overview

The database consists of **60+ models** organized into logical domains:

### Core Domain Models

#### User Management
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  username              String?   @unique
  password              String?
  displayName           String
  bio                   String?
  avatarUrl             String?
  coverPhotoUrl         String?

  // Location (normalized)
  countryCode           String?
  countryName           String?
  cityId                String?
  cityName              String?
  city                  String?   // Legacy
  country               String?   // Legacy

  // Profile
  dateOfBirth           DateTime?
  gender                String?
  privacyLevel          PrivacyLevel @default(PUBLIC)

  // Status
  onboardingCompleted   Boolean   @default(false)
  primarySportId        String?

  // Relations
  sports                UserSport[]
  activities            Activity[]
  stats                 UserStats?
  followers             Follow[]   @relation("following")
  following             Follow[]   @relation("followers")
  teams                 TeamMember[]
  notifications         Notification[]
  badges                UserBadge[]
  streaks               UserStreak[]
  // ... 30+ more relations
}

model UserStats {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id])

  sportIndex            Float     @default(0)
  globalRank            Int?
  countryRank           Int?
  cityRank              Int?

  totalDistanceMeters   Float     @default(0)
  totalDurationSeconds  Int       @default(0)
  totalActivities       Int       @default(0)
  totalCalories         Int       @default(0)

  country               String?
  city                  String?
}
```

#### Sports & Activities
```prisma
model Sport {
  id                    String    @id @default(cuid())
  slug                  String    @unique
  name                  String
  category              String
  icon                  String?
  color                 String?

  hasGps                Boolean   @default(false)
  metValue              Float?
  isDeprecated          Boolean   @default(false)

  disciplines           Discipline[]
  activities            Activity[]
  teams                 Team[]
  benchmarks            BenchmarkDefinition[]
}

model Activity {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  sportId               String
  sport                 Sport     @relation(fields: [sportId], references: [id])
  disciplineId          String?
  discipline            Discipline? @relation(fields: [disciplineId], references: [id])

  title                 String
  description           String?
  activityDate          DateTime

  // Metrics
  distanceMeters        Float?
  durationSeconds       Int?
  elevationGain         Float?
  avgHeartRate          Int?
  maxHeartRate          Int?
  caloriesBurned        Int?
  avgPace               Float?

  // Source
  source                ActivitySource @default(MANUAL)
  externalId            String?

  // Visibility
  visibility            Visibility @default(PUBLIC)

  // Relations
  gear                  ActivityGear[]
  benchmarkResults      ActivityBenchmarkResult[]
  anomalies             ActivityAnomaly[]
}
```

#### Rankings & Leaderboards
```prisma
model Ranking {
  id                    String    @id @default(cuid())
  userId                String
  disciplineId          String?

  scope                 RankingScope
  scopeValue            String?
  period                RankingPeriod

  rank                  Int
  score                 Float
  previousRank          Int?

  updatedAt             DateTime  @updatedAt

  @@unique([userId, disciplineId, scope, scopeValue, period])
}

model DisciplineLeaderboardCache {
  id                    String    @id @default(cuid())
  disciplineId          String
  scope                 RankingScope
  scopeValue            String?

  entries               Json      // Cached leaderboard data
  totalEntries          Int
  updatedAt             DateTime  @updatedAt
}
```

#### Social Features
```prisma
model Follow {
  id                    String    @id @default(cuid())
  followerId            String
  follower              User      @relation("followers", fields: [followerId], references: [id])
  followingId           String
  following             User      @relation("following", fields: [followingId], references: [id])
  createdAt             DateTime  @default(now())

  @@unique([followerId, followingId])
}

model Post {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  activityId            String?
  activity              Activity? @relation(fields: [activityId], references: [id])

  content               String?
  visibility            Visibility @default(PUBLIC)

  likesCount            Int       @default(0)
  commentsCount         Int       @default(0)

  likes                 Like[]
  comments              Comment[]

  createdAt             DateTime  @default(now())
}
```

#### Teams & Communities
```prisma
model Team {
  id                    String    @id @default(cuid())
  slug                  String    @unique
  name                  String
  description           String?
  sportId               String
  sport                 Sport     @relation(fields: [sportId], references: [id])

  logoUrl               String?
  coverUrl              String?
  city                  String?
  country               String?

  teamType              TeamType  @default(CLUB)
  isPublic              Boolean   @default(true)

  members               TeamMember[]
  posts                 TeamPost[]
  challenges            Challenge[]
  joinRequests          TeamJoinRequest[]
}

model TeamMember {
  id                    String    @id @default(cuid())
  teamId                String
  team                  Team      @relation(fields: [teamId], references: [id])
  userId                String
  user                  User      @relation(fields: [userId], references: [id])

  role                  TeamRole  @default(MEMBER)
  joinedAt              DateTime  @default(now())

  @@unique([teamId, userId])
}
```

#### Challenges & Gamification
```prisma
model Challenge {
  id                    String    @id @default(cuid())
  title                 String
  description           String?
  sportId               String?
  sport                 Sport?    @relation(fields: [sportId], references: [id])
  teamId                String?
  team                  Team?     @relation(fields: [teamId], references: [id])

  targetType            ChallengeTarget
  targetValue           Float

  startDate             DateTime
  endDate               DateTime

  badgeId               String?
  badge                 Badge?    @relation(fields: [badgeId], references: [id])

  isActive              Boolean   @default(true)

  participants          ChallengeParticipant[]
}

model Badge {
  id                    String    @id @default(cuid())
  slug                  String    @unique
  name                  String
  description           String?
  imageUrl              String?

  category              BadgeCategory
  rarity                BadgeRarity @default(COMMON)
  displayOrder          Int       @default(0)
  isActive              Boolean   @default(true)

  users                 UserBadge[]
  challenges            Challenge[]
}

model UserStreak {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])

  streakType            StreakType
  currentStreak         Int       @default(0)
  longestStreak         Int       @default(0)
  lastActivityDate      DateTime?

  @@unique([userId, streakType])
}
```

#### Rivalries & Competitions
```prisma
model Rivalry {
  id                    String    @id @default(cuid())
  sportId               String
  sport                 Sport     @relation(fields: [sportId], references: [id])

  mode                  RivalryMode @default(VOLUME)
  status                RivalryStatus @default(PENDING)

  startDate             DateTime?
  endDate               DateTime?
  durationDays          Int       @default(7)

  participants          RivalryParticipant[]
  results               RivalryResult[]
}

model UserSportRating {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  sportId               String
  sport                 Sport     @relation(fields: [sportId], references: [id])

  rating                Float     @default(1000)
  matchesPlayed         Int       @default(0)
  wins                  Int       @default(0)
  losses                Int       @default(0)

  @@unique([userId, sportId])
}
```

#### Benchmarks & Personal Records
```prisma
model BenchmarkDefinition {
  id                    String    @id @default(cuid())
  slug                  String    @unique
  name                  String
  description           String?

  sportId               String?
  sport                 Sport?    @relation(fields: [sportId], references: [id])

  unit                  String
  measurementType       MeasurementType
  higherIsBetter        Boolean   @default(true)

  results               UserBenchmarkBest[]
}

model UserBenchmarkBest {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])
  benchmarkId           String
  benchmark             BenchmarkDefinition @relation(fields: [benchmarkId], references: [id])

  value                 Float
  achievedAt            DateTime
  source                ActivitySource @default(MANUAL)

  verificationStatus    VerificationStatus @default(UNVERIFIED)
  isEligibleGlobal      Boolean   @default(false)
  isEligibleCountry     Boolean   @default(false)
  isEligibleCity        Boolean   @default(true)
  isEligibleTeam        Boolean   @default(true)

  metadata              Json?

  @@unique([userId, benchmarkId])
}
```

#### Integrations
```prisma
model StravaConnection {
  id                    String    @id @default(cuid())
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id])

  athleteId             String    @unique
  accessToken           String
  refreshToken          String
  expiresAt             DateTime

  scope                 String?
  isActive              Boolean   @default(true)
  lastSyncAt            DateTime?

  webhookEvents         StravaWebhookEvent[]
}

model IntegrationJob {
  id                    String    @id @default(cuid())
  userId                String

  jobType               IntegrationJobType
  status                JobStatus @default(PENDING)

  payload               Json?
  result                Json?
  error                 String?

  attempts              Int       @default(0)
  maxAttempts           Int       @default(5)
  runAt                 DateTime  @default(now())

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### Key Enumerations
```prisma
enum ActivitySource {
  MANUAL
  IMPORT_STRAVA
  IMPORT_GARMIN
  IMPORT_APPLE_HEALTH
}

enum Visibility {
  PUBLIC
  FOLLOWERS_ONLY
  PRIVATE
}

enum RankingScope {
  GLOBAL
  COUNTRY
  CITY
  TEAM
  FRIENDS
}

enum ChallengeTarget {
  DISTANCE
  DURATION
  ACTIVITIES
  CALORIES
  ELEVATION
  STREAK
}

enum VerificationStatus {
  UNVERIFIED
  VERIFIED
  DISPUTED
  REJECTED
}

enum BadgeRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}
```

---

## 5. Feature Catalog

### 5.1 Authentication & Account Management

**Location:** `/app/login`, `/app/register`, `/app/settings`

| Feature | Description | Files |
|---------|-------------|-------|
| Email Registration | Create account with email/password | `app/register/page.tsx` |
| OAuth Login | Google, Facebook, Apple sign-in | `lib/auth.ts` |
| Password Management | Change password, reset flow | `api/user/password/route.ts` |
| Profile Editing | Update name, bio, avatar, location | `components/settings/profile-settings.tsx` |
| Account Deletion | Permanently delete account | `api/user/delete/route.ts` |

### 5.2 Onboarding Flow

**Location:** `/app/(onboarding)/onboarding`, `/lib/onboarding`

| Step | Description | Files |
|------|-------------|-------|
| Step 1: Profile | Name, bio, location setup | `components/onboarding/Step1Profile.tsx` |
| Step 2: Sports | Select primary and additional sports | `components/onboarding/Step2Sports.tsx` |
| Step 3: Benchmark | Set initial personal record | `components/onboarding/Step3Benchmark.tsx` |
| Step 4: Connect | Optional Strava connection | `components/onboarding/Step4Connect.tsx` |

**Key Features:**
- Data persistence across steps (localStorage)
- Pre-fill from existing user data on restart
- Session refresh redirect to prevent loops
- Restart wizard from settings

### 5.3 Sports & Activity Tracking

**Location:** `/app/sports`, `/app/activity`, `/lib/mySports.ts`

| Feature | Description | Files |
|---------|-------------|-------|
| Sport Selection | Browse and select sports | `app/sports/page.tsx` |
| Primary Sport | Set featured sport for rankings | `api/user/sports/primary/route.ts` |
| Activity Logging | Manual activity creation | `app/activity/create/page.tsx` |
| Activity Details | View individual activity | `app/activity/[id]/page.tsx` |
| Metrics Tracking | Distance, duration, elevation, HR | `actions/activity.ts` |

**Activity Creation Fields:**
- Title, description
- Sport and discipline
- Date and time
- Distance (meters)
- Duration (seconds)
- Elevation gain
- Calories burned
- Average/max heart rate
- RPE (1-10 scale)
- Visibility setting
- Benchmark achievements

### 5.4 Benchmarks & Personal Records

**Location:** `/lib/benchmarks`, `/actions/benchmarks.ts`

| Feature | Description | Files |
|---------|-------------|-------|
| Benchmark Definitions | 40+ sport-specific benchmarks | `lib/benchmarks/sportsCatalog.ts` |
| Personal Bests | Track best performances | `UserBenchmarkBest` model |
| PB Detection | Auto-detect new records | `lib/benchmarks/pbCompare.ts` |
| Achievement Recording | Log milestones in activities | `ActivityBenchmarkResult` model |

**Benchmark Types:**
- Time-based (5K, marathon, FTP test)
- Distance-based (long jump, shot put)
- Power-based (FTP watts, max power)
- Repetition-based (1RM, max reps)
- Score-based (golf handicap, VO2max)

### 5.5 Rankings & Leaderboards

**Location:** `/app/rankings`, `/app/leaderboard`, `/lib/rankings`

| Feature | Description | Files |
|---------|-------------|-------|
| Sport Index | 0-1000 composite score | `lib/sport-index/` |
| Global Rankings | Worldwide leaderboards | `api/rankings/leaderboard/route.ts` |
| Country Rankings | National leaderboards | Scope-filtered queries |
| City Rankings | Local leaderboards | Scope-filtered queries |
| Team Rankings | Team-based competition | Team score aggregation |
| Most Active | Activity frequency rankings | `api/rankings/most-active/route.ts` |

**Sport Index v4.2 Algorithm:**
- Weighted benchmark scores
- Sport-specific calculations
- MET-based calorie weighting
- Verification tier bonuses
- 28-day rolling window

### 5.6 Challenges & Gamification

**Location:** `/app/challenges`, `/components/gamification`

| Feature | Description | Files |
|---------|-------------|-------|
| Challenge Browser | View active/upcoming/completed | `app/challenges/page.tsx` |
| Join Challenges | Participate in competitions | `api/challenges/[id]/join/route.ts` |
| Progress Tracking | Monitor challenge progress | `ChallengeParticipant` model |
| Badge System | Earn achievement badges | `Badge`, `UserBadge` models |
| Streak Tracking | Daily/weekly activity streaks | `UserStreak` model |

**Challenge Target Types:**
- Distance goals
- Duration goals
- Activity count
- Calorie targets
- Elevation challenges
- Streak challenges

### 5.7 Teams & Group Features

**Location:** `/app/teams`, `/api/teams`

| Feature | Description | Files |
|---------|-------------|-------|
| Team Browser | Discover and search teams | `app/teams/page.tsx` |
| Team Creation | Create new teams | `actions/team.ts` |
| Team Profiles | View team details | `app/teams/[slug]/page.tsx` |
| Team Posts | Team discussion feed | `api/teams/[slug]/posts/route.ts` |
| Team Challenges | Team-specific competitions | `app/teams/[slug]/challenges/` |
| Member Management | Roles and permissions | `TeamMember` model |

**Team Roles:**
- Owner (creator)
- Admin
- Moderator
- Member

### 5.8 Social Features

**Location:** `/app/feed`, `/app/profile`, `/lib/feed`

| Feature | Description | Files |
|---------|-------------|-------|
| Following System | Follow/unfollow users | `Follow` model |
| Activity Feed | Stream from followed users | `app/feed/page.tsx` |
| Highlights Feed | Top community activities | `api/feed/highlights/route.ts` |
| Post Creation | Share updates and activities | `components/feed/create-post-box.tsx` |
| Likes & Comments | Engage with posts | `Like`, `Comment` models |
| User Profiles | Public athlete profiles | `app/profile/[username]/page.tsx` |
| User Discovery | Suggested users to follow | `api/social/suggestions/route.ts` |

### 5.9 Rivalries & Competitions

**Location:** `/app/rivalries`, `/lib/rivalry`

| Feature | Description | Files |
|---------|-------------|-------|
| Create Rivalries | Challenge other users | `actions/rivalry.ts` |
| Active Rivalries | Track ongoing competitions | `api/rivalries/active/route.ts` |
| Rivalry Scoring | Head-to-head comparison | `RivalryParticipant` model |
| Sport Ratings | Elo-like rating system | `UserSportRating` model |
| Suggested Rivals | Find competitive matches | `api/rivalries/suggested/route.ts` |

**Rivalry Modes:**
- Volume (total activity metrics)
- Benchmark (specific benchmark comparison)

### 5.10 Notifications

**Location:** `/app/notifications`, `/lib/notifications`

| Feature | Description | Files |
|---------|-------------|-------|
| Notification Center | View all notifications | `app/notifications/page.tsx` |
| Mark as Read | Individual/bulk read status | `api/notifications/[id]/read/route.ts` |
| Notification Settings | Per-type preferences | `api/notifications/settings/route.ts` |
| Push Notifications | Browser/mobile push | `PushToken` model |

**Notification Types:**
- LIKE, COMMENT, FOLLOW
- RANK_UP, RANK_DOWN
- FRIEND_OVERTAKE
- STREAK_REMINDER, STREAK_MILESTONE
- CHALLENGE_COMPLETED
- BADGE_EARNED
- TEAM_INVITE
- WEEKLY_SUMMARY

### 5.11 Training Plans

**Location:** `/app/training-plans`, `/app/training`

| Feature | Description | Files |
|---------|-------------|-------|
| Plan Discovery | Browse available plans | `app/training-plans/page.tsx` |
| Plan Details | View full plan structure | `api/training-plans/[id]/route.ts` |
| Follow Plans | Subscribe to a plan | `api/training-plans/[id]/follow/route.ts` |
| Progress Tracking | Log completed workouts | `UserTrainingPlan` model |

**Plan Structure:**
- Multi-week programs
- Weekly workout schedules
- Individual workout definitions
- Progress indicators

### 5.12 Communities

**Location:** `/app/communities`

| Feature | Description | Files |
|---------|-------------|-------|
| Community Browser | Discover communities | `app/communities/page.tsx` |
| Community Profiles | View community details | `app/communities/[slug]/page.tsx` |
| Join Communities | Become a member | `api/communities/[slug]/join/route.ts` |
| Community Posts | Discussion forums | `api/communities/[slug]/posts/route.ts` |

### 5.13 Home Dashboard

**Location:** `/app/home`, `/components/home`

**Dashboard Components:**
| Component | Purpose |
|-----------|---------|
| SlimHero | Welcome header with avatar |
| AthleteRibbon | Sport Index + rank cards |
| PulseRail | Stories-style friend activity |
| CompeteNowDeck | Active rivalries/challenges |
| HomeFeedTabs | Highlights vs Following toggle |
| CalendarWidget | Upcoming events |
| PartnerFinderWidget | Find workout partners |
| PeopleToFollow | User recommendations |

### 5.14 Calendar

**Location:** `/app/calendar`, `/lib/calendar`

| Feature | Description | Files |
|---------|-------------|-------|
| Calendar View | Monthly activity display | `app/calendar/page.tsx` |
| Activity Visualization | Color-coded by sport | Calendar items |
| Event Management | Training plan workouts | `getCalendarItems()` |

### 5.15 Partner Finding

**Location:** `/api/partner-requests`

| Feature | Description | Files |
|---------|-------------|-------|
| Create Requests | Post workout partner needs | `api/partner-requests/route.ts` |
| Browse Requests | Find available partners | GET endpoint |
| Join Requests | Express interest | `api/partner-requests/[id]/join/route.ts` |

---

## 6. API Reference

### 6.1 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 201 Created
{
  "user": {
    "id": "cuid",
    "email": "user@example.com"
  }
}
```

#### NextAuth Routes
```http
GET/POST /api/auth/[...nextauth]
```
Handles OAuth flows for Google, Facebook, Apple, and credential authentication.

### 6.2 User Profile Endpoints

#### Get Profile
```http
GET /api/user/profile
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "id": "string",
  "email": "string",
  "username": "string",
  "displayName": "string",
  "bio": "string",
  "avatarUrl": "string",
  "city": "string",
  "country": "string",
  "gender": "string",
  ...
}
```

#### Update Profile
```http
PATCH /api/user/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "Updated bio",
  "city": "Prague"
}

Response: 200 OK
{ updated profile object }
```

### 6.3 Activity Endpoints

#### Create Activity (Server Action)
```typescript
// app/actions/activity.ts
async function createActivityAction(data: {
  sportId: string;
  disciplineId?: string;
  title: string;
  description?: string;
  activityDate: Date;
  durationSeconds?: number;
  distanceMeters?: number;
  elevationGain?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  visibility?: "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE";
  achievements?: Array<{
    benchmarkId: string;
    value: number;
    note?: string;
  }>;
  rpe?: number;
})

Response: { ok: true, data: { id: string, username: string } }
```

### 6.4 Feed Endpoints

#### Get Feed
```http
GET /api/feed?type=all&page=1&limit=10
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "posts": [...],
  "hasMore": true,
  "nextPage": 2
}
```

#### Like Post
```http
POST /api/posts/{postId}/like
Authorization: Bearer <jwt_token>

Response: 200 OK
{ "success": true }
```

### 6.5 Rankings Endpoints

#### Get Leaderboard
```http
GET /api/rankings/leaderboard?sport=running&scope=global&page=1&limit=50

Response: 200 OK
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "string",
      "username": "string",
      "displayName": "string",
      "avatarUrl": "string",
      "score": 950,
      "location": "Prague"
    },
    ...
  ],
  "meta": {
    "total": 1000,
    "page": 1,
    "limit": 50,
    "scope": "global"
  }
}
```

### 6.6 Challenges Endpoints

#### Get Challenges
```http
GET /api/challenges?status=active&sport=running

Response: 200 OK
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "targetType": "DISTANCE",
    "targetValue": 100000,
    "startDate": "2026-01-01",
    "endDate": "2026-01-31",
    "participantCount": 150,
    "isParticipating": false
  }
]
```

#### Join Challenge
```http
POST /api/challenges/{id}/join
Authorization: Bearer <jwt_token>

Response: 200 OK
{ "success": true }
```

### 6.7 Teams Endpoints

#### Create Team (Server Action)
```typescript
// app/actions/team.ts
async function createTeam(data: {
  name: string;        // 3-60 characters
  sportId: string;
  description?: string; // max 500 chars
  city?: string;
  country?: string;
  isPublic?: boolean;
})

Response: { ok: true, teamSlug: string }
```

#### Get Teams
```http
GET /api/teams?sport=running&city=Prague&search=marathon

Response: 200 OK
[
  {
    "id": "string",
    "slug": "team-slug",
    "name": "Team Name",
    "sport": { "id": "string", "name": "Running" },
    "memberCount": 25,
    "logoUrl": "string"
  }
]
```

### 6.8 Strava Integration Endpoints

#### Connect Strava
```http
GET /api/strava/connect
Authorization: Bearer <jwt_token>

Response: 302 Redirect to Strava OAuth
```

#### Strava Callback
```http
GET /api/strava/callback?code={auth_code}&state={encoded_state}

Response: 302 Redirect to /settings/integrations
```

#### Manual Sync
```http
POST /api/strava/sync
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "success": true,
  "result": {
    "imported": 5,
    "updated": 2,
    "errors": []
  }
}
```

#### Webhook (Strava → Evergo)
```http
POST /api/strava/webhook
Content-Type: application/json

{
  "object_type": "activity",
  "aspect_type": "create",
  "object_id": 123456789,
  "owner_id": 987654321,
  "event_time": 1704067200
}

Response: 200 OK
{ "status": "received" }
```

### 6.9 Notifications Endpoints

#### Get Notifications
```http
GET /api/notifications?unreadOnly=true&page=1&limit=20
Authorization: Bearer <jwt_token>

Response: 200 OK
{
  "notifications": [...],
  "unreadCount": 5,
  "hasMore": true
}
```

#### Mark All Read
```http
POST /api/notifications/read-all
Authorization: Bearer <jwt_token>

Response: 200 OK
{ "success": true }
```

### 6.10 Search Endpoint

```http
GET /api/search?q=marathon&type=all&limit=10

Response: 200 OK
[
  {
    "type": "user",
    "id": "string",
    "title": "John Runner",
    "subtitle": "@johnrunner",
    "image": "avatar_url"
  },
  {
    "type": "team",
    "id": "string",
    "title": "Marathon Club",
    "subtitle": "25 members",
    "image": "logo_url"
  }
]
```

### 6.11 Health Check

```http
GET /api/health

Response: 200 OK
{
  "status": "ok",
  "database": "connected",
  "userCount": 1500,
  "dbResponseTime": "12ms",
  "timestamp": "2026-01-05T10:30:00.000Z"
}
```

---

## 7. Authentication & Security

### 7.1 Authentication Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Client      │     │   NextAuth.js   │     │    Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │  1. Login Request     │                       │
         │──────────────────────>│                       │
         │                       │  2. Verify Credentials│
         │                       │──────────────────────>│
         │                       │                       │
         │                       │  3. User Data         │
         │                       │<──────────────────────│
         │                       │                       │
         │  4. JWT Token         │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │  5. Store in Cookie   │                       │
         │                       │                       │
```

### 7.2 Session Configuration

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials
        // Return user or null
      }
    }),
    GoogleProvider({ clientId, clientSecret }),
    FacebookProvider({ clientId, clientSecret }),
    AppleProvider({ clientId, clientSecret })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Include custom claims
      if (user) {
        token.id = user.id;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      // Handle session updates
      if (trigger === "update") {
        // Refresh from database
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.onboardingCompleted = token.onboardingCompleted;
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
```

### 7.3 Rate Limiting

```typescript
// lib/rate-limit.ts
export const rateLimits = {
  api: { requests: 100, window: 60 * 1000 },      // 100/minute
  auth: { requests: 10, window: 15 * 60 * 1000 }, // 10/15 minutes
  search: { requests: 30, window: 60 * 1000 },    // 30/minute
  upload: { requests: 20, window: 60 * 60 * 1000 }, // 20/hour
  activity: { requests: 60, window: 60 * 60 * 1000 }, // 60/hour
  content: { requests: 30, window: 60 * 1000 }    // 30/minute
};
```

### 7.4 Protected Routes

Routes requiring authentication are defined in `middleware.ts`:

```typescript
const protectedRoutes = [
  "/home",
  "/feed",
  "/profile",
  "/settings",
  "/activity/create",
  "/challenges",
  "/teams",
  "/rivalries",
  "/notifications"
];

const onboardingRequiredRoutes = [
  "/home",
  "/feed",
  "/profile"
];
```

### 7.5 Server Action Security

```typescript
// lib/actions/authenticatedAction.ts
export function authenticatedAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, session: Session) => Promise<TOutput>,
  options?: { rateLimit?: string }
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input) => {
    // 1. Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { ok: false, code: "UNAUTHORIZED", message: "Not authenticated" };
    }

    // 2. Validate input
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    // 3. Rate limit check (optional)
    if (options?.rateLimit) {
      const limited = await checkRateLimit(session.user.id, options.rateLimit);
      if (limited) {
        return { ok: false, code: "RATE_LIMIT", message: "Too many requests" };
      }
    }

    // 4. Execute handler
    try {
      const result = await handler(parsed.data, session);
      return { ok: true, data: result };
    } catch (error) {
      return classifyPrismaError(error);
    }
  };
}
```

---

## 8. UI Components

### 8.1 Component Library Structure

```
components/
├── ui/                    # Shadcn/Radix primitives
│   ├── accordion.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── sheet.tsx
│   ├── slider.tsx
│   ├── tabs.tsx
│   └── toast.tsx
│
├── layout/               # App layout
│   ├── main-nav.tsx
│   ├── mobile-nav.tsx
│   ├── mobile-header.tsx
│   └── sidebar.tsx
│
├── home/                 # Dashboard
│   ├── SlimHero.tsx
│   ├── AthleteRibbon.tsx
│   ├── PulseRail.tsx
│   ├── CompeteNowDeck.tsx
│   └── HomeFeedTabs.tsx
│
├── profile/              # User profiles
│   ├── ProfileHeaderHero.tsx
│   ├── ProfileStatsPills.tsx
│   ├── ActivityFeedV2.tsx
│   └── ProfileSideRail.tsx
│
├── feed/                 # Social feed
│   ├── ActivityCard.tsx
│   ├── CreatePostBox.tsx
│   ├── CommentSection.tsx
│   └── LikeButton.tsx
│
├── onboarding/           # Setup wizard
│   ├── OnboardingWizard.tsx
│   ├── Step1Profile.tsx
│   ├── Step2Sports.tsx
│   ├── Step3Benchmark.tsx
│   └── Step4Connect.tsx
│
└── ...                   # 30+ more categories
```

### 8.2 Design System

**Colors (Tailwind):**
```css
/* Primary */
orange-500: #f97316  /* Primary action */
orange-600: #ea580c  /* Primary hover */

/* Secondary */
slate-900: #0f172a   /* Dark backgrounds */
slate-50: #f8fafc    /* Light backgrounds */

/* Semantic */
emerald-500: #10b981 /* Success */
red-500: #ef4444     /* Error */
amber-500: #f59e0b   /* Warning */
blue-500: #3b82f6    /* Info */
```

**Typography:**
- Font: System font stack (Apple, Segoe, Roboto)
- Headings: Bold, tracking-tight
- Body: Regular, text-slate-600/700

**Spacing:**
- Base unit: 4px (0.25rem)
- Common values: 1, 2, 3, 4, 6, 8, 12, 16

**Animations:**
```typescript
// Framer Motion variants
const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};
```

### 8.3 Key Component Examples

#### ProfileHeaderHero
```tsx
// components/profile/ProfileHeaderHero.tsx
interface ProfileHeaderHeroProps {
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    avatarUrl: string | null;
    city: string | null;
    bio: string | null;
    createdAt: Date;
  };
  stats: {
    followers: number;
    following: number;
    activities: number;
  };
  hero: ResolvedHero;
  sports: UserSport[];
  isCurrentUser: boolean;
  isFollowing: boolean;
}

export function ProfileHeaderHero({
  user,
  stats,
  hero,
  sports,
  isCurrentUser,
  isFollowing
}: ProfileHeaderHeroProps) {
  // Sport-specific background image
  // Avatar with initials fallback
  // Stats bar (activities, followers, following)
  // Sports badges with primary highlighted
  // Follow/Edit Profile actions
}
```

#### CreatePostBox
```tsx
// components/feed/create-post-box.tsx
interface CreatePostBoxProps {
  onPostCreated?: () => void;
}

export function CreatePostBox({ onPostCreated }: CreatePostBoxProps) {
  // Rich text input
  // Photo attachment
  // Visibility selector
  // Submit with optimistic update
}
```

---

## 9. External Integrations

### 9.1 Strava Integration

**OAuth Flow:**
1. User clicks "Connect Strava"
2. Redirect to Strava authorization
3. User approves scopes: `read`, `activity:read_all`, `profile:read_all`
4. Callback with authorization code
5. Exchange code for tokens
6. Store encrypted tokens
7. Queue initial backfill job

**Sync Mechanisms:**

| Method | Trigger | Description |
|--------|---------|-------------|
| Backfill | Initial connect | Import last 30 days |
| Webhook | Real-time | Push on new activities |
| Manual | User action | Force sync |
| Scheduled | Cron job | Every 10-30 min |

**Activity Mapping:**
```typescript
// Strava Activity → Evergo Activity
const mapping = {
  id: activity.id,
  title: activity.name,
  activityDate: new Date(activity.start_date),
  distanceMeters: activity.distance,
  durationSeconds: activity.moving_time,
  elevationGain: activity.total_elevation_gain,
  avgHeartRate: activity.average_heartrate,
  source: "IMPORT_STRAVA",
  externalId: String(activity.id)
};
```

### 9.2 Future Integrations (Planned)

| Integration | Status | Description |
|-------------|--------|-------------|
| Garmin Connect | Coming Soon | Activity sync |
| Apple Health | Coming Soon | Health metrics |
| Wahoo | Planned | Cycling data |
| Polar Flow | Planned | Training data |

---

## 10. Deployment & Infrastructure

### 10.1 Hosting Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Edge Network  │  │   Serverless    │  │   Static Files  │ │
│  │   (CDN)         │  │   Functions     │  │   (Assets)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL    │  │   Realtime      │  │   Storage       │ │
│  │   Database      │  │   (Optional)    │  │   (Optional)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://evergo.app"
NEXTAUTH_SECRET="..."

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_CLIENT_SECRET="..."

# Strava
STRAVA_CLIENT_ID="..."
STRAVA_CLIENT_SECRET="..."
STRAVA_WEBHOOK_VERIFY_TOKEN="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Push Notifications
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# Jobs
CRON_SECRET="..."
EVERGO_JOB_SECRET="..."
```

### 10.3 Build Process

```bash
# package.json scripts
{
  "dev": "next dev",
  "build": "prisma generate && next build",
  "build:full": "prisma generate && prisma db push && npm run db:seed && next build",
  "db:push": "prisma db push",
  "db:seed": "tsx prisma/seed/index.ts",
  "db:studio": "prisma studio",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --ext .ts,.tsx"
}
```

### 10.4 Production URLs

| Environment | URL |
|-------------|-----|
| Production | https://evergo-pi.vercel.app |
| Preview | https://evergo-{branch}-michalp-projects.vercel.app |

---

## 11. Testing Framework

### 11.1 E2E Testing (Playwright)

**Test Structure:**
```
e2e/
├── agents/
│   ├── atlas/     # Navigation testing
│   ├── hermes/    # Form submission
│   ├── nyx/       # Dark mode / visual
│   ├── iris/      # Accessibility
│   └── kronos/    # Performance
├── fixtures/
├── pages/
└── utils/
```

**Test Commands:**
```bash
# Run all tests
npm run test:e2e

# Specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Mobile viewports
npm run test:mobile

# Accessibility
npm run test:a11y
```

### 11.2 Mike Test Framework

Custom scenario-based testing framework:

```bash
# Full test suite
npm run mike:full

# Smoke tests
npm run mike:smoke

# Specific category
npm run mike:discover
npx tsx mike/cli.ts --category navigation
npx tsx mike/cli.ts --category form_submission
npx tsx mike/cli.ts --category accessibility
```

### 11.3 Test Categories

| Category | Coverage |
|----------|----------|
| Authentication | Login, register, logout |
| Navigation | Route transitions, deep links |
| Forms | Activity creation, profile edit |
| Data Validation | Input constraints |
| Accessibility | WCAG compliance |
| Error Handling | Error states, fallbacks |

---

## 12. Design Patterns

### 12.1 Server Actions Pattern

```typescript
// Standard server action structure
"use server";

import { authenticatedAction } from "@/lib/actions/authenticatedAction";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(100),
  sportId: z.string().cuid()
});

export const createItem = authenticatedAction(
  schema,
  async (input, session) => {
    const item = await prisma.item.create({
      data: {
        ...input,
        userId: session.user.id
      }
    });

    revalidatePath("/items");
    return { id: item.id };
  },
  { rateLimit: "activity" }
);
```

### 12.2 API Route Pattern

```typescript
// Standard API route structure
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.item.findMany({
      where: { userId: session.user.id }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 12.3 Component Pattern

```typescript
// Standard component structure
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComponentProps {
  data: DataType;
  className?: string;
  onAction?: () => void;
}

export function Component({
  data,
  className,
  onAction
}: ComponentProps) {
  const [state, setState] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("base-styles", className)}
    >
      {/* Component content */}
    </motion.div>
  );
}
```

### 12.4 Database Query Pattern

```typescript
// Standard Prisma query with relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    displayName: true,
    username: true,
    avatarUrl: true,
    _count: {
      select: {
        followers: true,
        following: true,
        activities: true
      }
    },
    sports: {
      where: { status: "ACTIVE" },
      orderBy: { priority: "asc" },
      include: { sport: true }
    },
    stats: true
  }
});
```

### 12.5 Error Handling Pattern

```typescript
// Result type for never-throw functions
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ActionResultCode; message: string };

type ActionResultCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT"
  | "CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL";

// Usage
const result = await createItem(data);
if (!result.ok) {
  toast.error(result.message);
  return;
}
// result.data is now typed
```

---

## Appendix A: Database Model Count

| Category | Models |
|----------|--------|
| User & Auth | 5 |
| Sports & Activities | 8 |
| Rankings | 6 |
| Social | 4 |
| Teams & Communities | 8 |
| Challenges & Gamification | 6 |
| Benchmarks | 4 |
| Rivalries & Competition | 8 |
| Notifications | 3 |
| Integrations | 4 |
| Training | 4 |
| Monetization | 4 |
| Other | 6 |
| **Total** | **~70** |

## Appendix B: API Endpoint Count

| Category | Endpoints |
|----------|-----------|
| Authentication | 4 |
| User Profile | 6 |
| Activities | 5 |
| Feed & Posts | 8 |
| Comments | 3 |
| Challenges | 4 |
| Teams | 10 |
| Communities | 6 |
| Rankings | 8 |
| Rivalries | 4 |
| Notifications | 5 |
| Integrations | 6 |
| Training Plans | 5 |
| Search | 1 |
| Cron Jobs | 4 |
| Health/Debug | 3 |
| **Total** | **~82** |

## Appendix C: Component Count

| Category | Components |
|----------|------------|
| UI Primitives | 25+ |
| Layout | 8 |
| Home/Dashboard | 12 |
| Profile | 10 |
| Feed | 8 |
| Onboarding | 6 |
| Settings | 6 |
| Sports | 5 |
| Challenges | 6 |
| Teams | 8 |
| Rankings | 6 |
| Other | 20+ |
| **Total** | **~120** |

---

*Document generated: January 2026*
*Evergo v5.0*
