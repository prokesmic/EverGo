# EverGo V3 - Complete Technical Documentation

> **The Global Network for Sports** - Track, Compete, Connect

**Version:** 3.0
**Last Updated:** December 2024
**Production URL:** https://evergo-nu.vercel.app

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Core Features](#8-core-features)
9. [Ranking Engine & Sport Index](#9-ranking-engine--sport-index)
10. [Gamification System](#10-gamification-system)
11. [Social Platform](#11-social-platform)
12. [Teams & Communities](#12-teams--communities)
13. [Benchmarks & Personal Bests](#13-benchmarks--personal-bests)
14. [Training Plans](#14-training-plans)
15. [Integrations](#15-integrations)
16. [PWA & Mobile Experience](#16-pwa--mobile-experience)
17. [Notifications System](#17-notifications-system)
18. [Monetization & Subscriptions](#18-monetization--subscriptions)
19. [Component Architecture](#19-component-architecture)
20. [Home Page Layout](#20-home-page-layout)
21. [Testing Infrastructure](#21-testing-infrastructure)
22. [Deployment & DevOps](#22-deployment--devops)
23. [Development Guide](#23-development-guide)

---

## 1. Executive Summary

EverGo is a comprehensive social fitness platform that combines:

- **Multi-Sport Activity Tracking** across 12+ sports with discipline-specific metrics
- **Global Ranking System** with Sport Index scoring (0-1000 points)
- **Competitive Features** including rivalries, challenges, and team battles
- **Social Networking** with feeds, following, teams, and communities
- **Gamification** with badges, streaks, and achievements
- **Training Plans** for structured fitness programs
- **Strava Integration** for automatic activity sync
- **PWA Support** for native app-like experience

### Platform Metrics

| Metric | Value |
|--------|-------|
| Database Models | 45+ |
| API Endpoints | 50+ |
| Supported Sports | 12 |
| Component Files | 150+ |
| Test Coverage | Playwright + Mike AI |

---

## 2. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │    React    │  │   Tailwind CSS + Radix  │  │
│  │  App Router │  │     19.2    │  │        UI System        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Next.js    │  │  NextAuth   │  │    Server Actions       │  │
│  │  API Routes │  │     JWT     │  │    (app/actions/)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Prisma    │  │ PostgreSQL  │  │       Supabase          │  │
│  │    ORM      │  │  (Railway)  │  │    (File Storage)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Strava    │  │   Stripe    │  │       Vercel            │  │
│  │    API      │  │  Payments   │  │      Hosting            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Next.js App Router** - Server components by default, client components where needed
2. **Server Actions** - Direct database mutations without API routes
3. **Prisma ORM** - Type-safe database access with migrations
4. **JWT Sessions** - Stateless authentication with NextAuth
5. **Zustand** - Lightweight client-side state management
6. **Radix UI** - Accessible, unstyled component primitives

---

## 3. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | React framework with App Router |
| React | 19.2.0 | UI library with concurrent features |
| TypeScript | 5.x | Type safety and developer experience |
| Tailwind CSS | 4.x | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Zustand | 5.0.9 | Client state management |
| React Hook Form | 7.67.0 | Form handling with validation |
| Zod | 4.1.13 | Schema validation |
| Lucide React | 0.555 | Icon library |
| Recharts | 3.5.1 | Data visualization |
| Leaflet | 1.9.4 | Interactive maps |
| Framer Motion | 11.18.2 | Animations |
| date-fns | 4.1.0 | Date manipulation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 6.0.0 | ORM and database toolkit |
| PostgreSQL | 16.x | Primary relational database |
| NextAuth | 4.24.13 | Authentication framework |
| bcryptjs | 3.0.3 | Password hashing |
| web-push | 3.6.7 | Push notification delivery |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Deployment, hosting, edge functions |
| Supabase | Managed PostgreSQL, file storage |
| Railway | Alternative PostgreSQL hosting |
| Stripe | Payment processing |
| Strava | Activity sync integration |

### Development & Testing

| Tool | Purpose |
|------|---------|
| Playwright | E2E testing framework |
| Mike | AI-powered test agent framework |
| ESLint | Code linting |
| tsx | TypeScript execution |

---

## 4. Project Structure

```
/Users/michal/Evergo/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Landing page group
│   ├── api/                          # API Routes (50+ endpoints)
│   │   ├── auth/                     # Authentication
│   │   │   ├── register/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   ├── challenges/               # Challenge management
│   │   ├── communities/              # Community features
│   │   ├── feed/                     # Activity feed
│   │   ├── gear/                     # Equipment tracking
│   │   ├── health/                   # Health check
│   │   ├── me/                       # Current user endpoints
│   │   ├── offers/                   # Product offers
│   │   ├── posts/                    # Social posts
│   │   ├── rankings/                 # Leaderboards
│   │   ├── search/                   # Global search
│   │   ├── seed/                     # Database seeding
│   │   ├── social/                   # Social features
│   │   ├── strava/                   # Strava integration
│   │   ├── subscription/             # Payments
│   │   ├── teams/                    # Team management
│   │   ├── test/                     # Test utilities
│   │   └── user/                     # User management
│   ├── actions/                      # Server Actions
│   │   ├── activity.ts
│   │   ├── benchmarks.ts
│   │   ├── sports.ts
│   │   └── team.ts
│   ├── activity/                     # Activity pages
│   │   ├── [id]/page.tsx
│   │   ├── create/page.tsx
│   │   └── track/page.tsx
│   ├── calendar/page.tsx             # Calendar view
│   ├── challenges/                   # Challenge pages
│   ├── communities/                  # Community pages
│   ├── home/page.tsx                 # Main dashboard
│   ├── leaderboard/page.tsx          # Leaderboard
│   ├── login/page.tsx                # Authentication
│   ├── notifications/                # Notification pages
│   ├── onboarding/                   # User onboarding
│   ├── profile/[username]/           # User profiles
│   ├── rankings/page.tsx             # Rankings page
│   ├── register/page.tsx             # Registration
│   ├── settings/                     # Settings pages
│   │   ├── account/
│   │   ├── integrations/
│   │   ├── personal-bests/
│   │   ├── profile/
│   │   ├── sports/
│   │   └── subscription/
│   ├── teams/                        # Team pages
│   ├── training/                     # Training plans
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
│
├── components/                       # React Components
│   ├── activity/                     # Activity components
│   ├── benchmarks/                   # Benchmark UI
│   ├── calendar/                     # Calendar widgets
│   ├── challenges/                   # Challenge cards
│   ├── communities/                  # Community UI
│   ├── dashboard/                    # Dashboard widgets
│   ├── feed/                         # Feed components
│   │   ├── create-post-box.tsx
│   │   ├── feed.tsx
│   │   ├── feed-post.tsx
│   │   └── activity-post.tsx
│   ├── gamification/                 # Badges, streaks
│   ├── gear/                         # Gear management
│   ├── home/                         # Home page specific
│   │   ├── ActiveRivalryCard.tsx
│   │   ├── CompeteNowDeck.tsx
│   │   └── CompeteNowDeckWrapper.tsx
│   ├── landing/                      # Landing page
│   │   ├── LandingHero.tsx
│   │   ├── LandingFeatures.tsx
│   │   ├── LandingHowItWorks.tsx
│   │   └── ...
│   ├── layout/                       # Layout components
│   ├── monetization/                 # Subscription UI
│   ├── notifications/                # Notification UI
│   ├── onboarding/                   # Onboarding flow
│   ├── profile/                      # Profile components
│   ├── pwa/                          # PWA components
│   │   ├── install-prompt.tsx
│   │   └── service-worker-registration.tsx
│   ├── rankings/                     # Ranking components
│   ├── settings/                     # Settings components
│   ├── social/                       # Social features
│   │   └── partner-finder-widget.tsx
│   ├── sports/                       # Sport selection
│   ├── teams/                        # Team components
│   ├── training/                     # Training UI
│   ├── ui/                           # UI primitives (40+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── vapor/                        # Vapor design system
│   ├── widgets/                      # Dashboard widgets
│   │   ├── calendar-widget.tsx
│   │   ├── follow-suggestions-wrapper.tsx
│   │   ├── RankingSpotlight.tsx
│   │   └── ...
│   ├── main-nav.tsx                  # Desktop navigation
│   ├── mobile-nav.tsx                # Mobile navigation
│   ├── mobile-header.tsx             # Mobile header
│   ├── providers.tsx                 # Context providers
│   └── search-command.tsx            # Command palette
│
├── lib/                              # Utilities & Logic
│   ├── benchmarks/                   # Benchmark utilities
│   │   ├── benchmark-scoring.ts
│   │   ├── benchmark-service.ts
│   │   └── validation.ts
│   ├── calendar/                     # Calendar utilities
│   ├── hero/                         # Hero image logic
│   ├── home/                         # Home page utilities
│   │   └── prioritizeCompeteItems.ts
│   ├── integrations/                 # External integrations
│   ├── activityDefaults.ts           # Activity defaults
│   ├── api-utils.ts                  # API helpers
│   ├── db.ts                         # Prisma client
│   ├── env.ts                        # Environment config
│   ├── gamification.ts               # Gamification engine
│   ├── logger.ts                     # Logging utility
│   ├── monetization.ts               # Subscription logic
│   ├── mySports.ts                   # User sports logic
│   ├── notifications.ts              # Notification engine
│   ├── rankings.ts                   # Ranking calculations
│   ├── rate-limit.ts                 # Rate limiting
│   ├── routes.ts                     # Route definitions
│   ├── sports.ts                     # Sport utilities
│   ├── supabase.ts                   # Supabase client
│   ├── team-jobs.ts                  # Team background jobs
│   ├── test-ids.ts                   # Test ID registry
│   ├── uiTokens.ts                   # Design tokens
│   └── utils.ts                      # General utilities
│
├── hooks/                            # Custom React Hooks
│   ├── use-mobile.ts
│   ├── use-auth.ts
│   └── ...
│
├── prisma/                           # Database
│   ├── schema.prisma                 # Schema definition
│   ├── seed.ts                       # Seed script
│   └── migrations/                   # Migration history
│
├── public/                           # Static Assets
│   ├── icons/                        # App icons
│   ├── splash/                       # PWA splash screens
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── e2e/                              # E2E Tests
│   ├── agents/                       # AI test agents
│   ├── pages/                        # Page object models
│   ├── scenarios/                    # Test scenarios
│   ├── fixtures/                     # Test fixtures
│   └── *.spec.ts                     # Test files
│
├── mike/                             # Mike AI Testing
│   ├── cli.ts                        # CLI interface
│   ├── core/                         # Core engine
│   ├── discovery/                    # Page discovery
│   ├── executors/                    # Test executors
│   ├── generators/                   # Scenario generators
│   ├── reporters/                    # Result reporters
│   └── scenarios/                    # Test scenarios
│
├── scripts/                          # Utility Scripts
│   ├── seedBenchmarks.ts
│   ├── seedSportsAndBenchmarks.ts
│   ├── checkSportsBenchCoverage.ts
│   └── noMockScan.ts
│
├── types/                            # TypeScript Definitions
│   └── next-auth.d.ts
│
├── package.json                      # Dependencies
├── next.config.ts                    # Next.js config
├── playwright.config.ts              # Playwright config
├── tsconfig.json                     # TypeScript config
└── tailwind.config.ts                # Tailwind config
```

---

## 5. Database Schema

### Core Models Overview

EverGo uses PostgreSQL with Prisma ORM. The schema contains 45+ models organized into domains:

### User Domain

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String    @unique
  password        String?
  displayName     String
  avatarUrl       String?
  coverPhotoUrl   String?
  bio             String?
  city            String?
  country         String?
  dateOfBirth     DateTime?
  gender          String?
  privacyLevel    String    @default("PUBLIC")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relationships
  sports              UserSport[]
  activities          Activity[]
  personalRecords     PersonalRecord[]
  rankings            Ranking[]
  posts               Post[]
  comments            Comment[]
  likes               Like[]
  followers           Follow[]  @relation("following")
  following           Follow[]  @relation("follower")
  teamMemberships     TeamMember[]
  communityMemberships CommunityMember[]
  stats               UserStats?
  sportStats          UserSportStats[]
  streak              UserStreak?
  badges              UserBadge[]
  challengeParticipations ChallengeParticipant[]
  notifications       Notification[]
  subscription        Subscription?
  gear                UserGear[]
  benchmarkBests      UserBenchmarkBest[]
  stravaConnection    StravaConnection?
}

model UserStats {
  id              String    @id @default(cuid())
  userId          String    @unique
  totalDistance   Float     @default(0)    // km
  totalDuration   Int       @default(0)    // seconds
  totalActivities Int       @default(0)
  totalCalories   Int       @default(0)
  sportIndex      Int       @default(0)    // 0-1000
  sportIndexBest  Int       @default(0)
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?
  country         String?
  city            String?
}

model UserStreak {
  id              String    @id @default(cuid())
  userId          String    @unique
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastActivityDate DateTime?
  weeklyStreak    Int       @default(0)
  weeklyGoal      Int       @default(3)
  weeklyProgress  Int       @default(0)
}
```

### Activity Domain

```prisma
model Activity {
  id              String    @id @default(cuid())
  userId          String
  disciplineId    String
  sportId         String?
  title           String
  description     String?
  activityDate    DateTime

  // Metrics
  durationSeconds Int?
  distanceMeters  Float?
  elevationGain   Float?
  caloriesBurned  Int?
  avgHeartRate    Int?
  maxHeartRate    Int?
  avgPace         Float?      // seconds per km
  avgSpeed        Float?      // km/h
  primaryValue    Float
  score           Float?

  // GPS & Media
  gpsRoute        String?     // JSON
  startLocation   String?     // JSON
  mapImageUrl     String?
  photos          String      // JSON array

  // Source
  source          String      @default("MANUAL")
  externalId      String?
  raw             Json?
  isHidden        Boolean     @default(false)
  visibility      String      @default("PUBLIC")

  // Relations
  post            Post?
  gearItems       ActivityGear[]
  benchmarkResults ActivityBenchmarkResult[]

  @@unique([source, externalId])
  @@index([userId, activityDate(sort: Desc)])
}
```

### Sport & Discipline

```prisma
model Sport {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  icon            String
  category        String    // SportCategory enum
  hasGpsTracking  Boolean   @default(false)

  disciplines     Discipline[]
  userSports      UserSport[]
  teams           Team[]
  communities     Community[]
  challenges      Challenge[]
  benchmarkDefinitions BenchmarkDefinition[]
}

model Discipline {
  id              String    @id @default(cuid())
  sportId         String
  name            String
  slug            String
  measurementType String
  primaryMetric   String
  rankingFormula  String
  lowerIsBetter   Boolean   @default(true)

  @@unique([sportId, slug])
}

enum SportCategory {
  ENDURANCE
  CYCLING
  SWIMMING
  STRENGTH
  TEAM
  RACKET
  COMBAT
  WATER_BOARD
  OUTDOOR
  WINTER
  MINDBODY
  GENERIC
}
```

### Social Domain

```prisma
model Post {
  id            String    @id @default(cuid())
  userId        String
  postType      String    // ACTIVITY, STATUS, PHOTO, ACHIEVEMENT, MILESTONE
  content       String?
  activityId    String?   @unique
  photos        String    // JSON array
  mapImageUrl   String?
  visibility    String    @default("PUBLIC")
  likesCount    Int       @default(0)
  commentsCount Int       @default(0)
  sharesCount   Int       @default(0)

  likes         Like[]
  comments      Comment[]

  @@index([userId, createdAt(sort: Desc)])
}

model Follow {
  id          String    @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime  @default(now())

  @@unique([followerId, followingId])
}

model FriendRequest {
  id          String    @id @default(cuid())
  requesterId String
  addresseeId String
  status      String    @default("PENDING")

  @@unique([requesterId, addresseeId])
}
```

### Team & Community

```prisma
model Team {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?
  logoUrl         String?
  coverPhotoUrl   String?
  sportId         String
  city            String?
  country         String?
  teamType        String    @default("CLUB")
  isPublic        Boolean   @default(true)
  isVerified      Boolean   @default(false)
  memberCount     Int       @default(0)
  totalDistance   Float     @default(0)
  totalActivities Int       @default(0)
  avgSportIndex   Float     @default(0)
  globalRank      Int?

  members         TeamMember[]
  posts           TeamPost[]
  joinRequests    TeamJoinRequest[]
}

model TeamMember {
  id          String    @id @default(cuid())
  teamId      String
  userId      String
  role        String    @default("MEMBER")  // OWNER, MODERATOR, MEMBER
  jerseyNumber String?
  position    String?

  @@unique([teamId, userId])
}

model Community {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  description     String?
  coverPhotoUrl   String?
  sportId         String?
  topic           String?
  city            String?
  country         String?
  isPublic        Boolean   @default(true)
  memberCount     Int       @default(0)

  members         CommunityMember[]
  posts           CommunityPost[]
}
```

### Gamification Domain

```prisma
model Challenge {
  id              String          @id @default(cuid())
  title           String
  description     String
  imageUrl        String?
  startDate       DateTime
  endDate         DateTime
  targetType      ChallengeTarget
  targetValue     Float
  targetUnit      String
  sportId         String?
  scope           ChallengeScope  @default(GLOBAL)
  teamId          String?
  badgeId         String?
  sponsorName     String?
  sponsorLogoUrl  String?
  isActive        Boolean         @default(true)

  participants    ChallengeParticipant[]
}

enum ChallengeTarget {
  DISTANCE
  DURATION
  ACTIVITIES
  CALORIES
  ELEVATION
  STREAK
}

model Badge {
  id              String        @id @default(cuid())
  name            String
  description     String
  iconUrl         String
  color           String
  category        BadgeCategory
  criteriaType    BadgeCriteria
  criteriaValue   Float
  rarity          BadgeRarity   @default(COMMON)
}

enum BadgeRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}
```

### Benchmark Domain

```prisma
model BenchmarkDefinition {
  id              String   @id @default(cuid())
  sportId         String
  slug            String
  name            String
  measurementType BenchmarkMeasurementType
  unit            String
  higherIsBetter  Boolean  @default(true)
  targetJson      Json?
  validityMonths  Int      @default(24)
  decayAfterMonths Int     @default(12)
  rankWeight      Float    @default(1.0)
  isActive        Boolean  @default(true)

  userBests       UserBenchmarkBest[]
  activityResults ActivityBenchmarkResult[]

  @@unique([sportId, slug])
}

model UserBenchmarkBest {
  id                 String   @id @default(cuid())
  userId             String
  benchmarkId        String
  value              Float
  achievedAt         DateTime
  source             BenchmarkSource @default(MANUAL)
  verificationStatus BenchmarkVerificationStatus @default(UNVERIFIED)
  evidenceUrl        String?
  isLegacy           Boolean  @default(false)

  @@unique([userId, benchmarkId])
}
```

### Integration Domain

```prisma
model StravaConnection {
  id              String   @id @default(cuid())
  userId          String   @unique
  athleteId       BigInt   @unique
  scopes          String
  accessToken     String
  refreshTokenEnc String
  expiresAt       DateTime
  lastSyncAt      DateTime?
  lastBackfillAt  DateTime?
  isActive        Boolean  @default(true)
}

model StravaWebhookEvent {
  id             String   @id @default(cuid())
  subscriptionId Int
  ownerId        BigInt
  objectType     String   // "activity" | "athlete"
  objectId       BigInt
  aspectType     String   // "create" | "update" | "delete"
  status         String   @default("PENDING")

  @@index([status, receivedAt])
}
```

---

## 6. API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| * | `/api/auth/[...nextauth]` | NextAuth handlers |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/user/profile` | User profile |
| PUT | `/api/user/password` | Change password |
| DELETE | `/api/user/delete` | Delete account |
| GET/POST | `/api/user/sports` | User sports |
| PUT | `/api/user/sports/primary` | Set primary sport |

### Rankings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rankings/leaderboard` | Query leaderboard |
| GET | `/api/rankings/user/[userId]` | User rankings |
| GET | `/api/rankings/insights/[userId]` | Ranking insights |
| GET | `/api/rankings/rival` | Auto-assigned rival |

### Feed & Social

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Activity feed |
| GET/POST | `/api/posts` | CRUD posts |
| POST | `/api/posts/[postId]/like` | Like post |
| GET/POST | `/api/posts/[postId]/comments` | Post comments |
| DELETE | `/api/comments/[commentId]` | Delete comment |
| GET | `/api/social/suggestions` | Follow suggestions |
| GET | `/api/social/friends/activities` | Friends' activities |

### Challenges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/challenges` | List/create challenges |
| POST | `/api/challenges/[id]/join` | Join challenge |
| POST | `/api/challenges/[id]/leave` | Leave challenge |

### Teams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/teams` | List/create teams |
| GET/PUT | `/api/teams/[slug]` | Team details |
| POST | `/api/teams/[slug]/join` | Join team |
| GET/POST | `/api/teams/[slug]/posts` | Team posts |
| GET/POST | `/api/teams/[slug]/challenges` | Team challenges |
| GET | `/api/teams/active-battle` | Active team battles |

### Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/communities` | Community CRUD |
| GET/PUT | `/api/communities/[slug]` | Community details |
| POST | `/api/communities/[slug]/join` | Join community |
| GET/POST | `/api/communities/[slug]/posts` | Community posts |

### Strava Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/strava/connect` | Initiate OAuth |
| GET | `/api/strava/callback` | OAuth callback |
| POST | `/api/strava/sync` | Manual sync |
| POST | `/api/strava/disconnect` | Disconnect |
| POST | `/api/strava/webhook` | Webhook receiver |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscription` | Subscription status |
| POST | `/api/subscription/checkout` | Stripe checkout |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search` | Global search |
| GET/POST | `/api/gear` | Gear management |
| GET/PUT/DELETE | `/api/gear/[id]` | Gear item |
| GET | `/api/offers` | Product offers |
| GET | `/api/me/streak` | User streak |
| GET | `/api/users/[userId]/records` | Personal records |
| GET | `/api/users/[userId]/streak` | User streak |
| GET | `/api/health` | Health check |

---

## 7. Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits email + password                            │
│ 2. Server validates (email format, password 6+ chars)       │
│ 3. Check for existing account                               │
│ 4. Hash password with bcryptjs (10 rounds)                  │
│ 5. Create User + UserStats records                          │
│ 6. Return success                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                              │
├─────────────────────────────────────────────────────────────┤
│ 1. User submits credentials                                 │
│ 2. Credentials Provider validates                           │
│ 3. Compare password hash                                    │
│ 4. Create JWT token with user data                          │
│ 5. Session callback enriches token                          │
│ 6. Client receives session                                  │
└─────────────────────────────────────────────────────────────┘
```

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        return isValid ? user : null
      }
    }),
    // Google, Facebook, Apple providers...
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.username = token.username
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    }
  }
}
```

### Route Protection

```typescript
// Server Component
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return <Dashboard user={session.user} />
}

// API Route
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Handle request...
}
```

---

## 8. Core Features

### 8.1 Activity Tracking

**Supported Sports & Disciplines:**

| Sport | Disciplines | GPS | Metrics |
|-------|-------------|-----|---------|
| Running | 5K, 10K, Half Marathon, Marathon, Trail, Ultra | Yes | Distance, Pace, Elevation, HR |
| Cycling | Road, MTB, Gravel, Indoor, Track | Yes | Distance, Speed, Power, Elevation |
| Swimming | Pool, Open Water, Triathlon | No | Distance, Time, Strokes, SWOLF |
| Golf | 18 Holes, 9 Holes, Range | GPS | Score, Handicap, Putts |
| Tennis | Singles, Doubles | No | Duration, Sets, Games |
| Football | Match, Training | No | Duration, Position |
| Basketball | Game, Training | No | Duration, Points |
| Triathlon | Sprint, Olympic, Half IM, Ironman | Yes | Combined metrics |
| Fitness | Gym, HIIT, CrossFit, Yoga | No | Duration, Calories, Exercises |
| Hiking | Day Hike, Backpacking | Yes | Distance, Elevation, Time |
| Ski | Downhill, Cross-country | Yes | Distance, Runs, Vertical |
| Martial Arts | Boxing, MMA, BJJ | No | Duration, Rounds |

**Activity Creation Flow:**

```typescript
// app/actions/activity.ts
export async function createActivity(data: ActivityInput) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const activity = await prisma.activity.create({
    data: {
      userId: session.user.id,
      disciplineId: data.disciplineId,
      sportId: data.sportId,
      title: data.title,
      activityDate: data.date,
      durationSeconds: data.duration,
      distanceMeters: data.distance,
      elevationGain: data.elevation,
      caloriesBurned: data.calories,
      avgHeartRate: data.heartRate,
      avgPace: calculatePace(data),
      photos: JSON.stringify(data.photos || []),
      source: "MANUAL"
    }
  })

  // Update user stats
  await updateUserStats(session.user.id)

  // Check for badges
  await checkBadgeEligibility(session.user.id)

  // Update streak
  await updateStreak(session.user.id)

  // Create post (if public)
  if (data.visibility === "PUBLIC") {
    await createActivityPost(activity)
  }

  return activity
}
```

### 8.2 Calendar View

The calendar shows activities with heat map visualization:

```typescript
// components/calendar/calendar-widget.tsx
export function CalendarWidget() {
  const [activities] = useActivities()

  // Group by date
  const activityMap = activities.reduce((acc, activity) => {
    const date = format(activity.activityDate, 'yyyy-MM-dd')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  return (
    <Calendar
      mode="single"
      modifiers={{
        hasActivity: (date) => activityMap[format(date, 'yyyy-MM-dd')] > 0
      }}
      modifiersStyles={{
        hasActivity: { backgroundColor: 'var(--primary)' }
      }}
    />
  )
}
```

### 8.3 Search

Global search across users, teams, communities, and challenges:

```typescript
// app/api/search/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  const [users, teams, communities, challenges] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 5
    }),
    prisma.team.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 5
    }),
    prisma.community.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 5
    }),
    prisma.challenge.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        isActive: true
      },
      take: 5
    })
  ])

  return Response.json({ users, teams, communities, challenges })
}
```

---

## 9. Ranking Engine & Sport Index

### Sport Index Formula (0-1000 points)

```
┌──────────────────────────────────────────────────────────────┐
│                    SPORT INDEX FORMULA                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Sport Index = Activity Frequency (200)                       │
│              + Performance Level (400)                        │
│              + Consistency/Streaks (150)                      │
│              + Variety Bonus (100)                            │
│              + Improvement Trend (100)                        │
│              + Social Engagement (50)                         │
│                                                               │
│  Total Maximum: 1000 points                                   │
└──────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Max | Calculation |
|-----------|-----|-------------|
| Activity Frequency | 200 | Activities per week (28-day rolling) |
| Performance Level | 400 | Benchmark percentile scores |
| Consistency | 150 | Current streak × 10 (max 15 days) |
| Variety | 100 | Sports practiced × 20 (max 5) |
| Improvement | 100 | Month-over-month gains |
| Social | 50 | Teams + challenges participation |

### Ranking Calculation

```typescript
// lib/rankings.ts
export async function calculateSportIndex(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      activities: {
        where: {
          activityDate: { gte: subDays(new Date(), 28) }
        }
      },
      streak: true,
      teamMemberships: true,
      challengeParticipations: { where: { isCompleted: false } },
      benchmarkBests: true
    }
  })

  // Activity Frequency (max 200)
  const weeklyActivities = user.activities.length / 4
  const frequencyScore = Math.min(200, weeklyActivities * 40)

  // Performance Level (max 400)
  const performanceScore = await calculatePerformanceScore(user.benchmarkBests)

  // Consistency (max 150)
  const consistencyScore = Math.min(150, (user.streak?.currentStreak || 0) * 10)

  // Variety (max 100)
  const sportsCount = new Set(user.activities.map(a => a.sportId)).size
  const varietyScore = Math.min(100, sportsCount * 20)

  // Social (max 50)
  const teamsCount = user.teamMemberships.length
  const challengesCount = user.challengeParticipations.length
  const socialScore = Math.min(50, (teamsCount * 10) + (challengesCount * 5))

  return Math.round(
    frequencyScore +
    performanceScore +
    consistencyScore +
    varietyScore +
    socialScore
  )
}
```

### Ranking Scopes

| Scope | Description |
|-------|-------------|
| Global | Worldwide rankings by Sport Index |
| Country | National rankings |
| City | Local/city rankings |
| Friends | Rankings among followed users |
| Team | Team-specific rankings |

### Leaderboard Caching

```typescript
// Cached leaderboard structure
model RankingCache {
  id              String    @id @default(cuid())
  sportId         String?   // null = overall
  scope           String    // GLOBAL, COUNTRY, CITY, FRIENDS, TEAM
  scopeValue      String?   // "Prague", "Czech Republic", etc.
  period          String    @default("ALL_TIME")
  leaderboard     String    // JSON: [{userId, rank, score, name, avatar}]
  totalUsers      Int
  calculatedAt    DateTime  @default(now())

  @@unique([sportId, scope, scopeValue, period])
}
```

---

## 10. Gamification System

### Badges

**Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| Distance | Total distance milestones | "Century Runner" (100km), "Marathon Finisher" |
| Consistency | Streak achievements | "7-Day Warrior", "Month Master" (30 days) |
| Performance | Speed/pace records | "Sub-20 5K", "Century Ride" |
| Social | Community engagement | "Social Butterfly" (50 follows), "Team Player" |
| Challenge | Challenge completions | "Challenge Champion" (10 completed) |
| Special | Limited edition | "Early Adopter", "Beta Tester" |

**Rarity Levels:**

```
COMMON     → Easy to achieve (gray border)
UNCOMMON   → Moderate effort (green border)
RARE       → Significant achievement (blue border)
EPIC       → Major milestone (purple border)
LEGENDARY  → Exceptional achievement (gold border)
```

### Badge Checking

```typescript
// lib/gamification.ts
export async function checkBadgeEligibility(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
      streak: true,
      badges: true,
      activities: true
    }
  })

  const earnedBadgeIds = user.badges.map(b => b.badgeId)
  const availableBadges = await prisma.badge.findMany({
    where: { isActive: true, id: { notIn: earnedBadgeIds } }
  })

  for (const badge of availableBadges) {
    const isEligible = await checkCriteria(badge, user)
    if (isEligible) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id }
      })
      await createBadgeNotification(userId, badge)
    }
  }
}

async function checkCriteria(badge: Badge, user: UserWithStats) {
  switch (badge.criteriaType) {
    case "TOTAL_DISTANCE":
      return user.stats.totalDistance >= badge.criteriaValue
    case "STREAK_DAYS":
      return user.streak.currentStreak >= badge.criteriaValue
    case "TOTAL_ACTIVITIES":
      return user.stats.totalActivities >= badge.criteriaValue
    case "SPORT_INDEX":
      return user.stats.sportIndex >= badge.criteriaValue
    // ... more criteria
  }
}
```

### Streaks

**Daily Streak:**
- Log at least one activity per day
- Streak resets at midnight (user's timezone)
- Longest streak tracked separately

**Weekly Goals:**
- Default: 3 activities per week
- Configurable per user (1-7)
- Week resets on Monday

```typescript
// lib/gamification.ts
export async function updateStreak(userId: string) {
  const streak = await prisma.userStreak.findUnique({
    where: { userId }
  })

  const today = startOfDay(new Date())
  const lastActivity = streak?.lastActivityDate
    ? startOfDay(streak.lastActivityDate)
    : null

  if (!lastActivity) {
    // First activity ever
    await prisma.userStreak.upsert({
      where: { userId },
      update: { currentStreak: 1, lastActivityDate: today },
      create: { userId, currentStreak: 1, lastActivityDate: today }
    })
  } else if (isToday(lastActivity)) {
    // Already logged today, no change
    return
  } else if (isYesterday(lastActivity)) {
    // Continuing streak
    const newStreak = streak.currentStreak + 1
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastActivityDate: today
      }
    })
  } else {
    // Streak broken
    await prisma.userStreak.update({
      where: { userId },
      data: { currentStreak: 1, lastActivityDate: today }
    })
  }
}
```

---

## 11. Social Platform

### Following System

- Unidirectional (like Twitter/Instagram)
- Follower/following counts on profile
- Feed shows followed users' activities

```typescript
// Toggle follow
export async function toggleFollow(targetUserId: string) {
  const session = await getServerSession(authOptions)

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    }
  })

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } })
    return { following: false }
  } else {
    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: targetUserId
      }
    })
    await createFollowNotification(targetUserId, session.user.id)
    return { following: true }
  }
}
```

### Follow Suggestions Algorithm

```typescript
// app/api/social/suggestions/route.ts
export async function GET() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      following: true,
      sports: { include: { sport: true } }
    }
  })

  const followingIds = user.following.map(f => f.followingId)
  const userSportIds = user.sports.map(s => s.sportId)

  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: [...followingIds, user.id] }
    },
    include: {
      sports: { include: { sport: true } }
    },
    take: 50
  })

  // Score and sort
  const scored = suggestions.map(u => {
    let score = 0
    if (u.city === user.city) score += 3
    const sharedSports = u.sports.filter(s =>
      userSportIds.includes(s.sportId)
    ).length
    score += sharedSports * 2
    return { user: u, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.user)
}
```

### Activity Feed

```typescript
// app/api/feed/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get("cursor")

  // Get followed users
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true }
  })
  const followingIds = following.map(f => f.followingId)

  // Include own posts
  const authorIds = [...followingIds, session.user.id]

  const posts = await prisma.post.findMany({
    where: {
      userId: { in: authorIds },
      visibility: "PUBLIC"
    },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true, username: true } },
      activity: { include: { discipline: { include: { sport: true } } } },
      likes: { where: { userId: session.user.id } },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0
  })

  return Response.json({
    posts,
    nextCursor: posts.length === 20 ? posts[posts.length - 1].id : null
  })
}
```

### Reactions

```typescript
// Supported reaction types
type ReactionType = "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY"

// Toggle reaction
export async function toggleReaction(postId: string, type: ReactionType) {
  const session = await getServerSession(authOptions)

  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: { postId, userId: session.user.id }
    }
  })

  if (existing) {
    if (existing.type === type) {
      // Remove reaction
      await prisma.like.delete({ where: { id: existing.id } })
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      })
    } else {
      // Change reaction type
      await prisma.like.update({
        where: { id: existing.id },
        data: { type }
      })
    }
  } else {
    // Add new reaction
    await prisma.like.create({
      data: { postId, userId: session.user.id, type }
    })
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } }
    })
  }
}
```

---

## 12. Teams & Communities

### Teams

**Team Types:**
- `CLUB` - Official sports club
- `SQUAD` - Competitive team
- `CASUAL` - Informal group

**Member Roles:**
- `OWNER` - Full control, can delete team
- `MODERATOR` - Manage members, posts
- `MEMBER` - Participate in activities

**Team Features:**
- Team leaderboard (by Sport Index)
- Team challenges
- Team posts/feed
- Jersey numbers & positions
- Verification badge

```typescript
// Create team
export async function createTeam(data: TeamInput) {
  const session = await getServerSession(authOptions)

  const team = await prisma.team.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      sportId: data.sportId,
      city: data.city,
      country: data.country,
      teamType: data.type,
      isPublic: data.isPublic,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER"
        }
      },
      memberCount: 1
    }
  })

  return team
}

// Join team
export async function joinTeam(teamSlug: string, message?: string) {
  const session = await getServerSession(authOptions)

  const team = await prisma.team.findUnique({
    where: { slug: teamSlug }
  })

  if (team.isPublic) {
    // Direct join
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        role: "MEMBER"
      }
    })
    await prisma.team.update({
      where: { id: team.id },
      data: { memberCount: { increment: 1 } }
    })
  } else {
    // Create join request
    await prisma.teamJoinRequest.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        message
      }
    })
  }
}
```

### Communities

**Features:**
- Topic-based groups (e.g., "Trail Running", "Beginner Cyclists")
- Multi-sport or single sport focus
- Location-based communities
- Public/private visibility
- Discussion posts

```typescript
// Community structure
model Community {
  id              String    @id
  name            String
  slug            String    @unique
  description     String?
  coverPhotoUrl   String?
  sportId         String?   // null = multi-sport
  topic           String?
  city            String?
  country         String?
  isPublic        Boolean   @default(true)
  memberCount     Int       @default(0)

  members         CommunityMember[]
  posts           CommunityPost[]
}
```

---

## 13. Benchmarks & Personal Bests

### Benchmark System

EverGo tracks standardized benchmarks across sports for fair comparison:

**Running Benchmarks:**
- 5K Time
- 10K Time
- Half Marathon Time
- Marathon Time
- Mile Time

**Cycling Benchmarks:**
- FTP (Functional Threshold Power)
- 20-minute Power
- 1-hour Distance

**Swimming Benchmarks:**
- 100m Freestyle
- 400m Freestyle
- 1500m Freestyle

**Strength Benchmarks:**
- Bench Press 1RM
- Squat 1RM
- Deadlift 1RM

### Benchmark Definition

```typescript
model BenchmarkDefinition {
  id              String   @id @default(cuid())
  sportId         String
  slug            String   // "5k", "bench-1rm"
  name            String   // "5K Time", "Bench Press 1RM"
  measurementType BenchmarkMeasurementType
  unit            String   // "sec", "km", "kg"
  higherIsBetter  Boolean  @default(true)
  targetJson      Json?    // { distanceMeters: 5000 }
  validityMonths  Int      @default(24)
  rankWeight      Float    @default(1.0)

  @@unique([sportId, slug])
}

enum BenchmarkMeasurementType {
  TIME            // seconds, lower is better
  DISTANCE        // meters, higher is better
  SPEED           // km/h, higher is better
  POWER           // watts, higher is better
  WEIGHT_REPS     // kg + reps for 1RM calculation
  SCORE           // points/rating
  COUNT           // reps, waves
  GRADE_LEVEL     // climbing grade
}
```

### Recording Benchmarks

```typescript
// app/actions/benchmarks.ts
export async function recordBenchmark(
  benchmarkId: string,
  value: number,
  achievedAt: Date,
  source: "MANUAL" | "ACTIVITY_DERIVED" | "IMPORT_STRAVA"
) {
  const session = await getServerSession(authOptions)

  const benchmark = await prisma.benchmarkDefinition.findUnique({
    where: { id: benchmarkId }
  })

  const existing = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: {
        userId: session.user.id,
        benchmarkId
      }
    }
  })

  const isBetter = benchmark.higherIsBetter
    ? value > (existing?.value || 0)
    : value < (existing?.value || Infinity)

  if (!existing || isBetter) {
    await prisma.userBenchmarkBest.upsert({
      where: {
        userId_benchmarkId: {
          userId: session.user.id,
          benchmarkId
        }
      },
      update: { value, achievedAt, source },
      create: {
        userId: session.user.id,
        benchmarkId,
        value,
        achievedAt,
        source
      }
    })

    // Update Sport Index
    await recalculateSportIndex(session.user.id)

    return { isNewPB: true }
  }

  return { isNewPB: false }
}
```

---

## 14. Training Plans

### Plan Structure

```
TrainingPlan
├── name: "Couch to 5K"
├── description: "8-week beginner running program"
├── duration: 8 (weeks)
├── level: "BEGINNER"
├── sportId: "running"
└── weeks: TrainingPlanWeek[]
    ├── Week 1: "Getting Started"
    │   └── workouts: TrainingPlanWorkout[]
    │       ├── Day 0 (Mon): "Walk/Run" - 20min
    │       ├── Day 2 (Wed): "Walk/Run" - 20min
    │       └── Day 4 (Fri): "Walk/Run" - 25min
    ├── Week 2: "Building Base"
    │   └── workouts: [...]
    └── ... (8 weeks total)
```

### Plan Types

| Level | Description | Example |
|-------|-------------|---------|
| Beginner | New to the sport | Couch to 5K, Learn to Swim |
| Intermediate | Regular practitioners | 10K Improvement, Century Ride Prep |
| Advanced | Competitive athletes | Marathon Sub-3:30, Ironman Training |

### User Progress Tracking

```typescript
model UserTrainingPlan {
  id              String    @id @default(cuid())
  userId          String
  planId          String
  startDate       DateTime
  currentWeek     Int       @default(1)
  status          String    @default("ACTIVE")
  completedWorkouts String  @default("[]") // JSON array

  @@unique([userId, planId])
}

// Start a training plan
export async function startPlan(planId: string) {
  const session = await getServerSession(authOptions)

  await prisma.userTrainingPlan.create({
    data: {
      userId: session.user.id,
      planId,
      startDate: new Date(),
      currentWeek: 1,
      status: "ACTIVE"
    }
  })
}

// Log workout completion
export async function logWorkout(
  userPlanId: string,
  weekNumber: number,
  dayOfWeek: number,
  activityId?: string
) {
  const userPlan = await prisma.userTrainingPlan.findUnique({
    where: { id: userPlanId }
  })

  const completed = JSON.parse(userPlan.completedWorkouts)
  completed.push({
    weekNumber,
    dayOfWeek,
    activityId,
    completedAt: new Date()
  })

  await prisma.userTrainingPlan.update({
    where: { id: userPlanId },
    data: {
      completedWorkouts: JSON.stringify(completed),
      currentWeek: Math.max(userPlan.currentWeek, weekNumber)
    }
  })
}
```

---

## 15. Integrations

### Strava Integration

EverGo supports full Strava integration for automatic activity sync:

**OAuth Flow:**

```
1. User clicks "Connect Strava"
2. Redirect to Strava authorization
3. User grants permissions (read activities)
4. Callback with authorization code
5. Exchange code for tokens
6. Store encrypted refresh token
7. Trigger initial backfill
```

**Webhook Events:**

| Event | Action |
|-------|--------|
| activity.create | Fetch and import new activity |
| activity.update | Update existing activity |
| activity.delete | Mark activity as hidden |
| athlete.update | Refresh athlete profile |

```typescript
// app/api/strava/webhook/route.ts
export async function POST(req: Request) {
  const event = await req.json()

  // Verify webhook signature
  if (!verifyWebhook(event)) {
    return Response.json({ error: "Invalid" }, { status: 401 })
  }

  // Queue event for processing
  await prisma.stravaWebhookEvent.create({
    data: {
      subscriptionId: event.subscription_id,
      ownerId: event.owner_id,
      objectType: event.object_type,
      objectId: event.object_id,
      aspectType: event.aspect_type,
      updates: event.updates,
      eventTime: new Date(event.event_time * 1000)
    }
  })

  // Process asynchronously
  processWebhookEvent(event)

  return Response.json({ received: true })
}
```

**Activity Mapping:**

| Strava Type | EverGo Sport | Discipline |
|-------------|--------------|------------|
| Run | Running | Based on distance |
| Ride | Cycling | Road/MTB based on type |
| Swim | Swimming | Pool/Open Water |
| Walk | Hiking | Day Hike |
| Hike | Hiking | Day Hike |
| WeightTraining | Fitness | Gym |
| Yoga | Fitness | Yoga |

---

## 16. PWA & Mobile Experience

### Web App Manifest

```json
{
  "name": "EverGo",
  "short_name": "EverGo",
  "description": "The global network for sports",
  "start_url": "/home",
  "display": "standalone",
  "theme_color": "#6366F1",
  "background_color": "#F8FAFC",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Log Activity",
      "url": "/activity/create",
      "icons": [{ "src": "/icons/shortcut-log.png", "sizes": "96x96" }]
    },
    {
      "name": "Rankings",
      "url": "/rankings",
      "icons": [{ "src": "/icons/shortcut-rankings.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'evergo-v1'
const STATIC_ASSETS = [
  '/',
  '/home',
  '/offline',
  '/icons/icon-192.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
    data: data.url
  })
})
```

### Install Prompt

```typescript
// components/pwa/install-prompt.tsx
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    })
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 inset-x-4 p-4 bg-white rounded-xl shadow-lg">
      <p>Install EverGo for the best experience</p>
      <Button onClick={handleInstall}>Install</Button>
    </div>
  )
}
```

---

## 17. Notifications System

### Notification Types

| Category | Types |
|----------|-------|
| Social | Like, Comment, Follow, Mention, Friend Request |
| Ranking | Rank Up, Rank Down, Overtake, Milestone |
| Streak | Reminder, Broken, Milestone |
| Challenge | Joined, Progress, Ending Soon, Completed |
| Badge | Badge Earned |
| Team | Invite, Join Request, Post, Challenge |
| System | Weekly Summary, Updates, Gear Replacement |

### User Preferences

```typescript
model NotificationSettings {
  id                  String    @id @default(cuid())
  userId              String    @unique

  pushEnabled         Boolean   @default(true)
  socialEnabled       Boolean   @default(true)
  rankingEnabled      Boolean   @default(true)
  streakEnabled       Boolean   @default(true)
  challengeEnabled    Boolean   @default(true)
  teamEnabled         Boolean   @default(true)
  marketingEnabled    Boolean   @default(false)

  weeklyDigestEnabled Boolean   @default(true)
  weeklyDigestDay     Int       @default(0) // Sunday

  quietHoursEnabled   Boolean   @default(false)
  quietHoursStart     String?   // "22:00"
  quietHoursEnd       String?   // "08:00"
}
```

### Creating Notifications

```typescript
// lib/notifications.ts
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  // Check user preferences
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId }
  })

  const category = getNotificationCategory(type)
  if (settings && !settings[`${category}Enabled`]) {
    return null // User disabled this category
  }

  // Check quiet hours
  if (settings?.quietHoursEnabled && isQuietHours(settings)) {
    // Queue for later delivery
    return queueNotification(userId, type, title, message, data)
  }

  // Create notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : null
    }
  })

  // Send push if enabled
  if (settings?.pushEnabled) {
    await sendPushNotification(userId, { title, message, data })
  }

  return notification
}
```

### Push Notifications

```typescript
// lib/notifications.ts
import webPush from 'web-push'

webPush.setVapidDetails(
  'mailto:support@evergo.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  userId: string,
  payload: { title: string; message: string; data?: any }
) {
  const tokens = await prisma.pushToken.findMany({
    where: { userId, isActive: true }
  })

  const results = await Promise.allSettled(
    tokens.map(token =>
      webPush.sendNotification(
        JSON.parse(token.token),
        JSON.stringify(payload)
      )
    )
  )

  // Mark failed tokens as inactive
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      prisma.pushToken.update({
        where: { id: tokens[i].id },
        data: { isActive: false }
      })
    }
  })
}
```

---

## 18. Monetization & Subscriptions

### Subscription Plans

| Feature | Free | Pro ($9.99/mo) | Pro Annual ($99/yr) |
|---------|------|----------------|---------------------|
| Sports | 3 max | Unlimited | Unlimited |
| Teams | 1 max | Unlimited | Unlimited |
| Rankings | City/Country | + Global | + Global |
| History | 90 days | Unlimited | Unlimited |
| Analytics | Basic | Advanced | Advanced |
| Custom Challenges | No | Yes | Yes |
| Data Export | No | Yes | Yes |
| Ads | Yes | No | No |
| Support | Standard | Priority | Priority |

### Stripe Integration

```typescript
// app/api/subscription/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const { priceId } = await req.json()

  // Get or create Stripe customer
  let customerId = session.user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id }
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId }
    })
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/settings/subscription?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/settings/subscription?canceled=true`
  })

  return Response.json({ url: checkoutSession.url })
}
```

### Gear Tracking

Track equipment usage for replacement recommendations:

```typescript
model UserGear {
  id              String    @id @default(cuid())
  userId          String
  gearType        GearType  // RUNNING_SHOES, BIKE, etc.
  brand           String
  model           String
  nickname        String?
  purchaseDate    DateTime?
  purchasePrice   Float?
  totalDistance   Float     @default(0)  // meters
  totalDuration   Int       @default(0)  // seconds
  activityCount   Int       @default(0)
  isRetired       Boolean   @default(false)
  maxRecommendedDistance Float?
}

// Check gear replacement
export async function checkGearReplacement(userId: string) {
  const gear = await prisma.userGear.findMany({
    where: {
      userId,
      isRetired: false,
      gearType: "RUNNING_SHOES"
    }
  })

  const alerts = []
  for (const item of gear) {
    const usagePercent = item.totalDistance / (item.maxRecommendedDistance || 800000)
    if (usagePercent >= 0.8) {
      alerts.push({
        gearId: item.id,
        name: item.nickname || `${item.brand} ${item.model}`,
        usagePercent: Math.round(usagePercent * 100),
        recommendation: "Consider replacing soon"
      })
    }
  }

  return alerts
}
```

---

## 19. Component Architecture

### Layout Components

```
components/layout/
├── page-grid.tsx           # Responsive 12-column grid
├── page-subheader.tsx      # Page headers with actions
├── sidebar-navigation.tsx  # Desktop sidebar
├── section-header.tsx      # Section titles
└── content-card.tsx        # Card containers
```

### Navigation

```typescript
// components/main-nav.tsx (Desktop)
export function MainNav() {
  return (
    <header className="hidden lg:flex h-16 border-b">
      <nav className="flex items-center gap-6 px-6">
        <Link href="/home">
          <Logo />
        </Link>
        <NavLink href="/home">Home</NavLink>
        <NavLink href="/rankings">Rankings</NavLink>
        <NavLink href="/challenges">Challenges</NavLink>
        <NavLink href="/teams">Teams</NavLink>
        <SearchCommand />
        <UserMenu />
      </nav>
    </header>
  )
}

// components/mobile-nav.tsx (Mobile)
export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 border-t bg-white">
      <div className="flex justify-around items-center h-full">
        <NavItem href="/home" icon={Home} label="Home" />
        <NavItem href="/rankings" icon={Trophy} label="Rankings" />
        <NavItem href="/activity/create" icon={Plus} label="Log" primary />
        <NavItem href="/challenges" icon={Target} label="Challenges" />
        <NavItem href="/profile" icon={User} label="Profile" />
      </div>
    </nav>
  )
}
```

### UI Primitives (Radix-based)

```
components/ui/
├── accordion.tsx
├── alert-dialog.tsx
├── avatar.tsx
├── badge.tsx
├── button.tsx
├── calendar.tsx
├── card.tsx
├── command.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── form.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── progress.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── skeleton.tsx
├── slider.tsx
├── sonner.tsx (toast)
├── switch.tsx
├── tabs.tsx
├── textarea.tsx
└── tooltip.tsx
```

### Widget Components

```typescript
// components/widgets/RankingSpotlight.tsx
interface RankingSpotlightProps {
  variant: "compact" | "full"
  globalRank: number
  globalRankChange: number
  cityRank: number
  cityRankChange: number
  cityName: string
  sportIndex: number
  sportIndexChange: number
  percentile: number
}

// components/widgets/calendar-widget.tsx
export function CalendarWidget() {
  // Shows upcoming events and activity heat map
}

// components/widgets/follow-suggestions-wrapper.tsx
export function FollowSuggestionsWrapper() {
  // Client component that fetches and displays suggestions
}
```

---

## 20. Home Page Layout

### Widget Ordering

The home page follows a competition-first layout:

```
┌─────────────────────────────────────────────────────────────────┐
│                     WELCOME HERO (Full Width)                    │
│   Stats + Log Activity CTA + Sport-specific background          │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                     PULSE RAIL (Stories)                         │
│   Friend activity carousel - horizontal scroll                   │
└─────────────────────────────────────────────────────────────────┘
┌────────────────────────────────┬────────────────────────────────┐
│         MAIN COLUMN (8)        │        SIDEBAR (4)             │
│                                │                                 │
│  ┌──────────────────────────┐  │  ┌───────────────────────────┐ │
│  │   COMPETE NOW DECK       │  │  │   CALENDAR WIDGET         │ │
│  │   (Rivalries/Challenges) │  │  │   (Upcoming Events)       │ │
│  │   #1 Priority            │  │  └───────────────────────────┘ │
│  └──────────────────────────┘  │                                 │
│                                │  ┌───────────────────────────┐ │
│  ┌──────────────────────────┐  │  │   PARTNER FINDER          │ │
│  │   RANKING SPOTLIGHT      │  │  │   (Find workout buddies)  │ │
│  │   (Compact stats)        │  │  └───────────────────────────┘ │
│  └──────────────────────────┘  │                                 │
│                                │  ┌───────────────────────────┐ │
│  ┌──────────────────────────┐  │  │   FOLLOW SUGGESTIONS      │ │
│  │   CREATE POST BOX        │  │  │   (People to follow)      │ │
│  └──────────────────────────┘  │  └───────────────────────────┘ │
│                                │                                 │
│  ┌──────────────────────────┐  │                                 │
│  │   ACTIVITY FEED          │  │                                 │
│  │   (Infinite scroll)      │  │                                 │
│  └──────────────────────────┘  │                                 │
└────────────────────────────────┴────────────────────────────────┘
```

### CompeteNowDeck

The compete deck prioritizes items with deterministic sorting:

```typescript
// lib/home/prioritizeCompeteItems.ts
export type CompeteItem =
  | { kind: "rivalry"; id: string; endsAt?: string; opponentName: string; status: string; ... }
  | { kind: "challenge"; id: string; endsAt?: string; title: string; progress?: number; ... }
  | { kind: "teamBattle"; id: string; endsAt?: string; title: string; teamName?: string; ... }
  | { kind: "teaser"; id: "teaser-start-rivalry" }

export function prioritizeCompeteItems(items: CompeteItem[]): CompeteItem[] {
  const score = (x: CompeteItem): number => {
    const endingSoon = x.kind !== "teaser" && hoursUntil(x.endsAt) <= 72

    if (x.kind === "rivalry" && endingSoon) return 1000
    if (x.kind === "rivalry") return 900
    if (x.kind === "challenge" && endingSoon) return 800
    if (x.kind === "teamBattle" && endingSoon) return 700
    if (x.kind === "challenge") return 600
    if (x.kind === "teamBattle") return 500
    return 0 // teaser
  }

  return [...items].sort((a, b) => {
    const d = score(b) - score(a)
    if (d !== 0) return d
    return a.id.localeCompare(b.id) // deterministic tie-breaker
  })
}
```

---

## 21. Testing Infrastructure

### Playwright E2E Tests

```
e2e/
├── accessibility.a11y.spec.ts   # Accessibility tests
├── api.api.spec.ts              # API endpoint tests
├── auth.unauth.spec.ts          # Authentication tests
├── components.spec.ts            # Component tests
├── forms.spec.ts                 # Form validation tests
├── navigation.spec.ts            # Navigation tests
├── security.spec.ts              # Security tests
├── user-journey.spec.ts          # Full user journeys
├── visual.spec.ts                # Visual regression
├── agents/                       # AI test agents
│   ├── atlas.ts                  # Navigation agent
│   ├── hermes.ts                 # Form agent
│   ├── nyx.ts                    # Visual agent
│   ├── iris.ts                   # Accessibility agent
│   └── kronos.ts                 # Performance agent
├── fixtures/                     # Test fixtures
├── pages/                        # Page object models
└── scenarios/                    # Test scenarios
```

### Test Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 2,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    // AI agents
    { name: 'atlas', testMatch: /agents\/atlas/ },
    { name: 'hermes', testMatch: /agents\/hermes/ },
    { name: 'nyx', testMatch: /agents\/nyx/ },
    { name: 'iris', testMatch: /agents\/iris/ },
    { name: 'kronos', testMatch: /agents\/kronos/ }
  ]
})
```

### Mike AI Testing Framework

Mike is a custom AI-powered testing framework:

```
mike/
├── cli.ts              # Command-line interface
├── core/               # Core engine
│   ├── mike.ts         # Main orchestrator
│   └── types.ts        # Type definitions
├── discovery/          # Page discovery
│   ├── page-crawler.ts # Crawls pages
│   └── element-discovery.ts
├── executors/          # Test execution
│   └── test-executor.ts
├── generators/         # Scenario generation
│   └── scenario-generator.ts
├── reporters/          # Result reporting
│   └── test-reporter.ts
└── scenarios/          # Pre-defined scenarios
    └── evergo-scenarios.ts
```

**Running Mike:**

```bash
# Smoke tests
npm run mike:smoke

# Full test suite
npm run mike:full

# Discovery mode (find testable elements)
npm run mike:discover

# With verbose output
npm run mike:full -- --verbose
```

---

## 22. Deployment & DevOps

### Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Authentication
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="https://evergo-nu.vercel.app"

# Strava
STRAVA_CLIENT_ID="your-client-id"
STRAVA_CLIENT_SECRET="your-client-secret"
STRAVA_WEBHOOK_VERIFY_TOKEN="random-token"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."

# Push Notifications
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npx playwright install --with-deps
      - run: npm run test

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: test-results/
```

---

## 23. Development Guide

### Getting Started

```bash
# Clone repository
git clone https://github.com/prokesmic/EverGo.git
cd EverGo

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run Playwright tests |
| `npm run test:ui` | Playwright UI mode |
| `npm run mike:smoke` | Mike smoke tests |
| `npm run mike:full` | Mike full test suite |
| `npm run db:push` | Push schema changes |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run seed:benchmarks` | Seed benchmark definitions |

### Code Style Guidelines

1. **TypeScript Strict Mode** - All code must be type-safe
2. **Server Components** - Default to server components, use client only when needed
3. **Server Actions** - Prefer server actions over API routes for mutations
4. **Radix UI** - Use Radix primitives for accessible components
5. **Tailwind CSS** - Utility-first styling, avoid custom CSS
6. **Test IDs** - Use `data-testid` attributes for testable elements

### Adding a New Feature

1. **Database Changes**
   - Update `prisma/schema.prisma`
   - Run `npx prisma db push`
   - Update seed if needed

2. **API Routes**
   - Create route in `app/api/[feature]/route.ts`
   - Add to route documentation

3. **Server Actions**
   - Create in `app/actions/[feature].ts`
   - Use Zod for validation

4. **Components**
   - Create in `components/[feature]/`
   - Use Radix primitives
   - Add test IDs

5. **Pages**
   - Create in `app/[feature]/page.tsx`
   - Add to route registry in `lib/routes.ts`

6. **Testing**
   - Add Playwright tests
   - Add Mike scenarios if applicable

---

## Summary

EverGo V3 is a production-ready social fitness platform featuring:

- **12+ Sports** with discipline-specific tracking
- **Sport Index** (0-1000) ranking system
- **Rivalries & Challenges** for competition
- **Teams & Communities** for social engagement
- **Badges & Streaks** for gamification
- **Training Plans** for structured programs
- **Strava Integration** for auto-sync
- **PWA Support** for mobile experience
- **Comprehensive Testing** with Playwright + Mike AI

Built with Next.js 16, React 19, Prisma, PostgreSQL, and modern best practices.

---

*Documentation Version: 3.0*
*Last Updated: December 2024*
*EverGo - Track, Compete, Connect*
