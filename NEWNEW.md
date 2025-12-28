# EverGo - Competitive Sports Tracking Platform

## Overview

EverGo is a Next.js 15 competitive sports tracking application that gamifies fitness through rivalries, rankings, and team battles. The platform allows athletes to track activities across 25+ sports, compete in city/country/global rankings, and engage in 1v1 rivalries with athletes at their level.

**Live URL:** https://evergo-nu.vercel.app

---

## Tech Stack

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Credentials + OAuth providers)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Supabase Storage (profile photos)
- **Payments:** Stripe (subscriptions)

### Testing
- **E2E Testing:** Playwright
- **AI Testing:** Custom "Mike" test framework (Claude-powered)

---

## Project Structure

```
/Users/michal/Evergo/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── user/                 # User management APIs
│   │   │   ├── profile/          # Profile CRUD
│   │   │   ├── sports/           # User sports management
│   │   │   ├── password/         # Password change
│   │   │   └── delete/           # Account deletion
│   │   ├── activities/           # Activity CRUD
│   │   ├── teams/                # Team management
│   │   ├── subscription/         # Stripe integration
│   │   └── notifications/        # Notification APIs
│   ├── home/                     # Main dashboard
│   ├── profile/[username]/       # User profiles
│   ├── settings/                 # Settings pages
│   │   ├── profile/              # Edit profile
│   │   ├── sports/               # Manage sports
│   │   ├── subscription/         # Subscription management
│   │   └── account/              # Security & privacy
│   ├── activity/                 # Activity pages
│   │   ├── create/               # Log new activity
│   │   ├── track/                # GPS tracking
│   │   └── [id]/                 # View activity
│   ├── teams/                    # Team features
│   ├── rankings/                 # Leaderboards
│   ├── challenges/               # Challenges & competitions
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard widgets
│   ├── profile/                  # Profile components
│   ├── settings/                 # Settings components
│   ├── activity/                 # Activity components
│   └── layout/                   # Layout components
├── lib/                          # Utilities
│   ├── db.ts                     # Prisma client
│   ├── supabase.ts               # Supabase client
│   ├── utils.ts                  # Helper functions
│   └── stripe/                   # Stripe utilities
├── prisma/
│   └── schema.prisma             # Database schema
├── mike/                         # AI testing framework
│   ├── cli.ts                    # Test runner CLI
│   └── core/                     # Mike core logic
├── e2e/                          # Playwright tests
└── public/                       # Static assets
```

---

## Database Schema (Key Models)

### User
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

  sports          UserSport[]
  activities      Activity[]
  personalRecords PersonalRecord[]
  rankings        Ranking[]
  stats           UserStats?
  streak          UserStreak?
  badges          UserBadge[]
  subscription    Subscription?
  // ... relations
}
```

### UserSport
```prisma
model UserSport {
  id          String    @id @default(cuid())
  userId      String
  sportId     String
  isPrimary   Boolean   @default(false)
  skillLevel  String?   // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

  user        User      @relation(...)
  sport       Sport     @relation(...)
}
```

### Activity
```prisma
model Activity {
  id              String    @id @default(cuid())
  userId          String
  disciplineId    String
  title           String
  activityDate    DateTime
  durationSeconds Int?
  distanceMeters  Float?
  elevationGain   Float?
  caloriesBurned  Int?
  avgHeartRate    Int?
  gpsRoute        String?   // JSON

  user            User      @relation(...)
  discipline      Discipline @relation(...)
}
```

### Sport & Discipline
```prisma
model Sport {
  id          String       @id @default(cuid())
  name        String       @unique
  iconUrl     String?
  color       String?
  isActive    Boolean      @default(true)
  disciplines Discipline[]
}

model Discipline {
  id          String    @id @default(cuid())
  sportId     String
  name        String
  unit        String    // "distance", "time", "score"
}
```

### Rankings & Stats
```prisma
model UserStats {
  id              String    @id @default(cuid())
  userId          String    @unique
  sportIndex      Int       @default(0)    // 0-1000 score
  totalDistance   Float     @default(0)
  totalDuration   Int       @default(0)
  totalActivities Int       @default(0)
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?
}

model Ranking {
  id        String @id @default(cuid())
  userId    String
  scope     String // GLOBAL, COUNTRY, CITY, CLUB
  period    String // WEEKLY, MONTHLY, ALL_TIME
  position  Int
  score     Float
}
```

---

## Key Features

### 1. Activity Tracking
- Manual activity logging with detailed metrics
- GPS route tracking (mobile)
- Auto-sync from fitness apps (Garmin, Strava - planned)
- 25+ supported sports

### 2. Rankings System
- **Sport Index:** Universal performance score (0-1000)
- **Scopes:** Global, Country, City, Club, Friends
- **Periods:** Weekly, Monthly, All-Time
- Real-time leaderboards

### 3. Gamification
- **Streaks:** Daily/weekly activity streaks
- **Badges:** Achievement system with 50+ badges
- **Challenges:** Sponsored competitions with prizes
- **Rivalries:** AI-matched 1v1 battles (planned)

### 4. Teams
- Create/join teams
- Team vs Team weekly battles
- Team chat and activity feed
- Training partner finder

### 5. Social
- Follow athletes
- Activity feed
- Comments and likes
- Share activities

### 6. Subscription (Stripe)
- **Free:** 3 sports, 90-day history, city rankings
- **Pro ($9.99/mo):** Unlimited sports, full history, global rankings, advanced analytics

---

## API Routes

### User Management
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| PATCH | `/api/user/profile` | Update profile |
| POST | `/api/user/sports` | Add a sport |
| PATCH | `/api/user/sports` | Update sport skill level |
| DELETE | `/api/user/sports?id=` | Remove a sport |
| POST | `/api/user/sports/primary` | Set primary sport |
| POST | `/api/user/password` | Change password |
| DELETE | `/api/user/delete` | Delete account |

### Activities
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/activities` | List user activities |
| POST | `/api/activities` | Create activity |
| GET | `/api/activities/[id]` | Get activity |
| PATCH | `/api/activities/[id]` | Update activity |
| DELETE | `/api/activities/[id]` | Delete activity |

### Teams
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/[id]` | Get team details |
| POST | `/api/teams/[id]/join` | Request to join |
| POST | `/api/teams/[id]/leave` | Leave team |

### Subscription
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/subscription` | Get subscription status |
| POST | `/api/subscription/checkout` | Create checkout session |
| POST | `/api/subscription/webhook` | Stripe webhook |

---

## Settings Pages Structure

The settings section uses a sidebar layout:

```
/settings
├── /profile        # Profile info, photos (DEFAULT)
├── /sports         # Manage sports & skill levels
├── /subscription   # Subscription management
├── /account        # Password, privacy, delete account
└── → /notifications/settings (external link)
```

### Settings Layout Features:
- Responsive sidebar navigation
- Orange accent for active states
- White card containers
- "Back to Home" navigation

---

## Landing Page (Platinum Theme)

The landing page uses an aggressive, performance-focused design:

### Sections:
1. **Hero** - "TRACK. BATTLE. DOMINATE." with dashboard mockup
2. **Features** - Bento grid with rivalry widgets
3. **How It Works** - 4-step scrollytelling
4. **Comparison** - vs Strava & Nike Run Club table
5. **Social Proof** - Scrolling brand ticker + testimonials
6. **Upcoming** - Future features preview
7. **CTA** - Final conversion section
8. **Footer** - Dark slate-950 footer

### Design Tokens:
- Primary: `orange-500`
- Background: `slate-50`
- Dark sections: `slate-900`, `slate-950`
- Accent gradients: `from-orange-500 to-red-600`

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://evergo-nu.vercel.app"
NEXTAUTH_SECRET="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Seed database (optional)
npx prisma db seed

# Run development server
npm run dev

# Run tests
npm run test           # Unit tests
npx playwright test    # E2E tests
npm run mike:smoke     # AI smoke tests
```

---

## Deployment

The app is deployed on Vercel with automatic deployments from the main branch.

```bash
# Build for production
npm run build

# Vercel CLI deployment
vercel --prod
```

---

## Testing

### Playwright E2E Tests
Located in `/e2e/` directory. Run with:
```bash
npx playwright test
```

### Mike AI Testing Framework
Custom AI-powered testing using Claude. Located in `/mike/` directory.

```bash
# Smoke tests
npm run mike:smoke

# Full test suite
npm run mike:full

# Specific category
npm run mike:discover
```

---

## Recent Changes

### December 2024

1. **Settings Overhaul**
   - New sidebar layout for settings
   - Added Sports settings page
   - Added Account settings (password, privacy, delete)
   - Default redirect changed to `/settings/profile`

2. **Profile Page Fixes**
   - Support for `/profile/me` route
   - URL decoding for special characters in usernames
   - Case-insensitive username lookup
   - Email-based fallback lookup

3. **Landing Page Redesign**
   - New "Platinum" aggressive theme
   - Bento grid features section
   - Scrolling brand ticker
   - Dark footer

4. **Navigation Fixes**
   - Fixed "View all" link in hero (was 404)
   - Improved profile header edit button routing

---

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests (`npm run test && npx playwright test`)
4. Create PR with description

---

## Contact

- **Repository:** Private
- **Deployment:** Vercel
- **Database:** Supabase

---

*Last updated: December 2024*
