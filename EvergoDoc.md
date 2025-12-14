# EverGo - Complete Project Documentation

> **The Global Network for Sports** - Track, Compete, Connect

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Core Features](#4-core-features)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Authentication](#7-authentication)
8. [Gamification System](#8-gamification-system)
9. [Ranking Engine](#9-ranking-engine)
10. [Social Features](#10-social-features)
11. [Teams & Communities](#11-teams--communities)
12. [Training Plans](#12-training-plans)
13. [Subscription & Monetization](#13-subscription--monetization)
14. [PWA Features](#14-pwa-features)
15. [Notifications](#15-notifications)
16. [Component Architecture](#16-component-architecture)
17. [Pages & Routes](#17-pages--routes)
18. [Development](#18-development)

---

## 1. Overview

EverGo is a comprehensive social fitness platform that combines activity tracking, competitive rankings, gamification, and social networking for athletes of all levels. The platform supports multiple sports including Running, Cycling, Swimming, Golf, Tennis, Football, Basketball, Triathlon, and Fitness.

### Key Value Propositions

- **Multi-Sport Tracking** - Log and analyze activities across 9+ sports with detailed metrics
- **Global Rankings** - Compete on leaderboards at global, national, city, and team levels
- **Social Fitness** - Connect with athletes, join teams, and participate in communities
- **Gamification** - Earn badges, maintain streaks, and complete challenges
- **Training Plans** - Follow structured training programs for various sports and skill levels
- **PWA Support** - Full offline capability and native app-like experience

### Platform Statistics

- **51+ API Endpoints** across 15+ feature areas
- **35+ Database Models** supporting complex relationships
- **9 Supported Sports** with discipline-specific tracking
- **Production-Ready** with comprehensive testing

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Zustand | 5.0.9 | State management |
| React Hook Form | Latest | Form handling |
| Zod | Latest | Schema validation |
| Lucide React | 0.555 | Icon library |
| Recharts | 3.5.1 | Data visualization |
| Leaflet | 1.9.4 | Maps integration |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Prisma | 6.0.0 | ORM & database toolkit |
| PostgreSQL | Latest | Primary database |
| NextAuth | 4.24.13 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| web-push | 3.6.7 | Push notifications |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Deployment & hosting |
| Supabase | Managed PostgreSQL & storage |
| Stripe | Payment processing |

### Development & Testing

| Tool | Purpose |
|------|---------|
| Playwright | E2E testing |
| ESLint | Code linting |
| tsx/ts-node | TypeScript execution |

---

## 3. Project Structure

```
/Users/michal/Evergo/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing page routes
│   ├── api/                      # API routes (51+ endpoints)
│   │   ├── auth/                 # Authentication
│   │   ├── activities/           # Activity management
│   │   ├── rankings/             # Leaderboards
│   │   ├── challenges/           # Challenges
│   │   ├── teams/                # Teams
│   │   ├── communities/          # Communities
│   │   ├── posts/                # Social posts
│   │   ├── notifications/        # Notifications
│   │   ├── training-plans/       # Training
│   │   ├── subscription/         # Payments
│   │   └── ...
│   ├── activity/                 # Activity pages
│   ├── challenges/               # Challenge pages
│   ├── communities/              # Community pages
│   ├── home/                     # Dashboard
│   ├── profile/                  # User profiles
│   ├── rankings/                 # Rankings pages
│   ├── settings/                 # Settings pages
│   ├── teams/                    # Team pages
│   ├── training/                 # Training pages
│   └── ...
├── components/                   # React components
│   ├── feed/                     # Feed components
│   ├── gamification/             # Badges, streaks
│   ├── landing/                  # Landing page
│   ├── layout/                   # Layout components
│   ├── pwa/                      # PWA components
│   ├── rankings/                 # Ranking components
│   ├── social/                   # Social components
│   ├── teams/                    # Team components
│   ├── ui/                       # UI primitives
│   └── widgets/                  # Dashboard widgets
├── lib/                          # Utilities & business logic
│   ├── db.ts                     # Prisma client
│   ├── gamification.ts           # Gamification engine
│   ├── rankings.ts               # Ranking calculations
│   ├── notifications.ts          # Notification engine
│   ├── monetization.ts           # Subscription logic
│   └── utils.ts                  # Helpers
├── prisma/                       # Database
│   ├── schema.prisma             # Schema definition
│   └── seed.ts                   # Seed data
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # App icons
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript definitions
├── e2e/                          # Playwright tests
└── package.json                  # Dependencies
```

---

## 4. Core Features

### 4.1 Activity Tracking

EverGo supports comprehensive activity logging with the following metrics:

| Metric | Description |
|--------|-------------|
| Duration | Activity length in seconds |
| Distance | Total distance in meters |
| Elevation | Elevation gain in meters |
| Calories | Calories burned |
| Heart Rate | Average and max BPM |
| Pace | Minutes per kilometer |
| Speed | Kilometers per hour |
| GPS Route | Full route data (JSON) |
| Photos | Activity photo gallery |
| Weather | Conditions during activity |
| Gear | Associated equipment |

**Supported Sports:**
- Running (5K, 10K, Half Marathon, Marathon, Trail, Ultra)
- Cycling (Road, MTB, Gravel, Indoor)
- Swimming (Pool, Open Water)
- Golf
- Tennis
- Football
- Basketball
- Triathlon
- Fitness/Gym

### 4.2 Rankings & Leaderboards

Multi-scope competitive rankings:

| Scope | Description |
|-------|-------------|
| Global | Worldwide rankings |
| Country | National rankings |
| City | Local rankings |
| Friends | Rankings among friends |
| Team | Team-specific rankings |

**Time Periods:**
- All Time
- This Year
- This Month
- This Week

### 4.3 Challenges

Challenge types and targets:

| Target Type | Example |
|-------------|---------|
| Distance | Run 100km this month |
| Duration | 50 hours of activity |
| Activities | Complete 20 workouts |
| Calories | Burn 10,000 calories |
| Elevation | Climb 5,000m |
| Streak | 30 consecutive days |

**Challenge Scopes:**
- Global (all users)
- Team challenges
- Community challenges
- Personal challenges

### 4.4 Social Network

- **Following System** - Follow other athletes
- **Friend Requests** - Bidirectional friendships
- **Activity Feed** - See friends' activities
- **Posts & Comments** - Social engagement
- **Likes & Reactions** - 6 reaction types

### 4.5 Teams & Communities

**Teams:**
- Create clubs and squads
- Member roles (Owner, Moderator, Member)
- Team challenges and leaderboards
- Jersey numbers and positions

**Communities:**
- Topic-based groups
- Multi-sport communities
- Location-based communities
- Discussion forums

---

## 5. Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  password      String?
  displayName   String?
  bio           String?
  avatarUrl     String?
  coverUrl      String?
  city          String?
  country       String?
  dateOfBirth   DateTime?
  privacyLevel  PrivacyLevel @default(PUBLIC)

  // Relationships
  activities    Activity[]
  posts         Post[]
  teams         TeamMember[]
  communities   CommunityMember[]
  badges        UserBadge[]
  streaks       UserStreak[]
  subscription  Subscription?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Activity {
  id            String    @id @default(cuid())
  userId        String
  sportId       String
  disciplineId  String?

  // Metrics
  duration      Int       // seconds
  distance      Float?    // meters
  elevation     Float?    // meters
  calories      Int?
  avgHeartRate  Int?
  maxHeartRate  Int?
  pace          Float?    // min/km
  speed         Float?    // km/h

  // Data
  routeData     Json?     // GPS coordinates
  photos        String[]
  weather       String?
  gearId        String?

  // Visibility
  visibility    Visibility @default(PUBLIC)

  startedAt     DateTime
  createdAt     DateTime  @default(now())
}

model UserStats {
  id              String  @id @default(cuid())
  userId          String  @unique

  // Aggregates
  totalDistance   Float   @default(0)
  totalDuration   Int     @default(0)
  totalActivities Int     @default(0)
  totalCalories   Int     @default(0)

  // Sport Index (0-1000)
  sportIndex      Int     @default(0)
  sportIndexBest  Int     @default(0)

  // Rankings
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?

  // Location
  city            String?
  country         String?
}

model Challenge {
  id            String    @id @default(cuid())
  title         String
  description   String?

  // Target
  targetType    ChallengeTarget  // DISTANCE, DURATION, ACTIVITIES, etc.
  targetValue   Float

  // Scope
  scope         ChallengeScope   // GLOBAL, TEAM, COMMUNITY, PERSONAL
  sportId       String?
  teamId        String?

  // Dates
  startDate     DateTime
  endDate       DateTime

  // Rewards
  badgeId       String?

  participants  ChallengeParticipant[]
}

model Badge {
  id            String    @id @default(cuid())
  name          String
  description   String
  icon          String

  category      BadgeCategory  // DISTANCE, CONSISTENCY, PERFORMANCE, etc.
  rarity        BadgeRarity    // COMMON, UNCOMMON, RARE, EPIC, LEGENDARY

  // Criteria
  criteriaType  String    // total_distance, streak_days, etc.
  criteriaValue Float
}
```

### Full Model List (35+)

**User & Profile:**
- User, UserStats, UserSportStats, UserStreak, UserBadge

**Activities:**
- Activity, ActivityGear, PersonalRecord

**Social:**
- Follow, FriendRequest, Post, Like, Comment

**Teams & Communities:**
- Team, TeamMember, TeamJoinRequest, TeamPost
- Community, CommunityMember, CommunityPost

**Gamification:**
- Challenge, ChallengeParticipant, Badge

**Rankings:**
- Ranking, RankingCache

**Training:**
- TrainingPlan, TrainingPlanWeek, TrainingPlanWorkout, UserTrainingPlan

**Notifications:**
- Notification, NotificationSettings, PushToken

**Monetization:**
- Subscription, UserGear, ProductOffer, ProductOfferView

**Reference:**
- Sport, Discipline

---

## 6. API Reference

### Authentication (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| * | `/api/auth/[...nextauth]` | NextAuth handler |

### Activities (1 endpoint)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activities` | Create activity |

### Rankings (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rankings/leaderboard` | Query leaderboard |
| GET | `/api/rankings/user/[userId]` | User rankings |
| GET | `/api/rankings/insights/[userId]` | Ranking insights |

### Challenges (3 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/challenges` | List/create challenges |
| POST | `/api/challenges/[id]/join` | Join challenge |
| POST | `/api/challenges/[id]/leave` | Leave challenge |

### Teams (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/teams` | List/create teams |
| GET/POST | `/api/teams/[slug]` | Team details |
| POST | `/api/teams/[slug]/join` | Join team |
| GET/POST | `/api/teams/[slug]/posts` | Team posts |
| GET/POST | `/api/teams/[slug]/challenges` | Team challenges |

### Posts & Feed (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/posts` | Posts CRUD |
| POST | `/api/posts/[postId]/like` | Like post |
| GET/POST | `/api/posts/[postId]/comments` | Comments |
| GET | `/api/feed` | User feed |

### Communities (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/communities` | Community CRUD |
| GET/POST | `/api/communities/[slug]` | Details |
| POST | `/api/communities/[slug]/join` | Join |
| GET/POST | `/api/communities/[slug]/posts` | Posts |

### Notifications (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/notifications` | Notifications |
| PUT | `/api/notifications/[id]/read` | Mark read |
| PUT | `/api/notifications/read-all` | Mark all read |
| GET/POST | `/api/notifications/settings` | Preferences |

### Training Plans (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/training-plans` | Plans CRUD |
| GET | `/api/training-plans/[id]` | Plan details |
| POST | `/api/training-plans/[id]/follow` | Start plan |
| GET/POST | `/api/training-plans/my` | User's plans |
| PUT | `/api/training-plans/my/[id]/workout` | Log workout |

### Subscription (2 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscription` | Status |
| POST | `/api/subscription/checkout` | Stripe checkout |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/badges` | List badges |
| GET/POST | `/api/gear` | Gear management |
| GET/POST | `/api/partner-requests` | Partner finder |
| GET | `/api/social/suggestions` | Follow suggestions |
| GET | `/api/offers` | Product offers |
| GET | `/api/search` | Global search |
| GET/PUT | `/api/user/profile` | Profile updates |
| POST | `/api/cron/recalculate-rankings` | Ranking job |

---

## 7. Authentication

### Registration Flow

```
1. User submits email + password
2. Validation (email format, password 6+ chars)
3. Check for existing account
4. Hash password with bcryptjs (10 rounds)
5. Create user record
6. Return user ID and email
```

### Login Flow

```
1. User submits credentials (or OAuth)
2. Credentials Provider:
   - Find user by email
   - Compare password hash
   - Return user object
3. JWT token created
4. Session callback enriches token
5. Client receives session
```

### OAuth Providers

- Google
- Facebook
- Apple

### Session Management

- JWT-based sessions
- Server-side token storage
- Automatic refresh
- Session callback adds user data

---

## 8. Gamification System

### Badges

**Categories:**
| Category | Description |
|----------|-------------|
| Distance | Total distance milestones |
| Consistency | Streak achievements |
| Performance | Speed/pace records |
| Social | Community engagement |
| Challenge | Challenge completions |
| Special | Limited edition |

**Rarity Levels:**
- Common (most achievable)
- Uncommon
- Rare
- Epic
- Legendary (hardest)

**Example Badges:**
- "Marathon Runner" - Complete a marathon
- "Century Rider" - Ride 100km in one activity
- "7-Day Streak" - 7 consecutive activity days
- "Social Butterfly" - Follow 50 athletes
- "Challenge Champion" - Complete 10 challenges

### Streaks

**Daily Streak:**
- Log activity daily to maintain
- Longest streak tracked
- Streak milestones (7, 14, 21, 30 days)
- Breaking detection

**Weekly Goals:**
- Default: 3 activities per week
- Configurable per user
- Progress tracking

### Personal Records

Track best performances:
- 5K Time
- 10K Time
- Half Marathon Time
- Marathon Time
- Longest Run
- Fastest Pace
- Longest Ride
- Best Pool Swim

---

## 9. Ranking Engine

### Sport Index Formula (0-1000 points)

```
Sport Index = Activity Frequency (200)
            + Performance Level (400)
            + Consistency/Streaks (150)
            + Variety Bonus (100)
            + Improvement Trend (100)
            + Social Engagement (50)
```

**Component Breakdown:**

| Component | Max Points | Calculation |
|-----------|------------|-------------|
| Activity Frequency | 200 | Activities per week (28-day window) |
| Performance Level | 400 | Percentile-based scoring |
| Consistency | 150 | Current streak value |
| Variety | 100 | Multiple sports bonus |
| Improvement | 100 | Month-over-month gains |
| Social | 50 | Teams + challenges participation |

### Ranking Scopes

| Scope | Filter |
|-------|--------|
| Global | All users worldwide |
| Country | Users in same country |
| City | Users in same city |
| Friends | User's friend list |
| Team | Team members only |

### Leaderboard Caching

- Top 100 cached per scope/period
- Recalculated daily via cron job
- Manual refresh available

---

## 10. Social Features

### Following System

- Unidirectional follows
- Follower/following counts
- Feed visibility based on follows

### Friend Requests

**Statuses:**
- Pending
- Accepted
- Rejected
- Blocked

### Follow Suggestions Algorithm

```
Score calculation:
- Same city: +3 points
- Same sport: +2 points
- Mutual follows: +1 point each

Returns top 10 suggestions
```

### Activity Feed

**Feed Types:**
- Following (default)
- Friends only
- All public

**Post Types:**
- Activity posts
- Status updates
- Photo shares
- Achievements
- Milestones

### Engagement

**Reaction Types:**
- Like
- Love
- Haha
- Wow
- Sad
- Angry

---

## 11. Teams & Communities

### Teams

**Team Types:**
- Club (official organization)
- Squad (competitive team)
- Casual (informal group)

**Member Roles:**
- Owner (full control)
- Moderator (manage members)
- Member (participate)

**Features:**
- Team leaderboard
- Team challenges
- Team posts/feed
- Jersey numbers
- Player positions
- Verification badge

### Communities

**Features:**
- Topic-based groups
- Multi-sport or single sport
- Location-based discovery
- Public/private visibility
- Discussion posts
- Member roles

---

## 12. Training Plans

### Plan Structure

```
TrainingPlan
├── TrainingPlanWeek[]
│   ├── weekNumber
│   ├── title
│   ├── description
│   └── TrainingPlanWorkout[]
│       ├── dayOfWeek (0-6)
│       ├── title
│       ├── targetType (DISTANCE/DURATION/REST)
│       ├── targetValue
│       ├── intensity (EASY/MODERATE/HARD/RACE_PACE)
│       └── notes
```

### Plan Levels

- Beginner
- Intermediate
- Advanced

### User Progress

- Start date tracking
- Current week position
- Completed workouts (JSON)
- Status (Active, Paused, Completed, Abandoned)

---

## 13. Subscription & Monetization

### Plans

| Feature | Free | Pro |
|---------|------|-----|
| Sports | 3 max | Unlimited |
| Teams | 1 max | Unlimited |
| Rankings | City/Country | + Global |
| History | 90 days | Unlimited |
| Analytics | Basic | Advanced |
| Custom Challenges | No | Yes |
| Data Export | No | Yes |
| Ads | Yes | No |
| Support | Standard | Priority |

### Pricing

- **Pro Monthly**: Premium features
- **Pro Annual**: 2 months free

### Stripe Integration

- Customer management
- Subscription lifecycle
- Trial support
- Cancellation handling

### Gear Management

Track equipment usage:
- Running shoes
- Cycling shoes
- Bikes
- Helmets
- Watches
- Other gear

Features:
- Distance/duration tracking
- Retirement recommendations
- Replacement alerts (80%+ wear)

### Product Offers

Targeted recommendations based on:
- Gear replacement needs
- Sport activity level
- User preferences

---

## 14. PWA Features

### Service Worker

**Caching Strategies:**
- Static assets: Cache-first
- API calls: Network-first with fallback
- Images: Cache-first with network fallback
- Pages: Network-first with offline fallback

**Capabilities:**
- Offline support
- Push notifications
- Background sync
- App-like experience

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
  "icons": [...],
  "shortcuts": [
    { "name": "Record Activity", "url": "/activity/create" },
    { "name": "My Stats", "url": "/profile/me/stats" },
    { "name": "Leaderboard", "url": "/rankings" }
  ]
}
```

### Installation

- Add to Home Screen prompt
- iOS/Android native experience
- Splash screens
- App icons

---

## 15. Notifications

### Notification Types

| Category | Types |
|----------|-------|
| Social | Like, Comment, Follow, Mention |
| Ranking | Rank up/down, Friend overtake, Milestone |
| Streaks | Reminder, Broken, Milestone |
| Challenges | Joined, Progress, Ending, Completed |
| Badges | Badge earned |
| Team | Invite, Join request, Post |
| Other | Weekly summary, Updates, Gear replacement |

### User Preferences

- Per-category toggles
- Push enable/disable
- Weekly digest settings
- Quiet hours (e.g., 22:00-08:00)
- Timezone-aware

### Push Notifications

- Web Push API
- Device token management
- Multi-platform support
- Click handling with routing

---

## 16. Component Architecture

### Layout Components

```
components/layout/
├── main-nav.tsx          # Desktop navigation
├── mobile-nav.tsx        # Bottom navigation
├── mobile-header.tsx     # Mobile top bar
├── page-grid.tsx         # Responsive grid
├── page-subheader.tsx    # Page headers
└── sidebar-navigation.tsx
```

### Feature Components

```
components/
├── feed/                 # Activity feed
├── gamification/         # Badges, streaks
├── landing/              # Marketing pages
├── pwa/                  # PWA features
├── rankings/             # Leaderboards
├── social/               # Social features
├── teams/                # Team management
├── communities/          # Communities
└── widgets/              # Dashboard widgets
    ├── rankings-widget.tsx
    ├── activities-summary-widget.tsx
    ├── calendar-widget.tsx
    ├── teams-widget.tsx
    ├── follow-suggestions-wrapper.tsx
    ├── streak-alert-widget.tsx
    └── partner-finder-widget.tsx
```

### UI Components (Radix-based)

```
components/ui/
├── button.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── tabs.tsx
├── select.tsx
├── slider.tsx
├── avatar.tsx
├── card.tsx
├── input.tsx
└── ...
```

---

## 17. Pages & Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/register` | Registration |

### Authenticated Routes

| Route | Description |
|-------|-------------|
| `/home` | Dashboard |
| `/activity/create` | Log activity |
| `/activity/[id]` | Activity details |
| `/activity/track` | Live tracking |
| `/rankings` | Rankings page |
| `/leaderboard` | Leaderboard |
| `/profile/[username]` | User profile |
| `/teams` | Team discovery |
| `/teams/[slug]` | Team details |
| `/challenges` | Challenges |
| `/challenges/[id]` | Challenge details |
| `/communities` | Communities |
| `/communities/[slug]` | Community details |
| `/calendar` | Activity calendar |
| `/training` | Training plans |
| `/training/[planId]` | Plan details |
| `/settings` | Settings hub |
| `/settings/profile` | Edit profile |
| `/settings/subscription` | Subscription |
| `/notifications` | Notifications |
| `/onboarding` | New user flow |
| `/offline` | Offline page |

---

## 18. Development

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
npm run prisma:seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."

# Push Notifications
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Run Playwright tests |
| `npm run prisma:seed` | Seed database |

### Testing

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

### Code Quality

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Playwright E2E tests

---

## Summary

EverGo is a production-ready social fitness platform featuring:

- **Comprehensive Activity Tracking** across 9+ sports
- **Competitive Rankings** at multiple geographic levels
- **Rich Social Features** including following, teams, and communities
- **Gamification** with badges, streaks, and challenges
- **Training Plans** for structured fitness programs
- **PWA Support** for native app-like experience
- **Subscription Model** with free and premium tiers

The platform is built with modern technologies (Next.js 16, React 19, Prisma, PostgreSQL) and follows best practices for scalability, performance, and user experience.

---

*Documentation generated December 2024*
*EverGo - Track, Compete, Connect*
