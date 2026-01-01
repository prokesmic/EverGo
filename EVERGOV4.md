# EverGo V4 - Feature Update Documentation

> **The Global Network for Sports** - Track, Compete, Connect

**Version:** 4.0
**Last Updated:** January 2026
**Production URL:** https://evergo-nu.vercel.app

---

## Table of Contents

1. [Version 4 Overview](#1-version-4-overview)
2. [4-Scope Ranking System](#2-4-scope-ranking-system)
3. [RankStrip Component](#3-rankstrip-component)
4. [Following Feed with Tabs](#4-following-feed-with-tabs)
5. [Navigation Declutter](#5-navigation-declutter)
6. [Home Page Reorganization](#6-home-page-reorganization)
7. [Component Reference](#7-component-reference)
8. [API Changes](#8-api-changes)
9. [Changelog](#9-changelog)

---

## 1. Version 4 Overview

EverGo V4 focuses on **ranking visibility** and **social engagement**, bringing users' competitive standing to the forefront while introducing real activity feeds from followed users.

### Key V4 Features

| Feature | Description | Status |
|---------|-------------|--------|
| 4-Scope Rankings | Global, Country, City, Team ranks | Complete |
| RankStrip | Compact 2x2 ranking display in hero | Complete |
| Following Feed | Activities from self + followed users | Complete |
| Feed Tabs | Switch between Highlights and Following | Complete |
| Nav Declutter | Dropdown menus for Compete/More | Complete |
| Widget Cleanup | Removed redundant YourRankWidget | Complete |

### V4 Design Philosophy

1. **Rankings First**: Every athlete should see their competitive position immediately upon login
2. **Social Proof**: Show real activities from people you follow, not just highlights
3. **Clean Navigation**: Reduce cognitive load with organized dropdown menus
4. **Desktop Excellence**: RankStrip optimized for desktop hero area

---

## 2. 4-Scope Ranking System

V4 introduces comprehensive ranking across 4 scopes, giving athletes visibility into their standing at different levels.

### Ranking Scopes

| Scope | Icon | Description | Query Parameter |
|-------|------|-------------|-----------------|
| Global | Globe | Worldwide ranking by Sport Index | `scope=global` |
| Country | MapPin | National ranking | `scope=country&country=CZ` |
| City | Building2 | Local/city ranking | `scope=city&city=Prague` |
| Team | Users | Team-specific ranking | `scope=team&teamId=xyz` |

### Data Model

```typescript
// lib/leaderboards.ts
export type RankScopeData = {
  rank: number | null
  scopeValue: string | null
  missingField: "country" | "city" | "team" | null
}

export type UserRankScopes = {
  global: RankScopeData
  country: RankScopeData
  city: RankScopeData
  team: RankScopeData
}
```

### Server Function

```typescript
// lib/leaderboards.ts
export async function getUserRankScopes(userId: string): Promise<UserRankScopes> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
      teamMemberships: {
        include: { team: true },
        take: 1,
      },
    },
  })

  // Calculate each scope...
  return {
    global: { rank: globalRank, scopeValue: null, missingField: null },
    country: { rank: countryRank, scopeValue: user.country, missingField: !user.country ? "country" : null },
    city: { rank: cityRank, scopeValue: user.city, missingField: !user.city ? "city" : null },
    team: { rank: teamRank, scopeValue: team?.name, missingField: !team ? "team" : null },
  }
}
```

### Caching

The `getUserRankScopes` function is cached for 60 seconds using `unstable_cache`:

```typescript
export const getUserRankScopes = unstable_cache(
  _getUserRankScopes,
  ["user-rank-scopes"],
  { revalidate: 60 }
)
```

### Missing Field Handling

When a user lacks profile data for a scope, the UI shows actionable prompts:

- **No country**: "Add location"
- **No city**: "Add city"
- **No team**: "Join team"

These prompts link to relevant settings or team discovery pages.

---

## 3. RankStrip Component

The RankStrip is a desktop-only compact display showing all 4 ranking scopes in the hero overlay.

### Component Location

```
components/widgets/RankStrip.tsx
```

### Visual Design

```
┌─────────────────────────────────────┐
│  🌍 Global    │  📍 Czech Republic  │
│    #1,247     │       #89           │
├───────────────┼─────────────────────┤
│  🏢 Prague    │  👥 Team Eagles     │
│    #23        │       #3            │
└─────────────────────────────────────┘
```

### Props Interface

```typescript
interface RankStripProps {
  ranks: UserRankScopes
  className?: string
}
```

### Component Structure

```typescript
// components/widgets/RankStrip.tsx
export function RankStrip({ ranks, className }: RankStripProps) {
  return (
    <div
      className={cn("hidden lg:grid grid-cols-2 gap-1.5", className)}
      data-testid="rank-strip"
    >
      <RankPill scope="global" data={ranks.global} />
      <RankPill scope="country" data={ranks.country} />
      <RankPill scope="city" data={ranks.city} />
      <RankPill scope="team" data={ranks.team} />
    </div>
  )
}
```

### RankPill Subcomponent

Each pill displays:
- Scope icon (colored per scope)
- Scope value or label
- Rank number or missing field prompt
- Links to filtered rankings page

### Styling

- Glass-morphism: `bg-white/5 backdrop-blur-sm border border-white/10`
- Hover effects: `hover:bg-white/10 hover:-translate-y-0.5`
- Color coding per scope:
  - Global: `text-emerald-400`
  - Country: `text-sky-400`
  - City: `text-amber-400`
  - Team: `text-violet-400`

### Integration in WelcomeHero

```typescript
// components/dashboard/WelcomeHero.tsx
<RankStrip
  ranks={ranks}
  className="absolute bottom-4 right-4"
/>
```

---

## 4. Following Feed with Tabs

V4 introduces a real activity feed showing activities from the user and people they follow.

### Architecture

```
lib/feed/getFollowingFeed.ts      # Server function with caching
components/home/FollowingFeed.tsx  # Feed display component
components/home/HomeFeedTabs.tsx   # Tab switcher (client component)
```

### Data Fetching

```typescript
// lib/feed/getFollowingFeed.ts
export type FeedActivity = {
  id: string
  title: string | null
  description: string | null
  activityDate: Date
  durationSeconds: number | null
  distanceMeters: number | null
  createdAt: Date
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
  }
  discipline: {
    name: string
    slug: string
    sport: {
      name: string
      slug: string
    }
  } | null
}

export type FollowingFeedResult = {
  activities: FeedActivity[]
  followingCount: number
  hasMore: boolean
}
```

### Server Function

```typescript
async function _getFollowingFeed(
  userId: string,
  limit = 30,
  cursor?: string
): Promise<FollowingFeedResult> {
  // 1) Find who the user follows
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const followingIds = follows.map((f) => f.followingId)
  const audienceIds = [userId, ...followingIds]

  // 2) Fetch activities from audience (me + following)
  const activities = await prisma.activity.findMany({
    where: { userId: { in: audienceIds } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    // ... select fields
  })

  return {
    activities: resultActivities,
    followingCount: followingIds.length,
    hasMore,
  }
}

export const getFollowingFeed = unstable_cache(
  _getFollowingFeed,
  ["following-feed"],
  { revalidate: 30 }
)
```

### FollowingFeed Component

```typescript
// components/home/FollowingFeed.tsx
export async function FollowingFeed({ userId, className }: FollowingFeedProps) {
  const { activities, followingCount } = await getFollowingFeed(userId, 20)

  // No following - show suggestion to follow people
  if (followingCount === 0) {
    return <EmptyStateNoFollowing />
  }

  // Following people but no activities
  if (activities.length === 0) {
    return <EmptyStateNoActivities />
  }

  return (
    <section className={cn("", className)} data-testid="following-feed">
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityFeedCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  )
}
```

### Empty States

**No Following (`EmptyStateNoFollowing`):**
- Shows "Build your network" message
- Includes `SuggestedAthletes` component with `variant="list"`
- Encourages user to follow athletes

**No Activities (`EmptyStateNoActivities`):**
- Shows "No activities yet" message
- Includes "Log Activity" CTA button
- Encourages first activity

### ActivityFeedCard

Each activity card displays:
- User avatar with initials fallback
- User display name
- Relative timestamp (e.g., "2 hours ago")
- Sport name
- Activity title
- Description (2-line clamp)
- Distance and duration stats
- Links to `/activity/[id]`

### HomeFeedTabs (Client Component)

```typescript
// components/home/HomeFeedTabs.tsx
"use client"

export function HomeFeedTabs({
  highlightsContent,
  followingContent,
  className,
}: HomeFeedTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("highlights")

  return (
    <div className={cn("", className)} data-testid="home-feed-tabs">
      {/* Tab Buttons */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md",
              isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            )}
            data-testid={`feed-tab-${tab.id}`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "highlights" && highlightsContent}
        {activeTab === "following" && followingContent}
      </div>
    </div>
  )
}
```

### Tab Configuration

| Tab | Icon | Default |
|-----|------|---------|
| Highlights | Sparkles | Yes |
| Following | Users | No |

---

## 5. Navigation Declutter

V4 introduces dropdown menus to organize navigation items and reduce visual clutter.

### Desktop Navigation Changes

**Before (V3):**
```
Home | Rankings | Challenges | Rivalries | Teams | Communities | Training
```

**After (V4):**
```
Home | Rankings | Compete ▾ | More ▾
```

### Compete Dropdown Contents

| Item | Route | Icon |
|------|-------|------|
| Challenges | `/challenges` | Target |
| Rivalries | `/rivalries` | Swords |
| Team Battles | `/team-battles` | Trophy |

### More Dropdown Contents

| Item | Route | Icon |
|------|-------|------|
| Teams | `/teams` | Users |
| Communities | `/communities` | MessageCircle |
| Training Plans | `/training` | BookOpen |

### Implementation

```typescript
// components/main-nav.tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">
      Compete
      <ChevronDown className="ml-1 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem asChild>
      <Link href="/challenges">
        <Target className="mr-2 h-4 w-4" />
        Challenges
      </Link>
    </DropdownMenuItem>
    {/* ... more items */}
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 6. Home Page Reorganization

V4 restructures the home page layout to prioritize rankings and competition.

### Widget Order (V4)

```
1. WelcomeHero (Full-width)
   └── RankStrip (desktop, bottom-right overlay)

2. PulseRail (Friend activity stories)

3. Main Column (8/12)
   ├── CompeteNowDeck (Rivalries, Challenges, Battles)
   ├── HomeFeedTabs
   │   ├── Tab: Highlights (HighlightsFeed)
   │   └── Tab: Following (FollowingFeed)
   ├── CreatePostBox
   └── Feed

4. Sidebar (4/12)
   ├── CalendarWidget
   ├── PartnerFinderWidget
   └── FollowSuggestionsWrapper
```

### Removed Components

- **YourRankWidget**: Redundant after RankStrip addition
  - Showed only Global and City ranks
  - Now replaced by 4-scope RankStrip in hero

### Home Page Integration

```typescript
// app/home/page.tsx
import { FollowingFeed } from "@/components/home/FollowingFeed"
import { HomeFeedTabs } from "@/components/home/HomeFeedTabs"
import { getUserRankScopes } from "@/lib/leaderboards"

export default async function HomePage() {
  // Fetch user and ranks
  const [hero, userRanks] = await Promise.all([
    getHomeHeroForUser(user.id),
    getUserRankScopes(user.id),
  ])

  return (
    <main>
      {/* Hero with RankStrip */}
      <WelcomeHero
        {...heroProps}
        ranks={userRanks}
      />

      {/* Feed Tabs */}
      <HomeFeedTabs
        highlightsContent={<HighlightsFeed userId={user.id} />}
        followingContent={<FollowingFeed userId={user.id} />}
      />
    </main>
  )
}
```

---

## 7. Component Reference

### New Components (V4)

| Component | Type | Location |
|-----------|------|----------|
| `RankStrip` | Server | `components/widgets/RankStrip.tsx` |
| `HomeFeedTabs` | Client | `components/home/HomeFeedTabs.tsx` |
| `FollowingFeed` | Server | `components/home/FollowingFeed.tsx` |
| `ActivityFeedCard` | Server | `components/home/FollowingFeed.tsx` |
| `EmptyStateNoFollowing` | Server | `components/home/FollowingFeed.tsx` |
| `EmptyStateNoActivities` | Server | `components/home/FollowingFeed.tsx` |

### Modified Components (V4)

| Component | Changes |
|-----------|---------|
| `WelcomeHero` | Added `ranks` prop, integrated RankStrip |
| `main-nav.tsx` | Added Compete/More dropdown menus |
| `app/home/page.tsx` | Removed YourRankWidget, added feed tabs |

### Test IDs Added

| Test ID | Component |
|---------|-----------|
| `rank-strip` | RankStrip container |
| `home-feed-tabs` | HomeFeedTabs container |
| `feed-tab-highlights` | Highlights tab button |
| `feed-tab-following` | Following tab button |
| `following-feed` | FollowingFeed section |
| `following-feed-item` | Each activity card |

---

## 8. API Changes

### New Server Functions

#### `getUserRankScopes(userId: string)`

Returns 4-scope ranking data for a user.

**Location:** `lib/leaderboards.ts`

**Caching:** 60 seconds via `unstable_cache`

**Returns:**
```typescript
{
  global: { rank: number | null, scopeValue: null, missingField: null },
  country: { rank: number | null, scopeValue: string | null, missingField: "country" | null },
  city: { rank: number | null, scopeValue: string | null, missingField: "city" | null },
  team: { rank: number | null, scopeValue: string | null, missingField: "team" | null }
}
```

#### `getFollowingFeed(userId: string, limit?: number, cursor?: string)`

Returns activities from user + followed users.

**Location:** `lib/feed/getFollowingFeed.ts`

**Caching:** 30 seconds via `unstable_cache`

**Returns:**
```typescript
{
  activities: FeedActivity[],
  followingCount: number,
  hasMore: boolean
}
```

---

## 9. Changelog

### Version 4.0.0 (January 2026)

#### Features

- **feat(rankings):** Add 4-scope ranking system (Global/Country/City/Team)
- **feat(hero):** Add RankStrip component to desktop WelcomeHero
- **feat(feed):** Add Following Feed showing activities from self + followed users
- **feat(feed):** Add HomeFeedTabs for switching between Highlights and Following
- **feat(nav):** Add Compete and More dropdown menus to declutter navigation

#### Refactors

- **refactor(home):** Remove redundant YourRankWidget (replaced by RankStrip)
- **refactor(home):** Reorganize widget order for competition-first UX

#### Fixes

- **fix(feed):** Use `variant="list"` for SuggestedAthletes (was "compact")

### Recent Commits

```
a312513 feat(home): add Following Feed tab with Highlights/Following switcher
bfd36e5 refactor(home): remove redundant YourRankWidget from home page
f622d4d feat(home): show global/country/city/team ranks + desktop hero rank strip
1ccf2be ui(nav): declutter top nav with Compete/More dropdowns
```

---

## Migration Notes

### From V3 to V4

1. **Database:** No schema changes required
2. **Environment:** No new environment variables
3. **Dependencies:** No new npm packages

### Breaking Changes

- **YourRankWidget removed:** If you had custom styling for this widget, remove it
- **Feed structure:** HighlightsFeed now rendered inside HomeFeedTabs

### Upgrade Steps

```bash
# Pull latest changes
git pull origin main

# No database migration needed
# Build will include new components automatically
npm run build
```

---

## Performance Considerations

### Caching Strategy

| Function | Cache Duration | Reasoning |
|----------|----------------|-----------|
| `getUserRankScopes` | 60s | Ranks change slowly |
| `getFollowingFeed` | 30s | Activities update more frequently |

### Bundle Impact

- RankStrip: ~2KB (hidden on mobile, no mobile JS)
- HomeFeedTabs: ~1KB (client component)
- FollowingFeed: ~3KB (server-rendered)

### Database Queries

The Following Feed performs 2 queries:
1. Fetch following relationships (indexed on `followerId`)
2. Fetch activities (indexed on `userId, activityDate DESC`)

Both queries are optimized with proper indexes from V3 schema.

---

## Future Considerations

### Potential V4.1 Features

1. **Infinite scroll** for Following Feed (currently limited to 20 items)
2. **Pull-to-refresh** for mobile PWA experience
3. **Filter by sport** within Following Feed
4. **Rank notifications** when position changes significantly

### Known Limitations

- RankStrip only visible on desktop (intentional for hero real estate)
- Following Feed limited to 20 items without pagination
- Team rank only shows first team membership

---

*Documentation Version: 4.0*
*Last Updated: January 2026*
*EverGo - Track, Compete, Connect*
