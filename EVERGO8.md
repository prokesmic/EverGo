# EVERGO8 - Complete Technical Documentation

> **The Global Network for Sports** - Track, Compete, Connect

**Version:** 8.0
**Last Updated:** January 8, 2026
**Based on:** Full codebase analysis (84 API routes, 84 Prisma models, 232 components, 93 library files)

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Schema](#4-database-schema-overview)
5. [Core Features](#5-core-features)
6. [API Routes](#6-api-routes)
7. [Key Models & Relationships](#7-key-models--relationships)
8. [External Integrations](#8-external-integrations)
9. [Mobile Support](#9-mobile-support)
10. [Testing](#10-testing)
11. [Configuration](#11-configuration)
12. [Background Jobs & Cron](#12-background-jobs--cron)
13. [Observability & Logging](#13-observability--logging)
14. [Local Development](#14-local-development)
15. [Deployment](#15-deployment)
16. [Security & Privacy](#16-security--privacy)
17. [Deployment Checklist](#17-deployment-checklist)

---

## 1. APPLICATION OVERVIEW

### What is Evergo?

Evergo is a comprehensive sports tracking and social competition platform built with modern web technologies. It enables athletes to:

- **Track activities** across 50+ sports with manual entry, Strava import, and device sync
- **Compete intelligently** through rankings (global, country, city, friends), benchmarks, and rivalries
- **Gamify participation** with streaks, badges, challenges, and team battles
- **Build community** through teams, communities, social feeds, and partner matching
- **Access training** with guided plans and workout tracking
- **Monetize** through subscriptions and premium features

### Problem Solved

Existing fitness platforms (Strava, Garmin Connect) focus on data import. Evergo adds the competitive social layer:

- Multi-sport unified ranking (Sport Index 0-1000)
- Verification tiers to prevent cheating (BRONZE/SILVER/GOLD)
- Discipline-based leaderboards with fairness badges
- PaceBot AI rivals for solo athletes
- Cohort squads and private leagues

---

## 2. TECHNOLOGY STACK

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | Full-stack React with server components |
| React | 19.2.0 | UI components |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 11.18.2 | Animations |

### Authentication & Security

| Technology | Version | Purpose |
|------------|---------|---------|
| NextAuth.js | 4.24.13 | Multi-provider auth (Credentials, Google, Facebook, Apple) |
| bcryptjs | 3.0.3 | Password hashing |
| JWT tokens | - | Session management |

### Data & ORM

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | - | Database (via Supabase) |
| Prisma | 6.0.0 | Type-safe ORM with 84 models |
| Zod | 4.1.13 | Runtime schema validation |

### UI Components & Interaction

| Technology | Version | Purpose |
|------------|---------|---------|
| Radix UI | Various | Accessible headless UI components |
| Lucide React | - | Icon library (555+ icons) |
| React Hook Form | 7.67.0 | Form management |
| React Dropzone | 14.3.8 | File uploads |
| React Leaflet | 5.0.0 | Maps |

### Charting & Visualization

| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 3.5.1 | Chart components |
| Leaflet | 1.9.4 | Map library |

### State Management

| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.9 | Lightweight state management |

### Notifications & Push

| Technology | Version | Purpose |
|------------|---------|---------|
| Web Push | 3.6.7 | Push notifications |
| Sonner | 2.0.7 | Toast notifications |

### Mobile & Native

| Technology | Purpose |
|------------|---------|
| Capacitor | iOS/Android bridge |
| Status Bar, Splash Screen, Push Notifications | Native plugins |

### Testing & Observability

| Technology | Version | Purpose |
|------------|---------|---------|
| Playwright | 1.57.0 | E2E testing (multi-project, visual regression) |
| @axe-core/playwright | - | Accessibility testing |

### External Integrations

| Service | Purpose |
|---------|---------|
| Supabase | Backend services (PostgreSQL, Storage) |
| Strava API | Activity sync |
| Stripe | Payments |
| Google/Facebook/Apple OAuth | Social login |

---

## 3. ARCHITECTURE OVERVIEW

### Directory Structure

```
/Users/michal/Evergo/
├── app/                          # Next.js App Router (32 directories)
│   ├── api/                      # 84 API endpoints (route handlers)
│   ├── (onboarding)/             # Auth-gated onboarding wizard
│   ├── home/                     # Hero section, dashboard
│   ├── activity/                 # Activity creation/view
│   ├── rankings/                 # Leaderboards, standings
│   ├── rivalries/                # 1v1 competitions
│   ├── teams/                    # Team management
│   ├── challenges/               # Challenge browser
│   ├── training-plans/           # Training program library
│   ├── feed/                     # Social feed
│   ├── notifications/            # Notification center
│   ├── profile/                  # User profiles
│   ├── settings/                 # User settings
│   ├── communities/              # Community groups
│   ├── sports/                   # Sport details
│   ├── login/register/           # Auth pages
│   └── layout.tsx                # Root layout with theme
├── components/                   # 232 React components
│   ├── activity/                 # Activity creation/display
│   ├── feed/                     # Feed item components
│   ├── home/                     # Dashboard components
│   ├── rankings/                 # Ranking displays
│   ├── leaderboards/             # Leaderboard components
│   ├── gamification/             # Badges, streaks, challenges
│   ├── challenges/               # Challenge UI
│   ├── teams/                    # Team components
│   ├── benchmarks/               # Benchmark displays
│   ├── hero/                     # Hero profile sections
│   ├── layout/                   # Navigation, headers
│   └── ui/                       # Base UI components
├── lib/                          # 93 utility/business logic files
│   ├── api-utils.ts              # API response helpers
│   ├── auth.ts                   # NextAuth configuration
│   ├── db.ts                     # Prisma client
│   ├── gamification.ts           # Streak/badge logic
│   ├── monetization.ts           # Subscription features
│   ├── notifications.ts          # Notification creation
│   ├── discipline-rankings.ts    # Activity score calculation
│   ├── rankings/                 # Ranking engines
│   ├── scoring/                  # Fitness score strategies
│   ├── sport-index/              # Sport index calculation
│   ├── integrations/strava/      # Strava sync & webhooks
│   ├── leaderboards/             # Leaderboard caching
│   ├── cron/                     # Background job management
│   ├── pacebot/                  # PaceBot rivalry system
│   ├── leagues/                  # Private leagues
│   ├── targets/                  # Personal targets/goals
│   └── perks/                    # Unlockable perks
├── hooks/                        # React custom hooks
├── e2e/                          # Playwright tests (16 spec files)
│   ├── agents/                   # Agent-based testing (5 agents)
│   ├── pages/                    # Page object models
│   ├── scenarios/                # Reusable test scenarios
│   └── visual.spec.ts            # Visual regression testing
├── prisma/
│   └── schema.prisma             # 84 Prisma models
├── middleware.ts                 # Route auth & onboarding checks
├── next.config.ts                # Next.js image optimization
├── capacitor.config.ts           # Mobile app configuration
├── playwright.config.ts          # E2E testing configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── eslint.config.mjs             # ESLint configuration
```

### Architectural Patterns

1. **Client-Server Model**: Next.js server components with API routes
2. **Authentication Middleware**: JWT-based with NextAuth
3. **ORM Pattern**: Prisma for type-safe database access
4. **API Handler Pattern**: Centralized error handling via `lib/api-utils.ts`
5. **Feature Flags**: Environment-based feature toggles (`lib/flags.ts`)
6. **Verification Tiers**: Multi-level data verification (BRONZE/SILVER/GOLD)
7. **Discipline-Based Ranking**: Separation of sport/fitness metrics
8. **Caching Strategy**: RankingCache, DisciplineLeaderboardCache for performance
9. **Event Sourcing**: SportIndexEvent audit trail
10. **Background Jobs**: Vercel cron + custom job queue (IntegrationJob, BackfillState)

---

## 4. DATABASE SCHEMA OVERVIEW

### Core Models (84 Total)

#### User Management (11 models)

| Model | Purpose |
|-------|---------|
| User | Central user entity (email, username, profile, location) |
| UserStats | Aggregate metrics (totalDistance, totalActivities, sportIndex, ranks) |
| UserSportStats | Per-sport performance (performanceScore, globalRank, etc.) |
| UserSport | User's active/paused sports with priority |
| UserBadge | Badges earned by user |
| UserStreak | Daily/weekly streak tracking |
| UserGear | Equipment tracking (shoes, bikes, watches) |
| ActivityGear | Links activities to gear used |
| UserBenchmarkBest | Personal best records per benchmark |
| UserActivityScore | Rolling 28-day activity score for "Most Active" |
| UserSportRating | ELO ratings for competitive sports |

#### Activity & Performance (8 models)

| Model | Purpose |
|-------|---------|
| Activity | User workouts/exercises (manual, Strava, imported) |
| Discipline | Sport subdiscipline (5K run, FTP bike test, etc.) |
| Sport | Primary sport (running, cycling, swimming, etc.) |
| PersonalRecord | Legacy PR tracking |
| ActivityBenchmarkResult | Links activities to benchmark results |
| ActivityAnomaly | Fraud/anomaly flagging |
| ActivityImport | File upload state (FIT/GPX/TCX) |
| BenchmarkDefinition | Definition of benchmarks (5K time, FTP, etc.) |

#### Ranking & Competition (13 models)

| Model | Purpose |
|-------|---------|
| Ranking | User ranking in a discipline (position, percentile, period) |
| RankingCache | Pre-computed leaderboards (top 100 cached) |
| DisciplineLeaderboardCache | Per-discipline leaderboard caches |
| UserRankState | Track rank deltas for notifications |
| Rivalry | 1v1 competition between users |
| RivalryParticipant | User participation in rivalry |
| RivalryResult | Final result of rivalry |
| Competition | Unified competition engine |
| CompetitionParticipant | User/team participation |
| CompetitionSnapshot | Historical competition state |
| CompetitionEvent | Competition event log |
| PaceBot | AI rival profile (STEADY, AGGRESSIVE, COMEBACK, RANDOM) |
| PaceBotRivalry | User rivalry with AI |

#### Social & Community (13 models)

| Model | Purpose |
|-------|---------|
| Follow | User follows another user |
| FriendRequest | Pending friend requests |
| Post | Social posts (activity, status, photo, milestone) |
| Like | Likes on posts |
| Comment | Comments on posts |
| Team | Sports teams/clubs |
| TeamMember | Team membership with role |
| TeamJoinRequest | Pending team join requests |
| TeamPost | Team announcements |
| Community | Topic-based community groups |
| CommunityMember | Community membership |
| CommunityPost | Community posts |
| PartnerRequest | "Find a partner" posts |

#### Gamification (6 models)

| Model | Purpose |
|-------|---------|
| Badge | Badge definition (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY) |
| Challenge | Time-bound challenges |
| ChallengeParticipant | User challenge participation |
| UserStreak | Streak tracking |
| FeedItem | Activity feed highlights |
| Target | Personal targets/goals |

#### Notifications & Engagement (3 models)

| Model | Purpose |
|-------|---------|
| Notification | In-app notifications (12+ types) |
| NotificationSettings | User preferences |
| PushToken | Device tokens for push |

#### Subscriptions & Monetization (4 models)

| Model | Purpose |
|-------|---------|
| Subscription | User subscription plan (FREE, PRO, PRO_ANNUAL) |
| ProductOffer | Product recommendations |
| ProductOfferView | Impression tracking |
| Perk | Unlockable perks |

#### Training & Planning (4 models)

| Model | Purpose |
|-------|---------|
| TrainingPlan | Pre-built or custom training programs |
| TrainingPlanWeek | Week structure |
| TrainingPlanWorkout | Individual workout |
| UserTrainingPlan | User's active plan with progress |

#### Integrations (8 models)

| Model | Purpose |
|-------|---------|
| StravaConnection | Strava OAuth token & sync state |
| StravaWebhookEvent | Incoming webhook events |
| IntegrationJob | Background job queue |
| BackfillState | Checkpoint for long-running jobs |
| AppleHealthConnection | Apple Health sync state |
| GarminHealthConnection | Garmin Connect sync state |
| ActivityImport | File import state |
| InviteCode | Alpha access code management |

#### Location & Observability (6 models)

| Model | Purpose |
|-------|---------|
| City | Normalized city data |
| SportIndexSnapshot | Point-in-time sport index value |
| SportIndexEvent | Audit trail for score changes |
| Dispute | Cheat dispute reports |
| AnalyticsEvent | Usage analytics |
| CronJobRun | Cron job execution tracking |

#### Advanced Features (6 models)

| Model | Purpose |
|-------|---------|
| Cohort | Weekly cohort squads (Rookie League) |
| CohortMember | Member of a cohort |
| League | Private leagues |
| LeagueMember | League membership |
| LeagueLeaderboardConfig | League leaderboard settings |
| PaceBotProfile | PaceBot configuration |

### Key Enums (30+ types)

**Verification & Quality**
- `VerificationTier`: BRONZE, SILVER, GOLD
- `VerificationSource`: MANUAL, STRAVA, GARMIN, APPLE_HEALTH, etc.
- `FairnessBadge`: STANDARD, NORMALIZED, SEGMENT, RATING

**Scoring & Measurement**
- `MeasurementType`: TIME_SECONDS, POWER_WKG, DISTANCE_METERS, etc.
- `ScoringKind`: PB_BEST, PERIOD_BEST, PERIOD_SUM
- `BenchmarkMeasurementType`: TIME, DISTANCE, SPEED, POWER, etc.

**Status & States**
- `SubscriptionStatus`: ACTIVE, TRIALING, PAST_DUE, CANCELED, EXPIRED
- `RivalryStatus`: PENDING, ACTIVE, COMPLETED, EXPIRED, CANCELLED
- `PaceBotRivalryStatus`: ACTIVE, WON, LOST
- `PaceBotPersona`: STEADY, AGGRESSIVE, COMEBACK, RANDOM

---

## 5. CORE FEATURES

### 5.1 User Management & Authentication

**Registration & Login**
- Email/password registration with bcrypt hashing
- OAuth providers: Google, Facebook, Apple
- NextAuth JWT session management
- Optional post-signup onboarding (4 steps)

**User Profiles**
- Display name, avatar, cover photo
- Bio, location (normalized to city + country)
- Gender, date of birth (for age-group rankings)
- Privacy level (PUBLIC, FOLLOWERS, PRIVATE)

### 5.2 Sports & Activities Tracking

**Supported Sports** (50+)
- Categories: Endurance, Strength, Water, Winter, Racket, Combat, etc.
- Sport Icon, name, slug
- MET defaults for calorie calculation

**Activity Creation**
- Manual entry with full metrics
- Date, duration, distance, elevation, calories
- Heart rate data, pace/speed, photos
- Gear tracking, tags, effort score
- Rate of Perceived Exertion (RPE 1-10)

**Activity Import**
- Strava OAuth sync (real-time webhook + daily backfill)
- File upload (FIT, GPX, TCX formats)
- Garmin/Apple Health (schema ready)

### 5.3 Rankings & Leaderboards

**Ranking Dimensions**
1. **Sport Index** (0-1000): Composite cross-sport performance
2. **Discipline Leaderboards**: Per-benchmark rankings
3. **Activity Score**: Rolling 28-day effort-based score
4. **ELO Ratings**: Competitive sports

**Ranking Scopes**
- GLOBAL, COUNTRY, CITY, FRIENDS, TEAM

**Ranking Periods**
- ALL_TIME, YEAR, MONTH, WEEK

**Sport Index Calculation**
- Activity frequency (200pts)
- Performance level (400pts)
- Consistency (150pts)
- Variety (100pts)
- Improvement (100pts)
- Social engagement (50pts)

### 5.4 Verification & Anti-Cheat

**Verification Tiers**
- **BRONZE**: Manual entry, no proof
- **SILVER**: Manual + evidence OR trusted device
- **GOLD**: Device sync (Strava/Garmin/Apple Health)

**Anomaly Detection**
- Impossible pace/speed
- GPS jump detection
- Severity scoring (1-5)
- Dispute system for review

### 5.5 Gamification

**Streaks**
- Daily activity streak
- Weekly goal streak
- Streak notifications

**Badges**
- Categories: DISTANCE, CONSISTENCY, PERFORMANCE, SOCIAL, CHALLENGE, SPECIAL
- Rarity: COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
- Automatic award on criteria met

**Challenges**
- Time-bound with targets
- Types: DISTANCE, DURATION, ACTIVITIES, CALORIES, ELEVATION, STREAK
- Badge rewards, sponsor integration

### 5.6 Social Features

**Following & Friends**
- Follow users, friend requests
- Friend-scope rankings

**Social Feed**
- Activity posts, status updates, photos
- Likes, comments, shares
- Privacy controls

**Teams & Communities**
- Team creation with sport association
- Community groups (topic-based)
- Partner finder for workouts

### 5.7 PaceBot Rivalry System

**Purpose**: Provides AI-powered pseudo-rivalries for users without real rivals

**PaceBot Personas**
- STEADY: Consistent performer
- AGGRESSIVE: Always pushing
- COMEBACK: Starts slow, improves
- RANDOM: Unpredictable wildcard

**Rivalry Flow**
1. System detects user needs a rival
2. Creates PaceBot with target based on user's PB + persona offset
3. User competes to beat PaceBot target
4. Rivalry resolved when user wins or loses

### 5.8 Training Plans

- Pre-built templates (marathon, 5K, FTP)
- Custom user-created plans
- Week/day structure with workouts
- Progress tracking

### 5.9 Monetization

**Subscription Plans**
- **FREE**: 3 sports, 1 team, 90-day history
- **PRO**: Unlimited, global rankings, analytics, export
- **PRO_ANNUAL**: Annual discount

**Perks & Trophy Room**
- Unlock perks based on Sport Index
- Partner benefits

---

## 6. API ROUTES

### Summary (84 Total Routes)

| Category | Count | Examples |
|----------|-------|----------|
| Authentication | 2 | register, nextauth |
| User Management | 6 | profile, password, delete, sports |
| Activities | 8 | CRUD, recent, dispute, benchmarks |
| Rankings | 10 | leaderboard, user, benchmark, insights |
| Social | 12 | friends, follow, communities |
| Posts & Feed | 8 | posts, likes, comments, highlights |
| Challenges | 5 | list, create, join, leave, leaderboard |
| Teams | 7 | CRUD, join, leave, battle |
| Rivalries | 4 | active, suggested, create, accept |
| Strava | 5 | connect, callback, webhook, sync, disconnect |
| Notifications | 5 | list, read, read-all, settings |
| Training Plans | 5 | list, detail, my, start, progress |
| Gear | 5 | CRUD |
| Gamification | 2 | badges, streak |
| Partner Finder | 4 | CRUD, join |
| Payments | 2 | checkout, webhook |
| Cron Jobs | 4 | strava-sync, rankings, activity-score, teams |
| Utilities | 6 | health, cities, offers, sports, onboarding |

### Key Endpoints

```
Authentication:
POST /api/auth/register
GET/POST /api/auth/[...nextauth]

Activities:
GET/POST /api/activities
GET/PUT/DELETE /api/activities/[id]

Rankings:
GET /api/rankings/leaderboard
GET /api/rankings/user
GET /api/home/hero-ranks

Social:
GET/POST /api/posts
POST /api/posts/[postId]/like
POST /api/social/follow

Strava:
GET /api/strava/connect
POST /api/strava/webhook

Cron:
POST /api/cron/recalculate-rankings
POST /api/cron/strava-sync
```

---

## 7. KEY MODELS & RELATIONSHIPS

### Primary Relationships

```
User (1) ─── (N) Activity ─── (N) ActivityBenchmarkResult ─── (1) BenchmarkDefinition
User (1) ─── (N) UserBenchmarkBest ─── (1) BenchmarkDefinition
User (1) ─── (1) UserStats ─── (N) UserSportStats ─── (1) Sport
User (1) ─── (N) Ranking ─── (1) Discipline ─── (1) Sport
User (1) ─── (N) TeamMember ─── (1) Team ─── (1) Sport
User (1) ─── (N) ChallengeParticipant ─── (1) Challenge
User (1) ─── (N) PaceBotRivalry ─── (1) PaceBot
User (1) ─── (1) StravaConnection
```

---

## 8. EXTERNAL INTEGRATIONS

### 8.1 Strava Integration

**OAuth Flow**
1. User clicks "Connect Strava"
2. Redirect to Strava OAuth
3. Receive authorization code
4. Exchange for access/refresh tokens
5. Store in StravaConnection

**Data Sync**
- **Webhook**: Real-time on activity create/update/delete
- **Backfill**: Historical activities on connect
- **Daily Sync**: Cron job to catch missed webhooks

**Files**
- `lib/integrations/strava/client.ts`
- `lib/integrations/strava/sync.ts`
- `lib/integrations/strava/import.ts`
- `app/api/strava/*`

### 8.2 Supabase

- PostgreSQL database
- File storage (avatars, photos)
- Real-time subscriptions (feed)

### 8.3 Stripe

- Subscription checkout
- Monthly/annual billing
- Webhook handling

### 8.4 OAuth Providers

- Google, Facebook, Apple
- NextAuth configuration in `lib/auth.ts`

---

## 9. MOBILE SUPPORT

### Capacitor Configuration

**Platform**: iOS & Android
**App ID**: app.evergo.mobile
**App Name**: EverGo

**Plugins**
- SplashScreen (2-second launch)
- PushNotifications
- Haptics
- StatusBar
- Keyboard

**Build Output**: `webDir: "out"` (Next.js static export)

---

## 10. TESTING

### E2E Testing with Playwright

**Test Projects**
- Chromium, Firefox, WebKit (desktop)
- Mobile Chrome, Mobile Safari
- Accessibility (axe-core)
- API (headless)

**Test Suites** (16 spec files)
- auth, navigation, components, forms
- activity-creation, accessibility
- security, user-journey, api, visual

**Agent-Based Testing** (5 agents)
- Atlas (navigation), Hermes (forms), Iris (visual)
- Nyx (auth), Kronos (performance)

**Commands**
```bash
npm run test                    # Run all tests
npm run test:ui                 # Interactive UI mode
npm run test:headed             # Visible browser
npm run test:a11y               # Accessibility testing
npm run test:visual             # Visual regression
```

---

## 11. CONFIGURATION

### Environment Variables

**Required**
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...  # openssl rand -base64 32
```

**Recommended**
```bash
NEXT_PUBLIC_APP_ENV=local|staging|production
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Strava
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...

# Cron
CRON_SECRET=...
```

### Feature Flags

File: `lib/flags.ts`

```typescript
export function isFlagEnabled(flag: string): boolean {
  // enablePaceBot, enableLeagues, etc.
}
```

---

## 12. BACKGROUND JOBS & CRON

### Scheduled Jobs (Vercel Cron)

| Job | Schedule | Purpose |
|-----|----------|---------|
| strava-sync | Daily | Backfill missed Strava activities |
| recalculate-rankings | Hourly | Recompute user ranks |
| activity-score | Daily | Update most-active leaderboard |
| teams | Daily | Aggregate team statistics |

### Job Tracking

- CronJobRun model for execution tracking
- IntegrationJob for background queue
- BackfillState for long-running jobs

---

## 13. OBSERVABILITY & LOGGING

### Logger (`lib/logger.ts`)

- Console logging (dev)
- Structured error reporting
- API error wrapping

### Observability (`lib/observability.ts`)

- Request tracing (generateRequestId)
- Error capture with context
- Secret redaction

---

## 14. LOCAL DEVELOPMENT

### Setup

```bash
# 1. Clone repository
git clone https://github.com/prokesmic/EverGo.git
cd Evergo

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with credentials

# 4. Sync database schema
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Start dev server
npm run dev
```

### Common Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run test             # Run E2E tests
npx prisma studio        # Database GUI
npx prisma db push       # Sync schema
```

---

## 15. DEPLOYMENT

### Vercel Deployment

- Build: `prisma generate && next build`
- Environment variables in Vercel dashboard
- Cron jobs configured in vercel.json

### Health Check

`GET /api/health` returns:
- Database connectivity
- Supabase connectivity
- Auth configuration status

---

## 16. SECURITY & PRIVACY

### Authentication

- JWT tokens with NextAuth
- HTTP-only cookies
- bcrypt password hashing (10 rounds)

### Data Privacy

- Privacy levels: PUBLIC, FOLLOWERS, PRIVATE
- Per-activity visibility control
- Account deletion with cascade

### Anti-Cheat

- Verification tiers (BRONZE/SILVER/GOLD)
- Anomaly detection
- Dispute system

### API Security

- Rate limiting
- Zod validation
- CORS configuration
- Secret redaction in logs

---

## 17. DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] DATABASE_URL set to production database
- [ ] NEXTAUTH_SECRET set to secure value
- [ ] All OAuth secrets configured
- [ ] CRON_SECRET set
- [ ] Feature flags reviewed
- [ ] E2E tests passing
- [ ] Health check endpoint working

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| API Routes | 84 |
| Database Models | 84 |
| React Components | 232 |
| Library Files | 93 |
| E2E Test Specs | 16 |
| Supported Sports | 50+ |
| Verification Tiers | 3 |
| Ranking Scopes | 5 |
| Subscription Plans | 3 |

---

## Quick Reference: Key File Locations

| Purpose | Location |
|---------|----------|
| Authentication | `lib/auth.ts`, `middleware.ts` |
| Database | `prisma/schema.prisma`, `lib/db.ts` |
| Rankings | `lib/rankings/`, `lib/discipline-rankings.ts` |
| Strava | `lib/integrations/strava/` |
| PaceBot | `lib/pacebot/` |
| Feature Flags | `lib/flags.ts` |
| API Utils | `lib/api-utils.ts` |
| Tests | `e2e/`, `playwright.config.ts` |
| Config | `.env`, `next.config.ts`, `capacitor.config.ts` |

---

*This documentation covers all major aspects of the Evergo application. For specific implementation details, refer to the source files in each directory.*
