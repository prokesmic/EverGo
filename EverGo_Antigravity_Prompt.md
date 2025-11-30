# EverGo - Sports Social Network

## App Description

Build **EverGo**, a social network for athletes and active people. It's like Facebook meets Strava - combining social networking with sports performance tracking. The key differentiator is **real-time rankings** that show users how they compare to others in their city, country, and worldwide.

**Tagline**: "The global network for sports and active lifestyle"

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js (Google, Facebook, Apple, Email)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State**: Zustand
- **Charts**: Recharts
- **Maps**: Mapbox GL JS
- **File Storage**: Uploadthing or S3
- **Real-time**: Pusher or Socket.io

---

## Design System

### Colors
```css
--primary-blue: #0078D4
--primary-blue-dark: #005A9E
--accent-green: #00A651
--accent-green-dark: #008C45
--background: #F5F5F5
--card-background: #FFFFFF
--text-primary: #1A1A1A
--text-secondary: #666666
--border: #E0E0E0
--ranking-gold: #FFD700
--ranking-silver: #C0C0C0
--ranking-bronze: #CD7F32
```

### Typography
```css
--font-heading: 'Inter', sans-serif
--font-body: 'Inter', sans-serif
--font-stats: 'JetBrains Mono', monospace
```

### Layout
- Max content width: 1200px
- Card border-radius: 8px
- Standard padding: 16px
- Card shadows: subtle (0 2px 4px rgba(0,0,0,0.1))

---

## Database Schema

### Users
```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  username        String    @unique
  displayName     String
  avatarUrl       String?
  coverPhotoUrl   String?
  bio             String?
  city            String?
  country         String?
  dateOfBirth     DateTime?
  gender          Gender?
  privacyLevel    PrivacyLevel @default(PUBLIC)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  sports          UserSport[]
  activities      Activity[]
  personalRecords PersonalRecord[]
  rankings        Ranking[]
  posts           Post[]
  comments        Comment[]
  reactions       Reaction[]
  followers       Follow[]  @relation("following")
  following       Follow[]  @relation("follower")
  teamMemberships TeamMember[]
  sentFriendRequests     FriendRequest[] @relation("requester")
  receivedFriendRequests FriendRequest[] @relation("addressee")
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_SAY
}

enum PrivacyLevel {
  PUBLIC
  FRIENDS_ONLY
  PRIVATE
}
```

### Sports & Disciplines
```prisma
model Sport {
  id              String    @id @default(cuid())
  name            String    @unique
  slug            String    @unique
  icon            String
  category        SportCategory
  hasGpsTracking  Boolean   @default(false)
  
  disciplines     Discipline[]
  userSports      UserSport[]
  teams           Team[]
}

enum SportCategory {
  INDIVIDUAL
  TEAM
  INDOOR
  OUTDOOR
}

model Discipline {
  id              String    @id @default(cuid())
  sportId         String
  sport           Sport     @relation(fields: [sportId], references: [id])
  name            String
  slug            String
  measurementType MeasurementType
  primaryMetric   String
  rankingFormula  String
  lowerIsBetter   Boolean   @default(true)
  
  activities      Activity[]
  personalRecords PersonalRecord[]
  rankings        Ranking[]
  
  @@unique([sportId, slug])
}

enum MeasurementType {
  TIME
  DISTANCE
  SCORE
  POINTS
  WEIGHT
  COMPOSITE
}

model UserSport {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sportId     String
  sport       Sport     @relation(fields: [sportId], references: [id])
  isPrimary   Boolean   @default(false)
  skillLevel  SkillLevel?
  startedAt   DateTime?
  createdAt   DateTime  @default(now())
  
  @@unique([userId, sportId])
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  PROFESSIONAL
}
```

### Activities
```prisma
model Activity {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  disciplineId    String
  discipline      Discipline @relation(fields: [disciplineId], references: [id])
  
  title           String
  description     String?
  activityDate    DateTime
  durationSeconds Int?
  distanceMeters  Float?
  elevationGain   Float?
  caloriesBurned  Int?
  avgHeartRate    Int?
  maxHeartRate    Int?
  
  primaryValue    Float       // The main result (time in seconds, score, etc.)
  
  gpsRoute        Json?
  photos          String[]
  
  source          ActivitySource @default(MANUAL)
  externalId      String?
  visibility      PrivacyLevel @default(PUBLIC)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  post            Post?
  
  @@index([userId, activityDate])
  @@index([disciplineId])
}

enum ActivitySource {
  MANUAL
  STRAVA
  GARMIN
  FITBIT
  APPLE_HEALTH
  GOOGLE_FIT
}
```

### Rankings
```prisma
model Ranking {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  disciplineId    String
  discipline      Discipline @relation(fields: [disciplineId], references: [id])
  
  scope           RankingScope
  scopeIdentifier String      // e.g., "Prague", "Czech Republic", "worldwide"
  
  position        Int
  totalParticipants Int
  percentile      Float
  score           Float
  
  period          RankingPeriod
  periodValue     String?     // e.g., "2024", "2024-03"
  
  calculatedAt    DateTime  @default(now())
  
  @@unique([userId, disciplineId, scope, scopeIdentifier, period, periodValue])
  @@index([disciplineId, scope, scopeIdentifier, period])
}

enum RankingScope {
  CITY
  REGION
  COUNTRY
  CONTINENT
  WORLDWIDE
}

enum RankingPeriod {
  ALL_TIME
  YEARLY
  MONTHLY
  WEEKLY
}

model PersonalRecord {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  disciplineId    String
  discipline      Discipline @relation(fields: [disciplineId], references: [id])
  
  recordType      String      // e.g., "5K_TIME", "MARATHON_TIME"
  value           Float
  unit            String
  achievedAt      DateTime
  activityId      String?
  
  @@unique([userId, disciplineId, recordType])
}
```

### Social Features
```prisma
model Follow {
  id          String    @id @default(cuid())
  followerId  String
  follower    User      @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User      @relation("following", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  
  @@unique([followerId, followingId])
}

model FriendRequest {
  id          String    @id @default(cuid())
  requesterId String
  requester   User      @relation("requester", fields: [requesterId], references: [id], onDelete: Cascade)
  addresseeId String
  addressee   User      @relation("addressee", fields: [addresseeId], references: [id], onDelete: Cascade)
  status      FriendRequestStatus @default(PENDING)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([requesterId, addresseeId])
}

enum FriendRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
}

model Post {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  postType    PostType
  content     String?
  photos      String[]
  
  activityId  String?   @unique
  activity    Activity? @relation(fields: [activityId], references: [id])
  
  visibility  PrivacyLevel @default(PUBLIC)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  comments    Comment[]
  reactions   Reaction[]
}

enum PostType {
  ACTIVITY
  ACHIEVEMENT
  MILESTONE
  TEXT
  PHOTO
}

model Comment {
  id        String    @id @default(cuid())
  postId    String
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  content   String
  createdAt DateTime  @default(now())
}

model Reaction {
  id           String    @id @default(cuid())
  postId       String
  post         Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  reactionType ReactionType
  createdAt    DateTime  @default(now())
  
  @@unique([postId, userId])
}

enum ReactionType {
  LIKE
  KUDOS
  FIRE
  STRONG
  IMPRESSIVE
}
```

### Teams & Communities
```prisma
model Team {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  sportId       String
  sport         Sport     @relation(fields: [sportId], references: [id])
  logoUrl       String?
  coverPhotoUrl String?
  location      String?
  teamType      TeamType
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  
  members       TeamMember[]
}

enum TeamType {
  CLUB
  CASUAL
  PROFESSIONAL
}

model TeamMember {
  id          String    @id @default(cuid())
  teamId      String
  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        TeamRole
  jerseyNumber String?
  position    String?
  joinedAt    DateTime  @default(now())
  
  @@unique([teamId, userId])
}

enum TeamRole {
  OWNER
  ADMIN
  COACH
  CAPTAIN
  MEMBER
}
```

---

## Seed Data: Sports & Disciplines

```typescript
const sportsData = [
  {
    name: "Running",
    slug: "running",
    icon: "🏃",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "5K", slug: "5k", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "10K", slug: "10k", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Half Marathon", slug: "half-marathon", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Marathon", slug: "marathon", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Trail Running", slug: "trail", measurementType: "COMPOSITE", primaryMetric: "performance_index", lowerIsBetter: false },
    ]
  },
  {
    name: "Cycling",
    slug: "cycling",
    icon: "🚴",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Road Cycling", slug: "road", measurementType: "COMPOSITE", primaryMetric: "ftp_w_kg", lowerIsBetter: false },
      { name: "Mountain Biking", slug: "mtb", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Gravel", slug: "gravel", measurementType: "COMPOSITE", primaryMetric: "endurance_score", lowerIsBetter: false },
      { name: "Track Cycling", slug: "track", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Swimming",
    slug: "swimming",
    icon: "🏊",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Freestyle", slug: "freestyle", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Breaststroke", slug: "breaststroke", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Butterfly", slug: "butterfly", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Open Water", slug: "open-water", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Golf",
    slug: "golf",
    icon: "⛳",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Stroke Play", slug: "stroke-play", measurementType: "SCORE", primaryMetric: "handicap", lowerIsBetter: true },
      { name: "Match Play", slug: "match-play", measurementType: "SCORE", primaryMetric: "win_percentage", lowerIsBetter: false },
      { name: "Driving Distance", slug: "driving", measurementType: "DISTANCE", primaryMetric: "avg_distance", lowerIsBetter: false },
    ]
  },
  {
    name: "Tennis",
    slug: "tennis",
    icon: "🎾",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Singles", slug: "singles", measurementType: "SCORE", primaryMetric: "utr_rating", lowerIsBetter: false },
      { name: "Doubles", slug: "doubles", measurementType: "SCORE", primaryMetric: "utr_rating", lowerIsBetter: false },
      { name: "Clay Court", slug: "clay", measurementType: "SCORE", primaryMetric: "rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Football",
    slug: "football",
    icon: "⚽",
    category: "TEAM",
    hasGpsTracking: true,
    disciplines: [
      { name: "Outfield Player", slug: "outfield", measurementType: "COMPOSITE", primaryMetric: "performance_score", lowerIsBetter: false },
      { name: "Goalkeeper", slug: "goalkeeper", measurementType: "COMPOSITE", primaryMetric: "goalkeeper_score", lowerIsBetter: false },
      { name: "Futsal", slug: "futsal", measurementType: "COMPOSITE", primaryMetric: "rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Basketball",
    slug: "basketball",
    icon: "🏀",
    category: "TEAM",
    hasGpsTracking: false,
    disciplines: [
      { name: "5v5", slug: "5v5", measurementType: "COMPOSITE", primaryMetric: "per_rating", lowerIsBetter: false },
      { name: "3v3", slug: "3v3", measurementType: "COMPOSITE", primaryMetric: "rating", lowerIsBetter: false },
      { name: "Streetball", slug: "streetball", measurementType: "COMPOSITE", primaryMetric: "community_rating", lowerIsBetter: false },
    ]
  },
  {
    name: "Triathlon",
    slug: "triathlon",
    icon: "🏊🚴🏃",
    category: "INDIVIDUAL",
    hasGpsTracking: true,
    disciplines: [
      { name: "Sprint", slug: "sprint", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Olympic", slug: "olympic", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Ironman 70.3", slug: "70.3", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
      { name: "Ironman", slug: "ironman", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
  {
    name: "Fitness",
    slug: "fitness",
    icon: "💪",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "CrossFit", slug: "crossfit", measurementType: "COMPOSITE", primaryMetric: "level", lowerIsBetter: false },
      { name: "Powerlifting", slug: "powerlifting", measurementType: "WEIGHT", primaryMetric: "wilks_score", lowerIsBetter: false },
      { name: "Olympic Weightlifting", slug: "olympic-lifting", measurementType: "WEIGHT", primaryMetric: "sinclair_total", lowerIsBetter: false },
      { name: "Functional Fitness", slug: "functional", measurementType: "COMPOSITE", primaryMetric: "fitness_score", lowerIsBetter: false },
    ]
  },
  {
    name: "Climbing",
    slug: "climbing",
    icon: "🧗",
    category: "INDIVIDUAL",
    hasGpsTracking: false,
    disciplines: [
      { name: "Bouldering", slug: "bouldering", measurementType: "SCORE", primaryMetric: "v_grade", lowerIsBetter: false },
      { name: "Sport Climbing", slug: "sport", measurementType: "SCORE", primaryMetric: "yds_grade", lowerIsBetter: false },
      { name: "Trad Climbing", slug: "trad", measurementType: "SCORE", primaryMetric: "grade", lowerIsBetter: false },
      { name: "Speed Climbing", slug: "speed", measurementType: "TIME", primaryMetric: "time", lowerIsBetter: true },
    ]
  },
];
```

---

## Pages & Routes

### Public Routes
```
/                     → Landing page (if not logged in) or Home Feed (if logged in)
/login                → Login page
/register             → Registration page
/forgot-password      → Password reset
/@{username}          → Public profile view
/rankings/{sport}     → Public leaderboards
```

### Protected Routes (require authentication)
```
/home                 → Main feed
/profile              → Own profile (redirect to /@{username})
/profile/edit         → Edit profile
/settings             → Account settings

/activity/new         → Log new activity
/activity/{id}        → Activity detail
/activity/{id}/edit   → Edit activity

/rankings             → Rankings hub
/rankings/{sport}/{discipline}  → Specific leaderboard

/friends              → Friends list
/friends/requests     → Friend requests
/friends/find         → Find friends

/teams                → Teams list
/teams/{slug}         → Team page
/teams/create         → Create team

/search               → Search page

/notifications        → Notifications
/messages             → Direct messages
```

---

## Page Specifications

### 1. Profile Page (`/@{username}`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  COVER PHOTO (full width, 300px height)                     │
│  ┌──────────┐                                               │
│  │  AVATAR  │  Display Name                                 │
│  │  (120px) │  @username • Primary Sport • Location         │
│  └──────────┘  [Follow] [Message] [•••]                     │
├─────────────────────────────────────────────────────────────┤
│  SPORT TABS: [ Running ✓ ] [ Cycling ] [ Golf ] [ + Add ]   │
├─────────────────────────────────────────────────────────────┤
│  RANKING BAR (blue background):                             │
│  🏆 32. in Prague  │  🏆 423. in Czech Republic  │  🏆 22,453. Worldwide │
├─────────────────────────────────────────────────────────────┤
│  STATS ROW:                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │Best Time│ │In Air   │ │5K       │ │10K      │ │Total   ││
│  │8.63m    │ │7 sec    │ │3 min    │ │8.5 min  │ │2 hrs   ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────────┘│
├─────────────────────────────────────────────────────────────┤
│  LEFT (30%)           │  CENTER (45%)      │  RIGHT (25%)   │
│  ┌─────────────────┐  │  ┌───────────────┐ │  ┌──────────┐  │
│  │Activities       │  │  │Activity Card  │ │  │Calendar  │  │
│  │Summary          │  │  │with photo     │ │  │          │  │
│  │                 │  │  │               │ │  │ ● Events │  │
│  │🏃 60km | 25:12  │  │  │Title, stats,  │ │  │          │  │
│  │🚴 313km| 3h56   │  │  │reactions      │ │  ├──────────┤  │
│  ├─────────────────┤  │  └───────────────┘ │  │Favorite  │  │
│  │Results          │  │  ┌───────────────┐ │  │Brands    │  │
│  │                 │  │  │Another        │ │  │Nike ASICS│  │
│  │1. Event Name    │  │  │Activity Card  │ │  ├──────────┤  │
│  │2. Event Name    │  │  │               │ │  │Teams &   │  │
│  │...              │  │  │               │ │  │Community │  │
│  └─────────────────┘  │  └───────────────┘ │  │[logos]   │  │
│                       │                    │  └──────────┘  │
└───────────────────────┴────────────────────┴────────────────┘
```

**Components needed:**
- `CoverPhoto` - editable cover image
- `ProfileHeader` - avatar, name, stats, action buttons
- `SportTabs` - horizontal tabs for switching sports
- `RankingBar` - displays rankings with trophy icons
- `StatsRow` - key metrics for selected sport
- `ActivitySummary` - aggregated stats by sport
- `ResultsList` - competition results
- `ActivityFeed` - paginated activity cards
- `ProfileCalendar` - upcoming events
- `FavoriteBrands` - brand logos
- `TeamsSection` - team memberships

---

### 2. Home Feed (`/home`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Home | Profile | Rankings | Search | [+]   │
├─────────────────────────────────────────────────────────────┤
│  LEFT (25%)           │  CENTER (50%)      │  RIGHT (25%)   │
│  ┌─────────────────┐  │  ┌───────────────┐ │  ┌──────────┐  │
│  │Your Rankings    │  │  │Create Post    │ │  │Your      │  │
│  │Today            │  │  │[What's new?]  │ │  │Ranking   │  │
│  │                 │  │  │[📷][📍][🏆]   │ │  │Updates   │  │
│  │🏃 #32 Prague    │  │  └───────────────┘ │  │          │  │
│  │🏌️ #45 CR       │  │                    │  │↑3 Running│  │
│  ├─────────────────┤  │  ┌───────────────┐ │  │=  Golf   │  │
│  │This Week        │  │  │POST CARD      │ │  ├──────────┤  │
│  │                 │  │  │               │ │  │Insights  │  │
│  │3 activities     │  │  │[Avatar] Name  │ │  │          │  │
│  │45km             │  │  │Just finished  │ │  │Run 15km  │  │
│  │4h 23min         │  │  │a marathon!    │ │  │to beat   │  │
│  ├─────────────────┤  │  │               │ │  │Jana!     │  │
│  │Active           │  │  │🏃 42.2km      │ │  ├──────────┤  │
│  │Challenges       │  │  │⏱️ 3:24:56     │ │  │Suggested │  │
│  │                 │  │  │               │ │  │Friends   │  │
│  │May Running      │  │  │👍 234  💬 45  │ │  │          │  │
│  │[████░░] 67%     │  │  └───────────────┘ │  │[Avatar]  │  │
│  └─────────────────┘  │                    │  │Name      │  │
│                       │  [More posts...]   │  │[+ Add]   │  │
│                       │                    │  └──────────┘  │
└───────────────────────┴────────────────────┴────────────────┘
```

**Components needed:**
- `CreatePostBox` - text input with media buttons
- `PostCard` - activity/text posts with reactions
- `QuickStats` - sidebar stats widget
- `RankingWidget` - current rankings mini view
- `InsightsWidget` - personalized tips
- `SuggestedFriends` - friend recommendations
- `ChallengesWidget` - active challenges progress

---

### 3. Rankings Page (`/rankings/{sport}/{discipline}`)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  RANKINGS - RUNNING - MARATHON                              │
├─────────────────────────────────────────────────────────────┤
│  FILTERS:                                                    │
│  Sport: [Running ▼]  Discipline: [Marathon ▼]               │
│  Scope: (●) City  (○) Country  (○) Worldwide                │
│  Period: [All Time ▼]  Gender: [All ▼]  Age: [All ▼]        │
├─────────────────────────────────────────────────────────────┤
│  YOUR POSITION CARD:                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ #127 of 3,456 • Top 4%                                 │ │
│  │ Your Best: 3:24:56 • Next Target: #126 (3:24:12)       │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  LEADERBOARD TABLE:                                          │
│  ┌────┬───────────────────────────┬──────────┬───────┬─────┐│
│  │ #  │ Athlete                   │ Location │ Best  │Trend││
│  ├────┼───────────────────────────┼──────────┼───────┼─────┤│
│  │ 1  │ 🥇 Karel Novák [avatar]   │ Prague   │2:18:34│ =   ││
│  │ 2  │ 🥈 Jan Běžec [avatar]     │ Brno     │2:21:45│ ↑2  ││
│  │ 3  │ 🥉 Petr Rychlý [avatar]   │ Ostrava  │2:24:12│ ↓1  ││
│  │... │                           │          │       │     ││
│  │127 │ ★ YOU (highlighted row)   │ Prague   │3:24:56│ ↑4  ││
│  └────┴───────────────────────────┴──────────┴───────┴─────┘│
│                                                              │
│  [Load More]                                                 │
├─────────────────────────────────────────────────────────────┤
│  STATS BAR:                                                  │
│  Total: 3,456 │ Avg: 4:12:34 │ Your %ile: Top 4%            │
└─────────────────────────────────────────────────────────────┘
```

**Components needed:**
- `RankingFilters` - dropdowns and radio buttons
- `UserPositionCard` - highlighted current user stats
- `LeaderboardTable` - sortable, paginated table
- `RankingRow` - individual athlete row
- `TrendIndicator` - up/down arrows with change
- `StatsBar` - aggregate statistics

---

### 4. Activity Detail Page (`/activity/{id}`)

**Sections:**
1. Header with title, date, sport icon
2. Key metrics row (distance, time, pace, elevation, calories)
3. Map with GPS route (if available)
4. Splits/Laps table
5. Heart rate chart over time
6. Elevation profile chart
7. Photos gallery
8. Comments section
9. Related activities

---

### 5. Create Activity Page (`/activity/new`)

**Form Fields:**
- Sport (dropdown)
- Discipline (dropdown, filtered by sport)
- Title (text)
- Date & Time (datetime picker)
- Duration (time input HH:MM:SS)
- Distance (number + unit)
- Primary result value (depends on discipline)
- Description (textarea)
- Photos (file upload, multiple)
- GPS file upload (optional .gpx/.fit)
- Visibility (public/friends/private)

---

## Key Components Library

### Navigation
- `MainNav` - top navigation bar
- `MobileNav` - bottom tab bar for mobile
- `SportSelector` - sport switching dropdown

### User
- `Avatar` - user avatar with size variants
- `UserCard` - compact user info card
- `UserRow` - user row for lists
- `FollowButton` - follow/unfollow toggle

### Activity
- `ActivityCard` - feed card with activity details
- `ActivityStats` - stat pills (distance, time, etc.)
- `ActivityMap` - map with route
- `ActivityPhotos` - photo gallery

### Social
- `PostCard` - social post with reactions
- `CommentSection` - comments list with input
- `ReactionBar` - reaction buttons
- `ShareButton` - share modal trigger

### Rankings
- `RankingBadge` - trophy icon with position
- `RankingBar` - horizontal ranking display
- `LeaderboardRow` - table row
- `TrendArrow` - up/down indicator

### Forms
- `SportSelect` - sport dropdown
- `DisciplineSelect` - discipline dropdown
- `DurationInput` - HH:MM:SS input
- `DistanceInput` - number with unit toggle

### Layout
- `PageContainer` - max-width wrapper
- `Card` - standard card component
- `Sidebar` - collapsible sidebar
- `StatWidget` - small stat display

---

## API Routes

### Auth
```typescript
POST /api/auth/register     // Create account
POST /api/auth/login        // Login
POST /api/auth/logout       // Logout
GET  /api/auth/me           // Current user
```

### Users
```typescript
GET    /api/users/:username              // Get profile
PUT    /api/users/:username              // Update profile
GET    /api/users/:username/activities   // User activities
GET    /api/users/:username/rankings     // User rankings
GET    /api/users/:username/stats        // User statistics
POST   /api/users/:username/follow       // Follow user
DELETE /api/users/:username/follow       // Unfollow user
```

### Activities
```typescript
GET    /api/activities                  // List (with filters)
POST   /api/activities                  // Create
GET    /api/activities/:id              // Get one
PUT    /api/activities/:id              // Update
DELETE /api/activities/:id              // Delete
POST   /api/activities/:id/photos       // Add photos
```

### Rankings
```typescript
GET /api/rankings/:sport/:discipline    // Leaderboard
    ?scope=city|country|worldwide
    &scopeId=prague
    &period=all_time|yearly|monthly
    &gender=all|male|female
    &page=1
    &limit=50

GET /api/rankings/user/:username        // All user rankings
```

### Feed
```typescript
GET  /api/feed                          // Main feed
POST /api/posts                         // Create post
GET  /api/posts/:id                     // Get post
POST /api/posts/:id/comments            // Add comment
POST /api/posts/:id/reactions           // Add reaction
```

### Teams
```typescript
GET    /api/teams                       // List teams
POST   /api/teams                       // Create team
GET    /api/teams/:slug                 // Get team
PUT    /api/teams/:slug                 // Update team
POST   /api/teams/:slug/join            // Join team
DELETE /api/teams/:slug/leave           // Leave team
```

### Search
```typescript
GET /api/search
    ?q=query
    &type=users|teams|activities
    &sport=running
```

---

## Key Features to Implement

### 1. Real-time Rankings (CORE FEATURE)
- Calculate rankings when activities are added
- Cache rankings in Redis or database
- Show position changes (trends)
- Multiple scopes: city → country → worldwide
- Multiple periods: all-time, yearly, monthly

### 2. Activity Sync (Important)
- Manual activity entry form
- Strava OAuth integration
- Import GPX/FIT files
- Prevent duplicates via external_id

### 3. Social Feed
- Follow users
- Like/react to posts
- Comment on activities
- Share achievements

### 4. Profile Sports Switching
- Users can have multiple sports
- Tab-based interface to switch
- Each sport shows different rankings/stats

### 5. Gamification
- Achievements/badges
- Personal records tracking
- Milestones (100th run, etc.)
- Challenges

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile Adaptations
- Bottom tab navigation instead of top nav
- Single column layout
- Collapsible sidebars
- Swipeable sport tabs
- Pull-to-refresh on feeds

---

## Performance Considerations

1. **Infinite scroll** for feeds and rankings
2. **Image optimization** with Next.js Image component
3. **Lazy loading** for off-screen content
4. **Caching** rankings queries (they don't change often)
5. **Optimistic updates** for likes/follows

---

## Launch MVP Scope

**Phase 1 (MVP):**
- User registration/login
- Profile creation with 1-3 sports
- Manual activity logging
- Basic rankings (city + country)
- Follow users
- Simple feed
- 5 sports: Running, Cycling, Golf, Swimming, Fitness

**Phase 2:**
- Strava integration
- Teams feature
- Full worldwide rankings
- Achievements
- All 10 sports

---

## Summary

EverGo is a **social-first sports network** that:

1. Creates a unified **sports identity** profile
2. Shows real-time **rankings** from local to global
3. Connects athletes through a **social feed**
4. Supports **multiple sports** per user
5. Motivates through **competition and achievements**

The key differentiator from Strava: **social networking + rankings across all sports**.

Build this as a modern Next.js app with clean UI, fast performance, and mobile-first design.
