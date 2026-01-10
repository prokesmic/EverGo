# EVERGO V10 - Comprehensive Documentation

> **EverGo** is a next-generation fitness competition platform that transforms solo workouts into engaging social competitions. Built with Next.js 16, React 19, and PostgreSQL, it combines activity tracking, multi-dimensional rankings, and gamification into a cohesive athletic social network.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Data Models](#3-core-data-models)
4. [Feature Set](#4-feature-set)
5. [Competitive Systems](#5-competitive-systems)
6. [Ranking & Scoring](#6-ranking--scoring)
7. [Power System](#7-power-system)
8. [Gamification](#8-gamification)
9. [Social Features](#9-social-features)
10. [Integrations](#10-integrations)
11. [API Reference](#11-api-reference)
12. [App Routes](#12-app-routes)
13. [Component Architecture](#13-component-architecture)
14. [Library Modules](#14-library-modules)
15. [Configuration](#15-configuration)
16. [Deployment](#16-deployment)
17. [Testing](#17-testing)
18. [Unique Innovations](#18-unique-innovations)

---

## 1. Technology Stack

### Framework & Runtime
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js (App Router) | 16.0.7 |
| UI Library | React | 19.2.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| CSS Processing | PostCSS | - |

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
| ORM | Prisma 6.0.0 |
| Schema Version | V6 |

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

### Testing & Quality
| Tool | Purpose |
|------|---------|
| Playwright | E2E & visual testing |
| axe-core | Accessibility testing |
| ESLint | Code quality |

---

## 2. Architecture Overview

### Directory Structure
```
/app                    # Next.js App Router pages
  /api                  # API routes
  /home                 # Dashboard
  /profile              # User profiles
  /gauntlets            # 1v1 challenges
  /seasons              # Monthly competitions
  /rankings             # Leaderboards
  /teams                # Team management
  ...

/components             # React components
  /ui                   # Base UI primitives
  /gauntlet             # Gauntlet UI
  /rankings             # Ranking displays
  /feed                 # Activity feed
  /hero                 # Profile heroes
  ...

/lib                    # Core business logic
  /gauntlet.ts          # Gauntlet system
  /season.ts            # Season management
  /power.ts             # Power calculations
  /rankings.ts          # Ranking logic
  ...

/prisma                 # Database schema
  /schema.prisma        # Full data model

/public                 # Static assets
/tests                  # E2E test suites
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

## 3. Core Data Models

### User Ecosystem

#### User
The central entity connecting all features:
```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  username            String?   @unique
  displayName         String?
  avatarUrl           String?
  coverPhotoUrl       String?
  bio                 String?

  // Location
  city                String?
  country             String?
  cityId              String?   // Normalized geo-data

  // Personal
  dateOfBirth         DateTime?
  gender              Gender?
  privacyLevel        PrivacyLevel @default(PUBLIC)

  // State
  onboardingCompleted Boolean   @default(false)
  primarySportId      String?

  // Relationships
  activities          Activity[]
  sports              UserSport[]
  posts               Post[]
  followers           Follow[]  @relation("Following")
  following           Follow[]  @relation("Followers")
  teams               TeamMember[]
  badges              UserBadge[]
  notifications       Notification[]
  // ... many more
}
```

#### User Relationships
```
User ─┬─► Follow (directional following)
      ├─► FriendRequest (pending friend requests)
      ├─► TeamMember (team membership with roles)
      ├─► UserSport (sport preferences)
      └─► UserStats (aggregated statistics)
```

### Sports & Disciplines

#### Sport
```prisma
model Sport {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  icon          String?
  category      SportCategory
  isGpsTracked  Boolean       @default(false)
  metDefault    Float?        // For fitness scoring
  isDeprecated  Boolean       @default(false)
  aliasForId    String?       // Sport consolidation

  disciplines   Discipline[]
  activities    Activity[]
  userSports    UserSport[]
}
```

**Sport Categories:**
- ENDURANCE (Running, Cycling, Swimming)
- CYCLING (Road, MTB, Gravel)
- SWIMMING (Pool, Open Water)
- STRENGTH (Gym, CrossFit)
- TEAM (Football, Basketball)
- RACKET (Tennis, Badminton)
- COMBAT (Boxing, MMA)
- WATER_BOARD (Surfing, Kiteboarding)
- OUTDOOR (Hiking, Climbing)
- WINTER (Skiing, Snowboarding)
- MINDBODY (Yoga, Pilates)
- GENERIC (Other)

#### Discipline
```prisma
model Discipline {
  id              String            @id @default(cuid())
  name            String
  slug            String
  sportId         String
  sport           Sport             @relation(...)

  // Ranking configuration
  rankingKind     RankingKind       // FITNESS_SCORE, SPORT_INDEX, BENCHMARK, ELO_RATING
  fairnessBadge   FairnessBadge     // STANDARD, NORMALIZED, SEGMENT, RATING
  verificationBadge VerificationBadge // VERIFIED, MIXED, MANUAL
  measurementType MeasurementType   // TIME_SECONDS, POWER_WKG, etc.
  scoringKind     ScoringKind       // PB_BEST, PERIOD_BEST, PERIOD_SUM

  // Verification tiers per scope
  verifyGlobal    VerificationTier  @default(ANY)
  verifyCountry   VerificationTier  @default(ANY)
  verifyCity      VerificationTier  @default(ANY)
  verifyTeam      VerificationTier  @default(ANY)
}
```

### Activity

```prisma
model Activity {
  id                String    @id @default(cuid())
  userId            String
  sportId           String
  disciplineId      String?

  // Core metrics
  name              String?
  description       String?
  activityDate      DateTime
  durationSeconds   Int?
  distanceMeters    Float?
  elevationGain     Float?
  caloriesBurned    Int?

  // Heart rate
  avgHeartRate      Int?
  maxHeartRate      Int?

  // Pace/Speed
  avgPace           Float?    // sec/km
  avgSpeed          Float?    // km/h

  // GPS
  gpsRoute          Json?
  startLocation     String?
  mapImageUrl       String?

  // Media
  photos            Json?     // Array of URLs

  // Source tracking
  source            ActivitySource  // MANUAL, STRAVA, GARMIN, etc.
  externalId        String?
  raw               Json?     // Original import data

  // Power system
  power             Float     @default(0)
  powerMultiplier   Float     @default(1.0)
  isRace            Boolean   @default(false)  // 3x multiplier
  rpe               Int?      // Rate of Perceived Exertion (1-10)

  // Visibility
  visibility        Visibility @default(PUBLIC)

  // Anti-cheat
  verificationTier  VerificationTier @default(BRONZE)
  anomalyScore      Float?
  isAnomalous       Boolean   @default(false)

  // Tagging
  tags              String[]  // ["race", "tempo", "long_run", etc.]
}
```

**Activity Sources:**
- MANUAL - User entered
- STRAVA - Strava import
- GARMIN - Garmin Connect
- APPLE_HEALTH - Apple Health
- GOOGLE_FIT - Google Fit
- UPLOAD - File upload (.fit, .gpx, .tcx)

### Competitive Models

#### Gauntlet (1v1 Challenges)
```prisma
model Gauntlet {
  id              String          @id @default(cuid())
  challengerId    String
  opponentId      String
  challenger      User            @relation("ChallengerGauntlets", ...)
  opponent        User            @relation("OpponentGauntlets", ...)

  duration        GauntletDuration  // ONE_DAY, THREE_DAYS, ONE_WEEK
  status          GauntletStatus    // PENDING, ACTIVE, COMPLETED, etc.
  message         String?           // Trash talk

  challengerPower Float           @default(0)
  opponentPower   Float           @default(0)

  startedAt       DateTime?
  endsAt          DateTime?
  winnerId        String?
}
```

#### Season (Monthly Competitions)
```prisma
model Season {
  id              String        @id @default(cuid())
  name            String        // "January 2025"
  startDate       DateTime
  endDate         DateTime
  status          SeasonStatus  // UPCOMING, ACTIVE, COMPLETED
  badgeIcon       String?       // snowflake, flower, sun, leaf
  badgeColor      String?       // Hex color

  participants    SeasonParticipant[]
}

model SeasonParticipant {
  id              String    @id @default(cuid())
  seasonId        String
  userId          String

  totalPower      Float     @default(0)
  activityCount   Int       @default(0)
  rank            Int?
  previousRank    Int?

  // Regional rankings
  country         String?
  city            String?

  badgesEarned    String[]  // Season badges
}
```

#### Rivalry
```prisma
model Rivalry {
  id              String        @id @default(cuid())
  createdByUserId String

  mode            RivalryMode   // VOLUME, BENCHMARK
  metric          RivalryMetric // DISTANCE, DURATION, SESSIONS, TIME, REPS, SCORE
  sportId         String?
  disciplineId    String?

  windowStart     DateTime
  windowEnd       DateTime
  visibility      Visibility    // PUBLIC, FRIENDS, PRIVATE

  status          RivalryStatus // PENDING, ACTIVE, COMPLETED
  leaderUserId    String?

  participants    RivalryParticipant[]
}
```

#### Crew War (Team Battles)
```prisma
model CrewWar {
  id                    String          @id @default(cuid())
  challengerTeamId      String
  opponentTeamId        String

  duration              CrewWarDuration // ONE_WEEK, TWO_WEEKS, ONE_MONTH
  status                CrewWarStatus

  challengerPower       Float           @default(0)
  opponentPower         Float           @default(0)
  challengerParticipants Int            @default(0)
  opponentParticipants   Int            @default(0)

  winnerTeamId          String?
}
```

#### Head-to-Head Record
```prisma
model HeadToHeadRecord {
  id              String    @id @default(cuid())
  user1Id         String    // Lexically smaller ID
  user2Id         String    // Lexically larger ID

  user1Wins       Int       @default(0)
  user2Wins       Int       @default(0)
  ties            Int       @default(0)
  totalMatches    Int       @default(0)

  user1TotalPower Float     @default(0)
  user2TotalPower Float     @default(0)

  currentStreak   Int       @default(0)  // +ve = user1, -ve = user2
  user1BestStreak Int       @default(0)
  user2BestStreak Int       @default(0)

  lastMatchDate   DateTime?
  lastMatchType   String?   // "gauntlet", "rivalry", "rank_battle"
  lastWinner      String?
}
```

### Rankings

```prisma
model Ranking {
  id            String        @id @default(cuid())
  userId        String
  disciplineId  String

  scope         RankingScope  // GLOBAL, COUNTRY, CITY, FRIENDS, TEAM
  period        RankingPeriod // ALL_TIME, YEARLY, MONTHLY, WEEKLY

  position      Int
  percentile    Float?
  calculatedAt  DateTime      @default(now())
}

model RankingCache {
  id            String        @id @default(cuid())
  dimension     String        // SPORT_INDEX, FITNESS_SCORE, BENCHMARK, ELO_RATING
  scope         String        // global, country:US, city:NYC
  period        String        // all_time, monthly, weekly

  entries       Json          // Top 100 cached entries
  total         Int
  updatedAt     DateTime      @default(now())
}
```

### Social

```prisma
model Post {
  id            String    @id @default(cuid())
  userId        String
  type          PostType  // ACTIVITY, STATUS, PHOTO, ACHIEVEMENT, MILESTONE
  content       String?
  photos        String[]
  activityId    String?   @unique

  likesCount    Int       @default(0)
  commentsCount Int       @default(0)
  visibility    Visibility

  likes         Like[]
  comments      Comment[]
}

model Follow {
  id          String    @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime  @default(now())

  @@unique([followerId, followingId])
}
```

### Teams

```prisma
model Team {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  logoUrl       String?
  coverPhotoUrl String?

  sportId       String?
  type          TeamType  @default(CLUB)
  city          String?
  country       String?

  isPublic      Boolean   @default(true)
  isVerified    Boolean   @default(false)

  // Stats
  memberCount     Int     @default(0)
  totalDistance   Float   @default(0)
  totalActivities Int     @default(0)
  avgSportIndex   Float   @default(0)

  members       TeamMember[]
}

model TeamMember {
  id        String      @id @default(cuid())
  teamId    String
  userId    String
  role      TeamRole    // MEMBER, CAPTAIN, ADMIN
  position  String?
  number    Int?
  joinedAt  DateTime    @default(now())

  @@unique([teamId, userId])
}
```

### Gamification

```prisma
model Badge {
  id          String        @id @default(cuid())
  name        String        @unique
  description String
  iconUrl     String?
  color       String?

  category    BadgeCategory // DISTANCE, CONSISTENCY, PERFORMANCE, SOCIAL, CHALLENGE, SPECIAL
  criteria    BadgeCriteria // TOTAL_DISTANCE, STREAK_DAYS, etc.
  rarity      BadgeRarity   // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

  threshold   Float?        // Value to earn badge
}

model UserBadge {
  id        String    @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime  @default(now())
  isPinned  Boolean   @default(false)  // Max 3 pinned

  @@unique([userId, badgeId])
}

model UserStreak {
  id              String    @id @default(cuid())
  userId          String    @unique
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  weeklyGoal      Int       @default(3)
  weeklyProgress  Int       @default(0)
  lastActivityAt  DateTime?
}
```

### Notifications

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?            // Related IDs, metadata

  isRead    Boolean          @default(false)
  readAt    DateTime?
  isPushed  Boolean          @default(false)

  createdAt DateTime         @default(now())
}

enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  MENTION
  RANK_UP
  RANK_DOWN
  STREAK_MILESTONE
  STREAK_WARNING
  STREAK_BROKEN
  CHALLENGE_JOINED
  CHALLENGE_COMPLETED
  BADGE_EARNED
  TEAM_INVITE
  TEAM_JOINED
  TEAM_REMOVED
  RANK_BATTLE_STARTED
  RANK_BATTLE_ENDED
  GAUNTLET_RECEIVED
  GAUNTLET_ACCEPTED
  GAUNTLET_DECLINED
  GAUNTLET_STARTED
  GAUNTLET_WON
  GAUNTLET_LOST
  ALMOST_RANK_UP
  ALMOST_GOAL
  ALMOST_PB
  WEEKLY_SUMMARY
}
```

### Integrations

```prisma
model StravaConnection {
  id              String    @id @default(cuid())
visera userId          String    @unique
  athleteId       BigInt    @unique
  accessToken     String
  refreshTokenEnc String    // Encrypted
  scope           String

  lastSyncAt      DateTime?
  lastBackfillAt  DateTime?
  lastWebhookAt   DateTime?
  isActive        Boolean   @default(true)
}

model ActivityImport {
  id          String        @id @default(cuid())
  userId      String
  fileName    String
  fileType    String        // .fit, .gpx, .tcx
  storagePath String        // Supabase path

  status      ImportStatus  // PENDING, PARSING, PARSED, FAILED
  summary     Json?         // Parsed metrics
  activityId  String?       // Created activity

  createdAt   DateTime      @default(now())
}
```

---

## 4. Feature Set

### Authentication & Onboarding
- Multi-provider OAuth (Google, Facebook, Apple)
- Email/password registration with bcrypt hashing
- Session management via NextAuth JWT
- Onboarding flow with sport selection
- Profile completion wizard (avatar, bio, location)

### Activity Management
- **Manual Logging**: Full metrics entry (duration, distance, elevation, heart rate)
- **GPS Tracking**: Live tracking with route recording
- **Media Support**: Photos, map images, thumbnails
- **Import Sources**: Strava, Garmin, Apple Health, Google Fit
- **File Upload**: .fit, .gpx, .tcx parsing
- **Visibility Control**: PUBLIC, FOLLOWERS, PRIVATE
- **Tagging**: Flexible tags (race, tempo, long_run, intervals, etc.)
- **RPE Tracking**: Rate of Perceived Exertion (1-10) for power calculation
- **Gear Tracking**: Link activities to equipment (shoes, bikes, watches)

### Profile & Discovery
- Customizable profile (avatar, cover photo, bio)
- Sport badges and verified athlete status
- Activity calendar view
- Personal records showcase
- Head-to-head records with rivals
- Suggested athletes based on similarity scoring

### Feed System
- Activity-based social feed
- Highlight scoring for notable achievements
- Feed item types:
  - Personal best
  - Rank changes
  - Rivalry swings
  - Team wins
  - Notable activities
  - New follows
  - Badge earned
  - Streak milestones
- Engagement: likes, comments
- Visibility filtering

---

## 5. Competitive Systems

### Gauntlets (User 1v1 Challenges)

**What it is**: Head-to-head Power-based competitions between two users.

**Duration Options**:
- ONE_DAY (24 hours)
- THREE_DAYS (72 hours)
- ONE_WEEK (168 hours)

**Lifecycle**:
```
PENDING ──► ACTIVE ──► COMPLETED
    │                      │
    ├──► DECLINED          ├──► Winner determined
    │                      └──► Tie possible
    └──► EXPIRED (48h)
```

**Features**:
- Invitation with optional trash talk message
- 48-hour expiry for pending invitations
- Power accumulation during challenge window
- Automatic winner determination
- Head-to-head record updates
- Full notification suite

**Scoring**: Total Power accumulated during the gauntlet period.

---

### Rivalries (Flexible Competition)

**What it is**: Multi-user competitions with flexible metrics and timeframes.

**Modes**:
- **VOLUME**: Aggregate metrics (total distance, duration, sessions)
- **BENCHMARK**: Specific benchmark comparison (best 5K time, max reps)

**Metrics**:
- DISTANCE
- DURATION
- SESSIONS
- TIME
- REPS
- SCORE

**Features**:
- Custom time windows
- 2+ participants
- Sport/discipline filtering
- Visibility control (PUBLIC, FRIENDS, PRIVATE)
- Real-time leaderboard updates
- Invitation management

---

### Rank Battles (Weekly Auto-Match)

**What it is**: Automated weekly matchmaking based on ranking proximity.

**How it works**:
1. Every Monday at 5 AM UTC, users are matched with nearby-ranked opponents
2. Scope determined by: city → country → global
3. Week-long Power competition
4. Automatic winner determination on Sunday

**Features**:
- No user action required to enter
- Fair matchmaking (similar skill levels)
- Automatic notifications
- Affects head-to-head records

---

### Crew Wars (Team Battles)

**What it is**: Team vs Team Power competitions.

**Duration Options**:
- ONE_WEEK (7 days)
- TWO_WEEKS (14 days)
- ONE_MONTH (30 days)

**Scoring**: Aggregate Power from all participating team members.

**Features**:
- Team captain initiates challenges
- Invitation acceptance workflow
- Individual contribution tracking
- Team member participation counts
- Winner determination (or tie)

---

### Season Mode (Monthly Competitions)

**What it is**: Monthly global competitions with auto-enrollment.

**How it works**:
1. Seasons auto-create each month (e.g., "January 2025")
2. Users auto-enroll on first activity
3. Power accumulates throughout the month
4. End-of-month finalization with awards

**Scopes**:
- Global rankings
- Country rankings
- City rankings

**Awards**:
- SEASON_CHAMPION (1st place)
- SEASON_PODIUM (Top 3)
- SEASON_TOP_10
- SEASON_TOP_100

**Theming**: Seasonal icons (snowflake, flower, sun, leaf) and colors.

---

## 6. Ranking & Scoring

### Ranking Dimensions

| Dimension | Description |
|-----------|-------------|
| SPORT_INDEX | Composite 0-1000 score per sport |
| FITNESS_SCORE | Universal activity-based metric |
| BENCHMARK | Specific benchmark performance (5K, FTP) |
| ELO_RATING | Match-based rating system |

### Ranking Scopes

| Scope | Description |
|-------|-------------|
| GLOBAL | All users worldwide |
| COUNTRY | Within user's country |
| CITY | Within user's city |
| FRIENDS | Among followed users |
| TEAM | Within team |

### Ranking Periods

| Period | Description |
|--------|-------------|
| ALL_TIME | Career performance |
| YEARLY | Current year |
| MONTHLY | Current month |
| WEEKLY | Current week |

### Benchmark Rankings

Each discipline has configurable:
- **Fairness Badge**: STANDARD, NORMALIZED, SEGMENT, RATING
- **Measurement Type**: TIME_SECONDS, POWER_WKG, HEIGHT_METERS, etc.
- **Scoring Kind**: PB_BEST, PERIOD_BEST, PERIOD_SUM
- **Verification Tier per Scope**: ANY, NON_MANUAL, VERIFIED_ONLY

### Leaderboard Caching

Top 100 entries cached per:
- Dimension (SPORT_INDEX, FITNESS_SCORE, BENCHMARK)
- Scope (global, country:XX, city:XXX)
- Period (all_time, monthly, weekly)

Updated on schedule via cron jobs.

### Personal Ladder

Shows ±2 positions around the user for competitive context.

---

## 7. Power System

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

### Weekly Power Tracking

```prisma
model WeeklyPower {
  userId          String
  weekStart       DateTime  // Monday 00:00 UTC

  totalPower      Float
  easyMinutes     Int
  moderateMinutes Int
  hardMinutes     Int
  raceMinutes     Int
  activityCount   Int
}
```

### Usage

Power is used for:
- Gauntlet scoring
- Crew War scoring
- Season rankings
- Rank Battle scoring
- Overall activity assessment

---

## 8. Gamification

### Badges

**Categories**:
- **DISTANCE**: Mileage milestones (10km, 100km, 1000km)
- **CONSISTENCY**: Streak achievements (7-day, 30-day, 365-day)
- **PERFORMANCE**: Personal records, top rankings
- **SOCIAL**: Follower counts, team memberships
- **CHALLENGE**: Challenge completions
- **SPECIAL**: Events, limited editions

**Rarity Levels**:
- COMMON (easy to earn)
- UNCOMMON
- RARE
- EPIC
- LEGENDARY (very difficult)

**Display**: Up to 3 badges can be pinned to profile.

### Streaks

- **Daily Streak**: Consecutive days with activity
- **Longest Streak**: All-time record
- **Weekly Goal**: Target activities per week (default: 3)
- **Weekly Progress**: Current week's count

**Notifications**:
- STREAK_MILESTONE (7, 30, 100, 365 days)
- STREAK_WARNING (at risk of breaking)
- STREAK_BROKEN (streak reset)

### Challenges

**Types**:
- **GLOBAL**: Open to all users
- **TEAM**: Team-specific
- **COMMUNITY**: Group-based
- **PERSONAL**: Self-set goals

**Targets**:
- DISTANCE
- DURATION
- ACTIVITIES
- CALORIES
- ELEVATION
- STREAK

**Features**:
- Sport-specific filtering
- Leaderboard with rankings
- Progress notifications
- Completion badges
- Sponsor support (logo, rewards)

---

## 9. Social Features

### Follow System

- Directional following (A follows B doesn't mean B follows A)
- Follower/following counts on profile
- Following feed filtering
- Friend suggestions

### Posts & Feed

**Post Types**:
- ACTIVITY (linked to activity)
- STATUS (text update)
- PHOTO (media post)
- ACHIEVEMENT (badge/milestone)
- MILESTONE (personal record)

**Engagement**:
- Likes (with reaction types)
- Comments (nested)
- Share counts

### Discovery

**Suggested Athletes Algorithm**:
```typescript
Score = LocationMatch * 30 +
        SportMatch * 25 +
        LevelSimilarity * 20 +
        MutualFollows * 15 +
        Recency * 10
```

### Notifications

**Categories**:
- Social (likes, comments, follows)
- Rankings (rank changes)
- Streaks (milestones, warnings)
- Challenges (joins, completions)
- Teams (invites, joins)
- Competitions (gauntlets, battles)

**Delivery**:
- In-app notification center
- Push notifications (web-push)
- Weekly digest (optional)
- Quiet hours support

---

## 10. Integrations

### Strava

**Connection Flow**:
1. OAuth authorization
2. Access token + refresh token storage
3. Initial activity backfill
4. Webhook registration for real-time sync

**Sync Methods**:
- Manual sync trigger
- Webhook-driven (real-time)
- Scheduled backfill

### Apple Health

- OAuth-style connection
- Activity/workout sync
- Configurable sync options

### Garmin

- OAuth connection
- Activity import
- Metrics sync

### File Import

**Supported Formats**:
- .fit (Garmin, Wahoo)
- .gpx (GPS Exchange)
- .tcx (Training Center XML)

**Process**:
1. Upload to Supabase storage
2. Parse file (PENDING → PARSING → PARSED)
3. Create activity with extracted metrics
4. Link import record to activity

---

## 11. API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth callbacks |
| `/api/user/password` | POST | Change password |
| `/api/user/delete` | POST | Delete account |

### User Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/me/profile` | GET | Current user profile |
| `/api/user/profile` | POST | Update profile |
| `/api/user/sports` | GET/POST | User sports |
| `/api/user/sports/primary` | POST | Set primary sport |

### Activities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/activities` | GET/POST | List/create activities |
| `/api/activities/:id` | GET/POST | Activity detail |

### Rankings

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rankings/user` | GET | User rankings |
| `/api/rankings/leaderboard` | GET | Leaderboard data |
| `/api/rankings/benchmark` | GET | Benchmark leaderboards |
| `/api/rankings/most-active` | GET | Activity score rankings |
| `/api/rankings/ladder` | GET | Personal ladder |
| `/api/rankings/rival` | GET | Rival comparisons |

### Gauntlets

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gauntlet` | GET/POST | List/create gauntlets |
| `/api/gauntlet/:id` | GET | Gauntlet detail |
| `/api/gauntlet/:id/accept` | POST | Accept gauntlet |
| `/api/gauntlet/:id/decline` | POST | Decline gauntlet |
| `/api/gauntlet/:id/cancel` | POST | Cancel gauntlet |

### Seasons

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/season` | GET/POST | Get seasons / Join season |
| `/api/season/:id` | GET | Season detail |

### Teams

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET/POST | List/create teams |
| `/api/teams/:slug` | GET | Team detail |
| `/api/teams/:slug/join` | POST | Join team |
| `/api/teams/:slug/invite` | POST | Invite member |

### Social

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/posts` | GET/POST | List/create posts |
| `/api/posts/:id/like` | POST | Like post |
| `/api/posts/:id/comments` | POST | Add comment |
| `/api/social/suggestions` | GET | Follow suggestions |

### Integrations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/strava/connect` | GET | Start OAuth |
| `/api/strava/callback` | POST | OAuth callback |
| `/api/strava/sync` | POST | Manual sync |
| `/api/strava/webhook` | POST | Webhook handler |

### Cron Jobs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cron/season` | POST | Season processing |
| `/api/cron/gauntlet` | POST | Gauntlet finalization |
| `/api/cron/crew-wars` | POST | Crew war finalization |
| `/api/cron/rank-battles` | POST | Rank battle finalization |
| `/api/cron/recalculate-rankings` | POST | Ranking recalculation |

---

## 12. App Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/register` | Registration page |
| `/offline` | Offline fallback |

### Authenticated Routes

| Route | Description |
|-------|-------------|
| `/home` | Dashboard |
| `/profile/:username` | User profile |
| `/activity/create` | Log activity |
| `/activity/track` | Live GPS tracking |
| `/activity/:id` | Activity detail |
| `/calendar` | Activity calendar |
| `/challenges` | Challenge browser |
| `/challenges/:id` | Challenge detail |
| `/teams` | Team listing |
| `/teams/:slug` | Team detail |
| `/gauntlets` | Gauntlet list |
| `/gauntlets/new` | Create gauntlet |
| `/gauntlets/:id` | Gauntlet detail |
| `/seasons` | Season list |
| `/seasons/:id` | Season detail |
| `/rivalries` | Rivalry list |
| `/rankings` | Benchmark rankings |
| `/leaderboard` | Overall leaderboards |
| `/notifications` | Notification center |
| `/settings` | Settings hub |
| `/settings/profile` | Edit profile |
| `/settings/account` | Account settings |
| `/settings/sports` | Sport preferences |
| `/feed` | Activity feed |
| `/analytics` | Analytics dashboard |

---

## 13. Component Architecture

### Directory Structure

```
/components
├── ui/                 # Base primitives (Radix-based)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── skeleton.tsx
│   └── ...
├── gauntlet/           # Gauntlet UI
│   ├── GauntletCard.tsx
│   ├── GauntletList.tsx
│   └── CreateGauntlet.tsx
├── season/             # Season UI
│   ├── SeasonCard.tsx
│   └── SeasonLeaderboard.tsx
├── rankings/           # Ranking displays
│   ├── RankLadder.tsx
│   ├── RankCard.tsx
│   └── LeaderboardTable.tsx
├── home/               # Home page sections
│   ├── HomeHeroRibbon.tsx
│   ├── FriendsStrip.tsx
│   ├── ActiveCompetitions.tsx
│   ├── RivalriesStrip.tsx
│   └── QuickActions.tsx
├── hero/               # Profile heroes
│   ├── HeroBanner.tsx
│   └── HomeHeroBanner.tsx
├── feed/               # Activity feed
│   ├── HomeFeed.tsx
│   ├── FeedItem.tsx
│   └── FeedHighlight.tsx
├── activity/           # Activity UI
│   ├── ActivityCard.tsx
│   ├── ActivityForm.tsx
│   └── ActivityMetrics.tsx
├── teams/              # Team management
│   ├── TeamCard.tsx
│   ├── TeamMembers.tsx
│   └── TeamStats.tsx
├── notifications/      # Notifications
│   ├── NotificationCenter.tsx
│   └── NotificationItem.tsx
├── common/             # Shared utilities
│   ├── Avatar.tsx
│   ├── EmptyState.tsx
│   └── LoadingSpinner.tsx
└── layout/             # Layout wrappers
    ├── MainNav.tsx
    ├── MobileNav.tsx
    └── MobileHeader.tsx
```

### Design Patterns

**Server Components**: Data fetching at the page level
```tsx
// app/home/page.tsx
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const data = await fetchData(session.user.id)
  return <HomeClient data={data} />
}
```

**Client Components**: Interactivity with "use client"
```tsx
"use client"

export function GauntletCard({ gauntlet, onAccept }) {
  const [loading, setLoading] = useState(false)
  // ...
}
```

**Form Handling**: React Hook Form + Zod
```tsx
const schema = z.object({
  duration: z.enum(["ONE_DAY", "THREE_DAYS", "ONE_WEEK"]),
  message: z.string().optional(),
})

const form = useForm({ resolver: zodResolver(schema) })
```

**Styling**: Tailwind CSS utilities + cn() helper
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "rounded-xl border p-4",
  isActive && "border-primary bg-primary/5"
)} />
```

---

## 14. Library Modules

### Competitive Systems
| Module | Purpose |
|--------|---------|
| `lib/gauntlet.ts` | Gauntlet CRUD, acceptance, finalization |
| `lib/crew-wars.ts` | Team battle system |
| `lib/rank-battles.ts` | Weekly auto-match battles |
| `lib/season.ts` | Monthly season management |
| `lib/head-to-head.ts` | Persistent rivalry records |
| `lib/rivalry.ts` | Rivalry helpers |

### Ranking & Scoring
| Module | Purpose |
|--------|---------|
| `lib/discipline-rankings.ts` | Benchmark leaderboard calculations |
| `lib/rankings.ts` | Legacy ranking functions |
| `lib/power.ts` | Power calculation system |
| `lib/scoring/strategies.ts` | Ranking computation strategies |
| `lib/scoring/fitness-score.ts` | Activity score calculations |

### Leaderboards
| Module | Purpose |
|--------|---------|
| `lib/leaderboards/index.ts` | Leaderboard queries |
| `lib/leaderboards/getLeaderboard.ts` | Fetch leaderboards |
| `lib/leaderboards/metrics.ts` | Leaderboard metrics |
| `lib/leaderboards/scope.ts` | Scope definitions |

### Gamification
| Module | Purpose |
|--------|---------|
| `lib/gamification.ts` | Streak updates, badge earning |
| `lib/notifications.ts` | Notification creation |
| `lib/targets/index.ts` | Dynamic target system |

### Social & Discovery
| Module | Purpose |
|--------|---------|
| `lib/discover/getSuggestedAthletes.ts` | Athlete suggestions |
| `lib/discover/scoreSuggestedAthlete.ts` | Similarity scoring |

### Sports & Activities
| Module | Purpose |
|--------|---------|
| `lib/sports.ts` | Sport utilities |
| `lib/sports/normalizeSportSlug.ts` | Slug normalization |
| `lib/sports/sportIcons.ts` | Icon mappings |
| `lib/sports/media.ts` | Sport-specific media |

### Data Management
| Module | Purpose |
|--------|---------|
| `lib/import/index.ts` | File import processing |
| `lib/integrations/` | External integrations |
| `lib/location/` | City/country data |

### Utilities
| Module | Purpose |
|--------|---------|
| `lib/utils.ts` | General utilities |
| `lib/api-utils.ts` | API helpers |
| `lib/logger.ts` | Logging |
| `lib/rate-limit.ts` | Rate limiting |
| `lib/flags.ts` | Feature flags |
| `lib/env.ts` | Environment config |

---

## 15. Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db  # Serverless

# NextAuth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
APPLE_ID=...
APPLE_SECRET=...

# Strava Integration
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_WEBHOOK_SECRET=...

# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Stripe
STRIPE_PUBLIC_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Web Push
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### Feature Flags

```typescript
// lib/features.ts
export const features = {
  enableFileUploadImport: true,
  enableProAm: true,
  enableVerifiedAthlete: true,
  enablePercentiles: true,
  enableNextTierGhost: true,
  enableNativeShell: false,
  enableAppleHealth: false,
  enableGarminHealth: false,
  enablePaceBot: true,
  enableCohorts: true,
  enablePrivateLeagues: true,
  enablePerks: true,
  enableDynamicTargets: true,
}
```

### Build Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run build:full    # Build with db push and seed
npm run start         # Production server
npm run lint          # ESLint check
npm run db:seed       # Seed database
npm run db:push       # Push schema changes
```

---

## 16. Deployment

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting, Edge Functions, Cron |
| PostgreSQL | Primary database |
| Supabase | File storage |
| Stripe | Payment processing |

### Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/season", "schedule": "0 0 * * *" },
    { "path": "/api/cron/gauntlet", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/crew-wars", "schedule": "0 * * * *" },
    { "path": "/api/cron/rank-battles", "schedule": "0 5 * * 1" },
    { "path": "/api/cron/recalculate-rankings", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/strava-sync", "schedule": "*/30 * * * *" }
  ]
}
```

### Monitoring

- **Health Check**: `/api/health`
- **Cron Monitoring**: `CronJobRun` table with status, duration, errors
- **Error Tracking**: Vercel built-in
- **Analytics**: Custom `AnalyticsEvent` tracking

---

## 17. Testing

### Test Suites

| Suite | Purpose |
|-------|---------|
| atlas | Primary E2E tests |
| hermes | Secondary E2E tests |
| nyx | Dark mode / edge cases |
| iris | Visual regression |
| kronos | Performance tests |
| api | API endpoint tests |
| accessibility | a11y with axe-core |
| mobile | Mobile device emulation |
| visual | Screenshot comparisons |

### Commands

```bash
npm run test                    # All tests
npm run test:ui                 # Interactive UI
npm run test:headed             # Browser visible
npm run test:debug              # Debug mode
npm run test:chromium           # Specific browser
npm run test:report             # View results
npm run test:update-snapshots   # Update visuals
npm run scenarios:generate      # Generate scenarios
npm run scenarios:run           # Run scenarios
npm run scenarios:smoke         # Smoke tests
```

---

## 18. Unique Innovations

### Power System

**Problem**: How to fairly compare effort across different sports and workout types?

**Solution**: Duration-based Power with intensity multipliers.
- Simple formula everyone understands
- Works across all sports
- RPE makes it self-reported but honest
- Race multiplier rewards competition

### Verification Tiers

**Problem**: How to prevent cheating while allowing manual entry?

**Solution**: Three-tier verification system.
- BRONZE: Manual entry (lowest trust)
- SILVER: Manual with proof (medium trust)
- GOLD: Device import (highest trust)

Leaderboards can require specific tiers per scope.

### Head-to-Head Persistence

**Problem**: Competition history is lost after each event.

**Solution**: Permanent head-to-head records.
- All-time win/loss/tie tracking
- Streak tracking (current and best)
- Power totals
- Last match metadata

Creates ongoing rivalry narratives.

### Auto-Enrollment

**Problem**: Friction in joining competitions.

**Solution**: Auto-enroll on first activity.
- Seasons: First activity joins current season
- Gauntlets: Activities auto-count toward active gauntlets
- No explicit "Join" button needed

### Sport Index Events

**Problem**: Understanding why rankings changed.

**Solution**: Immutable event log.
- Every index change recorded
- Before/after values
- Rank movement
- Cause explanation
- Full audit trail

### Multi-Dimensional Rankings

**Problem**: Single ranking doesn't capture athlete nuances.

**Solution**: Multiple ranking dimensions.
- Sport Index (overall sport skill)
- Fitness Score (activity volume)
- Benchmark (specific achievements)
- ELO Rating (match-based)

Plus 5 scopes and 4 periods for granular views.

### Fairness Badges

**Problem**: Not all benchmarks are equally comparable.

**Solution**: Fairness classification.
- STANDARD: Directly comparable (5K time)
- NORMALIZED: Effort-normalized (running vs cycling)
- SEGMENT: Course-specific (Strava segments)
- RATING: Match-based only (ELO)

Users understand what rankings mean.

---

## Appendix A: Prisma Schema Quick Reference

```prisma
// Core Entities
User, UserStats, UserStreak, UserBadge, UserSport, UserSportStats

// Sports & Activities
Sport, Discipline, Activity, PersonalRecord, ActivityAnomaly, UserGear

// Competitions
Gauntlet, Rivalry, RivalryParticipant, CrewWar
Season, SeasonParticipant, RankBattle, HeadToHeadRecord

// Rankings
Ranking, RankingCache, DisciplineLeaderboardCache
SportIndexSnapshot, SportIndexEvent

// Social
Post, Like, Comment, Follow, FriendRequest

// Teams
Team, TeamMember, TeamJoinRequest, TeamPost

// Gamification
Badge, Challenge, ChallengeParticipant, Target

// Notifications
Notification, NotificationSettings, PushToken

// Integrations
StravaConnection, StravaWebhookEvent
AppleHealthConnection, GarminHealthConnection
ActivityImport

// Monetization
Subscription

// Infrastructure
City, AnalyticsEvent, InviteCode, CronJobRun, BackfillState
```

---

## Appendix B: Notification Types

```typescript
// Social
LIKE, COMMENT, FOLLOW, MENTION

// Rankings
RANK_UP, RANK_DOWN

// Streaks
STREAK_MILESTONE, STREAK_WARNING, STREAK_BROKEN

// Challenges
CHALLENGE_JOINED, CHALLENGE_COMPLETED

// Badges
BADGE_EARNED

// Teams
TEAM_INVITE, TEAM_JOINED, TEAM_REMOVED

// Rank Battles
RANK_BATTLE_STARTED, RANK_BATTLE_ENDED

// Gauntlets
GAUNTLET_RECEIVED, GAUNTLET_ACCEPTED, GAUNTLET_DECLINED
GAUNTLET_STARTED, GAUNTLET_WON, GAUNTLET_LOST

// Crew Wars
CREW_WAR_RECEIVED, CREW_WAR_STARTED, CREW_WAR_ENDED

// Almost There
ALMOST_RANK_UP, ALMOST_GOAL, ALMOST_PB

// Summary
WEEKLY_SUMMARY
```

---

## Appendix C: API Response Formats

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limited
- 500: Server Error

---

*Documentation Version: 10.0*
*Last Updated: January 2025*
*EverGo - Transform Your Workouts Into Competition*
