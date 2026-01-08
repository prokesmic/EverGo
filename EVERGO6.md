# EverGo VNext Implementation - Rankings & Leaderboards

## Overview

This document describes the EverGo VNext implementation focused on the **rivalry-first retention loop**. The core innovation is separating leaderboards into two modes (VERIFIED vs COMMUNITY) with percentile-based display to solve the "Rank #2 of 2" problem.

---

## Architecture

### Two-Mode Leaderboard System

| Mode | Description | Use Case |
|------|-------------|----------|
| **VERIFIED** | Only non-manual data sources (Strava, Garmin, sensors) | Competitive rankings, public leaderboards |
| **COMMUNITY** | Includes manual entries | Personal tracking, local/team competition |

### Eligibility Flags

Each `UserBenchmarkBest` record has scope-specific eligibility:

```prisma
model UserBenchmarkBest {
  isEligibleGlobal   Boolean @default(true)
  isEligibleCountry  Boolean @default(true)
  isEligibleCity     Boolean @default(true)
  isEligibleTeam     Boolean @default(true)
}
```

**Manual entries from onboarding:**
- `isEligibleGlobal: false`
- `isEligibleCountry: false`
- `isEligibleCity: true`
- `isEligibleTeam: true`

This ensures users can compete locally without verified data while maintaining integrity of global rankings.

---

## File Structure

```
lib/rankings/
├── types.ts          # LeaderboardMode, RankingScope, tier maps
├── eligibility.ts    # Eligibility checking functions
├── percentile.ts     # Percentile calculation & formatting
├── standings.ts      # User standings queries
├── hero-rank-lens.ts # Home page ranking snapshot (updated)
└── index.ts          # Barrel exports
```

---

## Core Types (`lib/rankings/types.ts`)

```typescript
// Leaderboard modes
export type LeaderboardMode = "VERIFIED" | "COMMUNITY"

// Ranking scopes
export type RankingScope = "global" | "country" | "city" | "team"

// Source tier levels (ordered from least to most trusted)
export const SOURCE_TIER_LEVELS = {
  MANUAL: 0,
  NON_MANUAL: 1,
  VERIFIED_ONLY: 2,
} as const

// Map verification sources to their tier level
export const SOURCE_TIER_MAP: Record<VerificationSource, number> = {
  MANUAL: SOURCE_TIER_LEVELS.MANUAL,
  STRAVA: SOURCE_TIER_LEVELS.NON_MANUAL,
  GARMIN: SOURCE_TIER_LEVELS.NON_MANUAL,
  // ... all 20 sources mapped
  OFFICIAL_RESULT: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
}

// User standing result
export interface UserStanding {
  disciplineId: string
  disciplineName: string
  sportName: string
  value: number
  unit: string
  percentile: number
  rank: number
  totalInScope: number
  isVerified: boolean
  verificationSource: VerificationSource
  achievedAt: Date
}
```

---

## Eligibility Helpers (`lib/rankings/eligibility.ts`)

### Key Functions

```typescript
// Get the tier level for a verification source
export function tierForSource(source: VerificationSource): number

// Check if a source meets the minimum tier requirement
export function meetsMinTier(minTier: MinVerificationTier, source: VerificationSource): boolean

// Get the minimum verification tier for a discipline at a given scope
export function scopeMinTier(discipline, scope: RankingScope): MinVerificationTier

// Check if a PB is eligible for rankings at a given scope and mode
export function isPbEligibleForScope(pb, discipline, scope, mode): boolean

// Check if source is considered "verified" (non-manual)
export function isVerifiedSource(source: VerificationSource): boolean

// Get display label for verification source
export function getSourceLabel(source: VerificationSource): string
```

### Usage Example

```typescript
import { isPbEligibleForScope, isVerifiedSource } from "@/lib/rankings"

// Check if a PB qualifies for country rankings in VERIFIED mode
const eligible = isPbEligibleForScope(
  { verificationSource: "STRAVA" },
  discipline,
  "country",
  "VERIFIED"
) // true

// Manual entries are excluded in VERIFIED mode
const manualEligible = isPbEligibleForScope(
  { verificationSource: "MANUAL" },
  discipline,
  "country",
  "VERIFIED"
) // false
```

---

## Percentile Calculations (`lib/rankings/percentile.ts`)

### Standard Competition Ranking

Uses "1224" tie handling - if two athletes tie for 1st, the next is 3rd (not 2nd).

```typescript
// Calculate percentile from rank and total
export function calculatePercentile(rank: number, total: number): number {
  if (total <= 0 || rank <= 0) return 0
  return Math.round(((total - rank + 1) / total) * 100)
}

// Format percentile for display
export function formatPercentile(percentile: number): string {
  if (percentile >= 99) return "Top 1%"
  if (percentile >= 95) return "Top 5%"
  if (percentile >= 90) return "Top 10%"
  if (percentile >= 75) return "Top 25%"
  if (percentile >= 50) return "Top 50%"
  return `${percentile}th percentile`
}

// Format rank with ordinal suffix
export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Format standings for display (percentile-first)
export function formatStandingsDisplay(
  rank: number,
  total: number,
  scope: RankingScope
): { primary: string; secondary: string }
```

---

## User Standings (`lib/rankings/standings.ts`)

### Get User Standings

```typescript
interface GetUserStandingsParams {
  userId: string
  sportId?: string
  scope?: RankingScope
  mode?: LeaderboardMode
  limit?: number
}

export async function getUserStandings({
  userId,
  sportId,
  scope = "global",
  mode = "VERIFIED",
  limit = 10,
}: GetUserStandingsParams): Promise<StandingsResponse>
```

### Response Structure

```typescript
interface StandingsResponse {
  standings: UserStanding[]
  sportIndex: number
  sportIndexDelta7d: number
  mode: LeaderboardMode
}
```

---

## Hero Rank Lens (`lib/rankings/hero-rank-lens.ts`)

The hero rank lens provides real-time ranking snapshots for the home page.

### Parameters

```typescript
export type HeroRankLensParams = {
  userId: string
  sportId: string
  benchmarkId: string | null // null = Sport Index leaderboard
  mode?: LeaderboardMode     // VERIFIED (default) or COMMUNITY
}
```

### Mode-Aware Filtering

The `computeBenchmarkRank` function filters by:

1. **Eligibility flags** - Uses scope-specific flags (isEligibleGlobal, isEligibleCity, etc.)
2. **Source filtering** - In VERIFIED mode, excludes MANUAL entries

```typescript
async function computeBenchmarkRank(
  value: number,
  benchmarkId: string,
  higherIsBetter: boolean,
  userFilter: Record<string, unknown>,
  scope: RankTileScope = "global",
  mode: LeaderboardMode = "COMMUNITY"
): Promise<{ rank: number; total: number }>
```

---

## AthleteRibbon Component

### Percentile-First Display

The AthleteRibbon now shows percentiles as the primary metric:

```typescript
function formatPercentileDisplay(rank: number, total: number): { primary: string; secondary: string } {
  if (total <= 0) return { primary: '--', secondary: '' }

  const percentile = ((total - rank + 1) / total) * 100
  const topPercent = 100 - percentile

  let primary: string
  if (topPercent <= 1) {
    primary = 'Top 1%'
  } else if (topPercent <= 5) {
    primary = `Top ${Math.round(topPercent)}%`
  } else if (topPercent <= 10) {
    primary = `Top ${Math.round(topPercent)}%`
  } else if (topPercent <= 25) {
    primary = `Top ${Math.round(topPercent / 5) * 5}%`
  } else if (topPercent <= 50) {
    primary = `Top ${Math.round(topPercent / 10) * 10}%`
  } else {
    primary = `${Math.round(percentile)}th`
  }

  // Secondary shows rank context
  const secondary = `#${rank.toLocaleString()} of ${total.toLocaleString()}`

  return { primary, secondary }
}
```

### Before vs After

| Before | After |
|--------|-------|
| Rank #2 of 2 | 50th percentile (#2 of 2) |
| Rank #1 of 100 | Top 1% (#1 of 100) |
| Rank #5 of 50 | Top 10% (#5 of 50) |

---

## Onboarding Integration

### Benchmark Creation

When a user completes onboarding with a benchmark:

```typescript
await tx.userBenchmarkBest.upsert({
  create: {
    userId: user.id,
    benchmarkId: benchmark.id,
    value: data.initialBenchmark.value,
    achievedAt: new Date(),
    source: "MANUAL",
    verificationStatus: "UNVERIFIED",
    // Eligibility flags for manual entry
    isEligibleGlobal: false,
    isEligibleCountry: false,
    isEligibleCity: true,    // Allow city rank
    isEligibleTeam: true,    // Allow team rank
  },
  // ...
})
```

### Sport Index Initialization

```typescript
await tx.userStats.upsert({
  create: {
    userId: user.id,
    sportIndex: data.initialBenchmark ? 100 : 0, // Boost for benchmark entry
    // ...
  },
})
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        ONBOARDING                               │
├─────────────────────────────────────────────────────────────────┤
│  User enters benchmark → UserBenchmarkBest created              │
│  • source: MANUAL                                               │
│  • isEligibleGlobal: false                                      │
│  • isEligibleCity: true                                         │
│  • isEligibleTeam: true                                         │
│  • UserStats.sportIndex: 100                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        HOME PAGE                                │
├─────────────────────────────────────────────────────────────────┤
│  getHeroRankLensSnapshot({ userId, sportId, mode: "COMMUNITY" })│
│  │                                                              │
│  ├── getSportIndexRankTiles()                                   │
│  │   └── Returns Sport Index (always available)                 │
│  │                                                              │
│  └── getBenchmarkRankTiles(mode)                                │
│      └── computeBenchmarkRank(scope, mode)                      │
│          ├── Filters by eligibility flags                       │
│          └── VERIFIED mode excludes MANUAL                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ATHLETE RIBBON                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Sport Index   │ │  Global  │ │ Country  │ │   City   │      │
│  │    127/1000   │ │    --    │ │    --    │ │  Top 5%  │      │
│  │   +12 week    │ │ (unlock) │ │ (unlock) │ │ #3 of 58 │      │
│  └───────────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Usage

### Getting User Standings

```typescript
import { getUserStandings } from "@/lib/rankings"

// Get VERIFIED standings (competitive)
const verifiedStandings = await getUserStandings({
  userId: "user_123",
  sportId: "running",
  scope: "global",
  mode: "VERIFIED",
  limit: 10,
})

// Get COMMUNITY standings (includes manual)
const communityStandings = await getUserStandings({
  userId: "user_123",
  sportId: "running",
  scope: "city",
  mode: "COMMUNITY",
  limit: 10,
})
```

### Checking Eligibility

```typescript
import { isPbEligibleForScope, isVerifiedSource } from "@/lib/rankings"

const pb = { verificationSource: "STRAVA" }

// Is this PB eligible for global VERIFIED rankings?
const eligible = isPbEligibleForScope(pb, discipline, "global", "VERIFIED")

// Is this a verified source?
const verified = isVerifiedSource(pb.verificationSource)
```

### Formatting Display

```typescript
import { formatPercentile, formatStandingsDisplay } from "@/lib/rankings"

// Simple percentile format
const label = formatPercentile(95) // "Top 5%"

// Full standings display
const display = formatStandingsDisplay(5, 100, "global")
// { primary: "Top 5%", secondary: "#5 of 100" }
```

---

## Database Schema Extensions

### UserStats (existing, extended)

```prisma
model UserStats {
  sportIndex           Int       @default(0)
  sportIndexBest       Int       @default(0)
  sportIndexDelta7d    Int       @default(0)     // 7-day change
  sportIndexUpdatedAt  DateTime  @default(now())
}
```

### UserBenchmarkBest (existing, uses eligibility flags)

```prisma
model UserBenchmarkBest {
  id                 String   @id @default(cuid())
  userId             String
  benchmarkId        String
  value              Float
  achievedAt         DateTime
  source             BenchmarkSource
  verificationStatus VerificationStatus

  // Eligibility flags per scope
  isEligibleGlobal   Boolean @default(true)
  isEligibleCountry  Boolean @default(true)
  isEligibleCity     Boolean @default(true)
  isEligibleTeam     Boolean @default(true)
}
```

---

## Testing

### Unit Tests

```typescript
describe("Percentile Calculations", () => {
  it("calculates correct percentile", () => {
    expect(calculatePercentile(1, 100)).toBe(100)  // #1 of 100 = 100th percentile
    expect(calculatePercentile(50, 100)).toBe(51)  // #50 of 100 = 51st percentile
    expect(calculatePercentile(100, 100)).toBe(1)  // #100 of 100 = 1st percentile
  })

  it("formats percentile correctly", () => {
    expect(formatPercentile(99)).toBe("Top 1%")
    expect(formatPercentile(95)).toBe("Top 5%")
    expect(formatPercentile(50)).toBe("Top 50%")
    expect(formatPercentile(25)).toBe("25th percentile")
  })
})

describe("Eligibility", () => {
  it("excludes manual entries in VERIFIED mode", () => {
    const pb = { verificationSource: "MANUAL" }
    expect(isPbEligibleForScope(pb, discipline, "global", "VERIFIED")).toBe(false)
  })

  it("includes manual entries in COMMUNITY mode", () => {
    const pb = { verificationSource: "MANUAL" }
    expect(isPbEligibleForScope(pb, discipline, "city", "COMMUNITY")).toBe(true)
  })
})
```

---

## Migration Notes

### From Previous Version

1. **No breaking changes** - All existing functionality preserved
2. **Default mode is COMMUNITY** - Existing behavior unchanged
3. **Eligibility flags** - Already exist in schema, now actively used

### Future Enhancements

1. **Mode toggle UI** - Allow users to switch between VERIFIED and COMMUNITY views
2. **Per-discipline tier requirements** - Use `minTierGlobal`, `minTierCountry` etc.
3. **Verification prompts** - Encourage users to connect Strava/Garmin for VERIFIED rankings

---

## Summary

The EverGo VNext implementation provides:

1. **Two-mode leaderboard system** (VERIFIED vs COMMUNITY)
2. **Scope-specific eligibility** (global, country, city, team)
3. **Percentile-first display** (fixes "Rank #2 of 2" problem)
4. **Non-empty ribbon guarantee** (Sport Index always shows)
5. **Mode-aware filtering** (eligibility flags + source filtering)

This creates a fair competitive environment where:
- New users can compete locally with manual entries
- Serious athletes compete globally with verified data
- Everyone sees meaningful percentile-based rankings
