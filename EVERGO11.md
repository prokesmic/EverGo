# EVERGO V11 - Comprehensive Documentation

> **EverGo** is a next-generation fitness competition platform that transforms solo workouts into engaging social competitions. Built with Next.js 16, React 19, and PostgreSQL, it combines activity tracking, multi-dimensional rankings, and gamification into a cohesive athletic social network.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [V11 New Features](#2-v11-new-features)
3. [Technology Stack](#3-technology-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Core Data Models](#5-core-data-models)
6. [Competitive Systems](#6-competitive-systems)
7. [Ranking & Scoring](#7-ranking--scoring)
8. [Power System](#8-power-system)
9. [Gamification](#9-gamification)
10. [Social Features](#10-social-features)
11. [Integrations](#11-integrations)
12. [API Reference](#12-api-reference)
13. [App Routes](#13-app-routes)
14. [Component Architecture](#14-component-architecture)
15. [Library Modules](#15-library-modules)
16. [Configuration](#16-configuration)
17. [Testing](#17-testing)
18. [Unique Innovations](#18-unique-innovations)

---

## 1. Executive Summary

**Evergo** is a sports performance and social fitness platform that combines activity tracking, competitive rankings, gamification, and social features into a unified experience for athletes of all levels.

### Key Capabilities

- **Activity Tracking**: Manual logging and automatic import from Strava/Garmin
- **Multi-Dimensional Rankings**: Global, country, city, friends, and team leaderboards
- **Competitive Features**: Gauntlets (1v1), Rivalries, Rank Battles, Crew Wars, Seasons
- **Social Platform**: Activity feed, posts, following, teams
- **Gamification**: Badges, streaks, achievements, moments
- **Verification System**: Bronze/Silver/Gold/Platinum tiers with proof levels
- **Sport-Specific Vanity Metrics**: Brag-worthy stats for each sport category

### V11 Highlights

- **Trust & Verification Ladder**: 4-tier system (Bronze→Platinum) with proof levels
- **Identity-Driven Onboarding**: Persona selection (Competitor/Tracker/Social)
- **Recovery Mode + Consistency League**: 6-tier consistency system with recovery protection
- **Automatic Moments Detection**: Auto-detect PRs, milestones, and achievements
- **Shareable Sport Résumé Card**: Generate beautiful share cards
- **Rivalries as Spectator Product**: Watch public rivalries with commentary
- **Team Sports Outcomes**: Win/Loss/Draw tracking for team sports
- **Home/Profile Polish**: Unified data fetching and persona-based layouts
- **Vanity Metrics**: Sport-specific bragging metrics (jump height, vertical descent, etc.)

---

## 2. V11 New Features

### 2.1 Trust & Verification Ladder

A 4-tier verification system that builds trust over time.

#### Tiers

| Tier | Trust Multiplier | Requirements |
|------|------------------|--------------|
| BRONZE | 0.5x | Default starting tier |
| SILVER | 0.75x | 10+ activities, 30% device-verified |
| GOLD | 1.0x | 50+ activities, 50% device-verified, connected integration |
| PLATINUM | 1.0x | 100+ activities, 75% device-verified, verified athlete status |

#### Proof Levels

Each activity can have a proof level indicating the evidence supporting it:

| Level | Description |
|-------|-------------|
| MANUAL | Typed by user, no evidence |
| PHOTO | Has photo attachment |
| GPX | Has GPS track file |
| SENSOR | Derived from connected sensor/device |
| VERIFIED | Admin or official source verified |

#### Key Files
- `lib/verification/ladder.ts` - Tier logic and progression
- `components/ui/proof-badge.tsx` - Visual badges
- `app/api/me/verification/route.ts` - API endpoint

### 2.2 Identity-Driven Onboarding

Users select their persona during onboarding, which personalizes their experience.

#### Personas

| Persona | Focus | Primary Sections |
|---------|-------|------------------|
| COMPETITOR | Rankings and competition | Rankings, Rivalries, Gauntlets, Season |
| TRACKER | Personal logging | Stats, Streak, Moments, Progress |
| SOCIAL | Friends and community | Feed, Moments, Friends, Teams |

#### Key Files
- `components/onboarding/steps/Step0Persona.tsx` - Persona selection UI
- `components/onboarding/OnboardingWizard.tsx` - Updated wizard
- `lib/onboarding/store.ts` - State management

### 2.3 Recovery Mode + Consistency League

#### Consistency Tiers

| Tier | Score Range | Description |
|------|-------------|-------------|
| STARTER | 0-99 | Just getting started |
| REGULAR | 100-299 | Building habits |
| DEDICATED | 300-499 | Consistent effort |
| COMMITTED | 500-749 | Strong commitment |
| ELITE | 750-899 | Top performers |
| LEGENDARY | 900+ | Exceptional consistency |

#### Consistency Score Formula

```typescript
baseScore = weeklyActivityCount * 10
bonuses = {
  perfectWeek: +20 (all 7 days)
  weekendBonus: +5 (activity on Sat/Sun)
  varietyBonus: +10 (3+ different sports)
}
penalties = {
  missedDay: -5 per day without activity
}
```

#### Recovery Mode

Protects streaks and rankings during life events:
- Duration: 7 days
- Uses per year: 3
- Effects: Streak frozen, ranking decay paused

#### Key Files
- `lib/metrics/consistencyScore.ts` - Score calculation
- `lib/competition/recoveryMode.ts` - Recovery logic
- `app/api/me/recovery/route.ts` - API endpoint
- `components/competition/RecoveryModeCard.tsx` - UI component

### 2.4 Automatic Moments Detection

Auto-detects notable achievements and creates shareable "moments".

#### Moment Types

| Type | Description |
|------|-------------|
| PERSONAL_RECORD | New PR achieved |
| STREAK_MILESTONE | Hit 7, 14, 30, 100+ day streak |
| ACTIVITY_MILESTONE | 100th, 500th, 1000th activity |
| RANK_UP | Moved up in rankings |
| RIVALRY_WIN | Won a rivalry |
| GAUNTLET_WIN | Won a gauntlet |
| SEASON_PLACEMENT | Top 10 season finish |
| BADGE_EARNED | Earned a new badge |
| FIRST_ACTIVITY | First activity in a sport |
| BIG_ACTIVITY | Exceptional distance/duration |

#### Key Files
- `lib/moments/detect.ts` - Detection logic
- `app/api/me/moments/route.ts` - API endpoint

### 2.5 Shareable Sport Résumé Card

Generate beautiful shareable profile cards.

#### Card Contents
- User avatar and display name
- Verification tier badge
- Primary sport with vanity metric
- Key stats (streak, activities, rank)
- Recent achievements

#### Key Files
- `lib/share/resumeCard.ts` - Card generation
- `app/api/me/resume-card/route.ts` - API endpoint

### 2.6 Rivalries as Spectator Product

Public rivalries can be watched by anyone.

#### Features
- Head-to-head history display
- Live score tracking
- Auto-generated commentary
- "Hot/Warm/Cold" form indicators
- Watcher/Hype counts (planned)

#### Key Files
- `lib/rivalry/spectator.ts` - Spectator system

### 2.7 Team Sports Outcomes

Track match results for team and racket sports.

#### Match Outcomes

| Outcome | Description |
|---------|-------------|
| WIN | Won the match |
| LOSS | Lost the match |
| DRAW | Match ended in draw |
| DNF | Did not finish |
| PARTICIPATION | Just participated, no result |

#### Activity Fields
- `matchOutcome`: WIN/LOSS/DRAW/DNF/PARTICIPATION
- `opponentName`: Name of opponent
- `matchScore`: Score string (e.g., "3-2", "21-18, 19-21, 21-15")

### 2.8 Vanity Metrics

Sport-specific "brag factor" metrics stored on each activity.

#### By Sport Category

| Category | Metrics |
|----------|---------|
| Water Sports | maxJumpHeightMeters, totalAirtimeSeconds, longestRideSeconds, waveCount, sessionRating |
| Winter Sports | verticalDescentMeters |
| Cycling | avgPowerWatts, normalizedPowerWatts, maxPowerWatts |
| Running | best5kPaceSeconds, best10kPaceSeconds |
| Climbing | climbingGrade, routesCompleted |
| Strength | tonnageKg |

### 2.9 Home Dashboard Unification

`lib/home/getHomeData.ts` provides unified data fetching for the home dashboard:

- User profile and stats
- Active competitions (rivalries, gauntlets)
- Season progress
- Recent moments
- Verification status
- Recovery mode status
- Consistency league standing
- Persona-based section emphasis

---

## 3. Technology Stack

### Framework & Runtime

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.1 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |

### Authentication

| Component | Technology |
|-----------|------------|
| Auth Library | NextAuth.js 4.24.13 |
| Strategy | JWT with session management |
| Providers | Google, Facebook, Apple, Credentials |

### Database

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| ORM | Prisma 6.19.0 |
| Hosting | Supabase |

### Key Libraries

```
Radix UI          - Accessible component primitives
Framer Motion     - Animations
React Hook Form   - Form handling
Zod               - Schema validation
TanStack Virtual  - List virtualization
Recharts          - Data visualization
Date-fns          - Date utilities
Zustand           - State management
Supabase.js       - Storage & integrations
web-push          - Push notifications
bcryptjs          - Password hashing
```

---

## 4. Architecture Overview

### Directory Structure

```
/app                    # Next.js App Router pages
  /api                  # API routes (70+ endpoints)
    /me                 # Current user endpoints
      /verification     # V11: Verification ladder
      /recovery         # V11: Recovery mode
      /moments          # V11: Moments
      /resume-card      # V11: Resume card
      /ribbon           # Stats ribbon
    /gauntlet           # 1v1 challenges
    /season             # Monthly competitions
    /rankings           # Leaderboards
    /cron               # Scheduled jobs
    ...
  /home                 # Dashboard
  /profile              # User profiles
  /gauntlets            # Gauntlet pages
  /seasons              # Season pages
  /rankings             # Ranking pages
  ...

/components             # React components
  /ui                   # Base UI primitives
  /onboarding           # Onboarding wizard
    /steps              # V11: Step0Persona
  /competition          # V11: RecoveryModeCard
  /hero                 # Profile heroes
  /home                 # Dashboard components
  /rankings             # Ranking displays
  ...

/lib                    # Core business logic
  /verification         # V11: Verification ladder
  /moments              # V11: Moments detection
  /share                # V11: Resume card
  /rivalry              # V11: Spectator system
  /home                 # V11: Home data fetcher
  /metrics              # V11: Consistency score
  /competition          # Recovery mode
  /gauntlet.ts          # Gauntlet system
  /season.ts            # Season management
  /power.ts             # Power calculations
  ...

/prisma                 # Database schema
  /schema.prisma        # Full data model (~2800 lines)
```

### Request Flow

```
User Request
    │
    ▼
┌─────────────────┐
│  Next.js Edge   │  (Middleware: auth, redirects)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌────────────┐
│ Pages │ │ API Routes │
└───┬───┘ └──────┬─────┘
    │            │
    ▼            ▼
┌──────────────────────┐
│    Lib Modules       │  (Business logic)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Prisma Client      │  (Database access)
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

---

## 5. Core Data Models

### User

```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  username            String    @unique
  displayName         String
  avatarUrl           String?
  coverPhotoUrl       String?
  bio                 String?

  // V11: Persona
  persona             UserPersona?  // COMPETITOR, TRACKER, SOCIAL

  // Location
  city                String?
  country             String?
  countryCode         String?
  cityId              String?

  // State
  onboardingCompleted Boolean   @default(false)
  primarySportId      String?

  // Relationships
  activities          Activity[]
  stats               UserStats?
  streak              UserStreak?
  moments             Moment[]      // V11
  // ... many more
}
```

### UserStats

```prisma
model UserStats {
  userId              String    @unique

  // Core metrics
  totalDistance       Float     @default(0)
  totalActivities     Int       @default(0)
  sportIndex          Int       @default(0)
  globalRank          Int?

  // V11: MultiSport Index
  multisportIndex     Int       @default(0)
  eligibleSportsCount Int       @default(0)

  // V11: Trust & Verification
  trustScore          Float     @default(1.0)
  verificationTier    VerificationTier @default(BRONZE)
  isVerifiedAthlete   Boolean   @default(false)
}
```

### UserStreak

```prisma
model UserStreak {
  userId              String    @unique

  // Streak tracking
  currentStreak       Int       @default(0)
  longestStreak       Int       @default(0)
  lastActivityAt      DateTime?

  // Weekly goals
  weeklyGoal          Int       @default(3)
  weeklyProgress      Int       @default(0)

  // V11: Consistency League
  consistencyScore    Int       @default(0)
  consistencyRank     Int?
  consistencyTier     ConsistencyTier @default(STARTER)
  perfectWeeks        Int       @default(0)
  perfectMonths       Int       @default(0)
}
```

### Activity

```prisma
model Activity {
  id                  String    @id @default(cuid())
  userId              String
  disciplineId        String

  // Core fields
  title               String
  activityDate        DateTime
  durationSeconds     Int?
  distanceMeters      Float?

  // V11: Verification
  verificationTier    VerificationTier @default(BRONZE)
  proofLevel          ProofLevel       @default(MANUAL)
  proofUrl            String?

  // V11: Team Sports
  matchOutcome        MatchOutcome?
  opponentName        String?
  matchScore          String?

  // V11: Vanity Metrics
  maxJumpHeightMeters     Float?
  totalAirtimeSeconds     Int?
  verticalDescentMeters   Float?
  avgPowerWatts           Float?
  best5kPaceSeconds       Float?
  climbingGrade           String?
  tonnageKg               Float?
  // ... more sport-specific fields

  // Power system
  power               Float?
  powerMultiplier     Float?    @default(1.0)
  isRace              Boolean   @default(false)
  rpe                 Int?

  moments             Moment[]  // V11
}
```

### Moment (V11)

```prisma
model Moment {
  id              String      @id @default(cuid())
  userId          String
  type            MomentType  // PERSONAL_RECORD, STREAK_MILESTONE, etc.
  title           String
  description     String?

  // Related entities
  activityId      String?
  rivalryId       String?
  gauntletId      String?
  badgeId         String?

  // Values
  value           Float?
  previousValue   Float?
  unit            String?

  // State
  dismissed       Boolean     @default(false)
  sharedAt        DateTime?

  createdAt       DateTime    @default(now())
}
```

### V11 Enums

```prisma
enum UserPersona {
  COMPETITOR  // Focused on rankings and competition
  TRACKER     // Just want to log activities
  SOCIAL      // Want to connect with friends
}

enum ConsistencyTier {
  STARTER     // 0-99
  REGULAR     // 100-299
  DEDICATED   // 300-499
  COMMITTED   // 500-749
  ELITE       // 750-899
  LEGENDARY   // 900+
}

enum MomentType {
  PERSONAL_RECORD
  STREAK_MILESTONE
  ACTIVITY_MILESTONE
  RANK_UP
  RIVALRY_WIN
  GAUNTLET_WIN
  SEASON_PLACEMENT
  BADGE_EARNED
  FIRST_ACTIVITY
  BIG_ACTIVITY
}

enum MatchOutcome {
  WIN
  LOSS
  DRAW
  DNF
  PARTICIPATION
}

enum ProofLevel {
  MANUAL
  PHOTO
  GPX
  SENSOR
  VERIFIED
}

enum VerificationTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}
```

---

## 6. Competitive Systems

### Gauntlets (1v1 Challenges)

Head-to-head Power-based competitions between two users.

**Duration Options:**
- ONE_DAY (24 hours)
- THREE_DAYS (72 hours)
- ONE_WEEK (168 hours)

**Lifecycle:**
```
PENDING ──► ACTIVE ──► COMPLETED
    │                      │
    ├──► DECLINED          ├──► Winner determined
    │                      └──► Tie possible
    └──► EXPIRED (48h)
```

### Rivalries

Multi-user competitions with flexible metrics and timeframes.

**Modes:**
- VOLUME: Aggregate metrics (total distance, duration, sessions)
- BENCHMARK: Specific benchmark comparison

**V11 Enhancement:** Public rivalries can be spectated with head-to-head history and live commentary.

### Rank Battles

Automated weekly matchmaking based on ranking proximity.

- Every Monday at 5 AM UTC
- Matched with nearby-ranked opponents
- Week-long Power competition
- Automatic winner determination on Sunday

### Crew Wars (Team Battles)

Team vs Team Power competitions.

**Duration Options:**
- ONE_WEEK, TWO_WEEKS, ONE_MONTH

### Season Mode

Monthly global competitions with auto-enrollment.

- Auto-create each month
- Users auto-enroll on first activity
- Global, Country, and City rankings
- End-of-month awards

---

## 7. Ranking & Scoring

### Ranking Dimensions

| Dimension | Description |
|-----------|-------------|
| SPORT_INDEX | Composite 0-1000 score per sport |
| FITNESS_SCORE | Universal activity-based metric |
| BENCHMARK | Specific performance (5K, FTP) |
| ELO_RATING | Match-based rating |

### Ranking Scopes

| Scope | Description |
|-------|-------------|
| GLOBAL | All users worldwide |
| COUNTRY | Within user's country |
| CITY | Within user's city |
| FRIENDS | Among followed users |
| TEAM | Within team |

### V11: MultiSport Index

Composite score across multiple sports using Podium Points method:
- Top 3 sports weighted by activity count
- Minimum 5 activities per sport to qualify
- 0-1000 scale like Sport Index

### V11: Trust Score

Manual entry weighting based on verification status:
- BRONZE: 0.5x trust multiplier
- SILVER: 0.75x trust multiplier
- GOLD/PLATINUM: 1.0x trust multiplier

---

## 8. Power System

### The Formula

```
Power = Duration (minutes) × Power Multiplier × Intensity Factor
```

### Intensity Factors (RPE-based)

| RPE Range | Category | Multiplier |
|-----------|----------|------------|
| 1-4 | Easy | 1.0x |
| 5-7 | Moderate | 1.5x |
| 8-10 | Hard | 2.0x |
| Race | Competition | 3.0x |

### Usage

Power is used for:
- Gauntlet scoring
- Crew War scoring
- Season rankings
- Rank Battle scoring

---

## 9. Gamification

### Badges

**Categories:**
- DISTANCE: Mileage milestones
- CONSISTENCY: Streak achievements
- PERFORMANCE: Personal records
- SOCIAL: Follower counts
- CHALLENGE: Challenge completions
- SPECIAL: Events, limited editions

**Rarity Levels:**
- COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

### Streaks

- Daily streak tracking
- Longest streak record
- Weekly goal system
- V11: Consistency League integration

### V11: Moments

Auto-detected achievements that can be shared:
- Personal records
- Streak milestones
- Rank improvements
- Competition wins

---

## 10. Social Features

### Follow System

- Directional following
- Follower/following counts
- Friends = mutual follows

### Posts & Feed

**Post Types:**
- ACTIVITY, STATUS, PHOTO, ACHIEVEMENT, MILESTONE

### Discovery

**Suggested Athletes Algorithm:**
```typescript
Score = LocationMatch * 30 +
        SportMatch * 25 +
        LevelSimilarity * 20 +
        MutualFollows * 15 +
        Recency * 10
```

### V11: Persona-Based Experience

Home dashboard sections are reordered based on user persona:
- COMPETITOR: Rankings, Rivalries, Gauntlets first
- TRACKER: Stats, Streak, Progress first
- SOCIAL: Feed, Friends, Teams first

---

## 11. Integrations

### Strava

- OAuth authorization
- Webhook-driven real-time sync
- Historical backfill
- Automatic activity import

### Apple Health / Garmin

- OAuth connection
- Activity/workout sync

### File Import

- .fit, .gpx, .tcx parsing
- Upload to Supabase storage

---

## 12. API Reference

### V11 New Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/me/verification` | GET | Get verification ladder status |
| `/api/me/verification` | POST | Request tier upgrade |
| `/api/me/recovery` | GET | Get recovery mode status |
| `/api/me/recovery` | POST | Activate recovery mode |
| `/api/me/recovery` | DELETE | Deactivate recovery mode |
| `/api/me/moments` | GET | Get user moments |
| `/api/me/moments/:id` | POST | Dismiss/share moment |
| `/api/me/resume-card` | GET | Generate resume card data |

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/me/profile` | GET | Current user profile |
| `/api/me/ribbon` | GET | Stats ribbon data |
| `/api/activities` | GET/POST | List/create activities |
| `/api/gauntlet` | GET/POST | Gauntlets |
| `/api/season` | GET | Seasons |
| `/api/rankings/leaderboard` | GET | Leaderboard data |

### Cron Jobs

| Endpoint | Schedule | Description |
|----------|----------|-------------|
| `/api/cron/season` | Daily | Season processing |
| `/api/cron/gauntlet` | Every 15min | Gauntlet finalization |
| `/api/cron/rank-battles` | Monday 5 AM | Rank battle matching |
| `/api/cron/recalculate-rankings` | Every 6 hours | Ranking recalculation |

---

## 13. App Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/register` | Registration page |

### Authenticated Routes

| Route | Description |
|-------|-------------|
| `/home` | Dashboard |
| `/profile/:username` | User profile |
| `/activity/create` | Log activity |
| `/gauntlets` | Gauntlet list |
| `/gauntlets/new` | Create gauntlet |
| `/seasons` | Season list |
| `/rankings` | Leaderboards |
| `/settings` | Settings hub |

---

## 14. Component Architecture

### V11 New Components

```
/components
├── onboarding/
│   └── steps/
│       └── Step0Persona.tsx    # Persona selection
├── competition/
│   └── RecoveryModeCard.tsx    # Recovery mode UI
└── ui/
    └── proof-badge.tsx         # Verification badges
```

### Hero Banner

The home hero banner features:
- Large profile picture (96px → 144px responsive)
- Rounded square avatar with ring styling
- Sport pill badge
- Name/username display
- Location and join date
- Stats ribbon dock

---

## 15. Library Modules

### V11 New Modules

| Module | Purpose |
|--------|---------|
| `lib/verification/ladder.ts` | Verification tier progression |
| `lib/moments/detect.ts` | Auto-detect achievements |
| `lib/share/resumeCard.ts` | Generate share cards |
| `lib/rivalry/spectator.ts` | Public rivalry spectating |
| `lib/home/getHomeData.ts` | Unified home data fetching |
| `lib/metrics/consistencyScore.ts` | Consistency league scoring |

### Core Modules

| Module | Purpose |
|--------|---------|
| `lib/gauntlet.ts` | Gauntlet system |
| `lib/season.ts` | Season management |
| `lib/power.ts` | Power calculations |
| `lib/rankings.ts` | Ranking logic |
| `lib/head-to-head.ts` | Rivalry records |
| `lib/notifications.ts` | Notification system |

---

## 16. Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Build Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run lint          # ESLint check
npm run typecheck     # TypeScript check
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema changes
```

---

## 17. Testing

### Test Suites

| Suite | Purpose |
|-------|---------|
| atlas | Primary E2E tests |
| api | API endpoint tests |
| accessibility | a11y with axe-core |
| visual | Screenshot comparisons |

### Commands

```bash
npm run test              # All tests
npm run test:ui           # Interactive UI
npm run test:headed       # Browser visible
```

---

## 18. Unique Innovations

### V11: Verification Ladder

**Problem:** How to build trust for manual entries over time?

**Solution:** Progressive verification system.
- Start at Bronze, earn higher tiers through consistent verified activities
- Trust multiplier affects ranking weight
- Visual badges show verification status

### V11: Persona-Based UX

**Problem:** Different users want different experiences.

**Solution:** Persona selection during onboarding.
- Competitors see rankings first
- Trackers see stats first
- Social users see feed first

### V11: Automatic Moments

**Problem:** Users don't know when they've achieved something notable.

**Solution:** Auto-detect and surface achievements.
- PRs, streaks, milestones auto-detected
- Beautiful shareable moment cards
- Feed integration for social sharing

### V11: Consistency League

**Problem:** Activity count doesn't show dedication.

**Solution:** Consistency scoring with tiers.
- Rewards regular activity patterns
- Perfect week/month bonuses
- Recovery mode for life events

### Power System

**Problem:** How to fairly compare effort across different sports?

**Solution:** Duration-based Power with intensity multipliers.
- Works across all sports
- RPE makes it honest
- Race multiplier rewards competition

### Head-to-Head Persistence

**Problem:** Competition history is lost after each event.

**Solution:** Permanent head-to-head records.
- All-time win/loss/tie tracking
- Streak tracking
- Creates ongoing rivalry narratives

---

## Appendix A: V11 Schema Additions

```prisma
// New Enums
enum UserPersona { COMPETITOR, TRACKER, SOCIAL }
enum ConsistencyTier { STARTER, REGULAR, DEDICATED, COMMITTED, ELITE, LEGENDARY }
enum MomentType { PERSONAL_RECORD, STREAK_MILESTONE, ... }
enum MatchOutcome { WIN, LOSS, DRAW, DNF, PARTICIPATION }
enum ProofLevel { MANUAL, PHOTO, GPX, SENSOR, VERIFIED }

// New Models
model Moment { ... }

// New Fields
User.persona
UserStats.verificationTier
UserStreak.consistencyScore, consistencyTier, perfectWeeks, perfectMonths
Activity.proofLevel, proofUrl, matchOutcome, opponentName, matchScore
Activity.[vanity metrics]
```

---

## Appendix B: V11 API Changes

### New Endpoints
- GET/POST `/api/me/verification`
- GET/POST/DELETE `/api/me/recovery`
- GET `/api/me/moments`
- POST `/api/me/moments/:id`
- GET `/api/me/resume-card`

### Updated Endpoints
- GET `/api/me/ribbon` - Now includes vanity metrics
- POST `/api/activities` - Accepts new V11 fields

---

*Documentation Version: 11.0*
*Last Updated: January 2026*
*EverGo - Transform Your Workouts Into Competition*
