# EverGo Section 2: Rankings & Sport Index

## Overview
Implement a comprehensive ranking system with global and local leaderboards, plus a personalized "Sport Index" score. This is EverGo's core differentiating feature.

---

## Database Schema

### User Stats Table
```prisma
model UserStats {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Aggregate metrics (updated after each activity)
  totalDistance   Float     @default(0)    // Total km across all sports
  totalDuration   Int       @default(0)    // Total seconds
  totalActivities Int       @default(0)
  totalCalories   Int       @default(0)
  
  // Sport Index (composite score 0-1000)
  sportIndex           Int       @default(0)
  sportIndexBest       Int       @default(0)
  sportIndexUpdatedAt  DateTime  @default(now())
  
  // Precomputed ranks (updated by background job)
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?
  
  // Location for regional rankings
  country         String?
  city            String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([sportIndex(sort: Desc)])
  @@index([country, sportIndex(sort: Desc)])
  @@index([city, sportIndex(sort: Desc)])
}
```

### Sport-Specific Stats
```prisma
model UserSportStats {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  sportId         String
  sport           Sport     @relation(fields: [sportId], references: [id])
  
  // Sport-specific metrics
  totalDistance   Float     @default(0)
  totalDuration   Int       @default(0)
  totalActivities Int       @default(0)
  bestPace        Float?    // For running/cycling (min/km)
  bestTime        Int?      // For timed events (seconds)
  bestScore       Float?    // For scored sports (golf handicap, etc.)
  
  // Sport-specific score (0-1000)
  performanceScore Int      @default(0)
  
  // Precomputed ranks for this sport
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?
  friendsRank     Int?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([userId, sportId])
  @@index([sportId, performanceScore(sort: Desc)])
  @@index([sportId, globalRank])
}
```

### Rankings Cache Table
```prisma
model RankingCache {
  id              String        @id @default(cuid())
  
  // Scope definition
  sportId         String?       // null = overall sport index
  scope           RankingScope
  scopeValue      String?       // "Prague", "Czech Republic", null for global
  period          RankingPeriod @default(ALL_TIME)
  
  // Cached leaderboard data (top 100)
  leaderboard     Json          // [{userId, rank, score, name, avatar}, ...]
  totalUsers      Int
  
  calculatedAt    DateTime      @default(now())
  
  @@unique([sportId, scope, scopeValue, period])
}

enum RankingScope {
  GLOBAL
  COUNTRY
  CITY
  FRIENDS
  TEAM
}

enum RankingPeriod {
  ALL_TIME
  THIS_YEAR
  THIS_MONTH
  THIS_WEEK
}
```

---

## Sport Index Calculation

The Sport Index is a composite score (0-1000) that represents overall athletic performance.

### Calculation Formula

```typescript
function calculateSportIndex(user: User, stats: UserStats, sportStats: UserSportStats[]): number {
  let score = 0;
  
  // 1. Activity Frequency (max 200 points)
  // Based on activities per week over last 4 weeks
  const recentActivities = getActivitiesInLastDays(user.id, 28);
  const activitiesPerWeek = recentActivities.length / 4;
  const frequencyScore = Math.min(200, activitiesPerWeek * 25); // 8+ activities/week = max
  score += frequencyScore;
  
  // 2. Performance Level (max 400 points)
  // Based on best performances in each sport compared to percentile
  let performanceScore = 0;
  for (const sportStat of sportStats) {
    const percentile = getPercentileRank(sportStat.sportId, sportStat.performanceScore);
    performanceScore += (percentile / 100) * (400 / sportStats.length);
  }
  score += performanceScore;
  
  // 3. Consistency/Streaks (max 150 points)
  const currentStreak = user.currentStreak || 0;
  const streakScore = Math.min(150, currentStreak * 5); // 30+ day streak = max
  score += streakScore;
  
  // 4. Variety Bonus (max 100 points)
  // Bonus for doing multiple sports
  const sportsCount = sportStats.length;
  const varietyScore = Math.min(100, sportsCount * 25); // 4+ sports = max
  score += varietyScore;
  
  // 5. Improvement Trend (max 100 points)
  // Compare this month vs last month
  const improvement = calculateImprovementRate(user.id);
  const improvementScore = Math.min(100, Math.max(0, improvement * 10));
  score += improvementScore;
  
  // 6. Social Engagement (max 50 points)
  // Teams, challenges completed, etc.
  const socialScore = calculateSocialScore(user.id);
  score += Math.min(50, socialScore);
  
  return Math.round(Math.min(1000, score));
}
```

### Update Triggers

Update sport index when:
1. User logs a new activity
2. Daily batch job runs (for time-based metrics)
3. User completes a challenge
4. Streak changes

---

## API Endpoints

### Get User Rankings
```typescript
// GET /api/rankings/user/:userId
// Returns all rankings for a specific user

interface UserRankingsResponse {
  sportIndex: {
    score: number;
    bestScore: number;
    global: { rank: number; total: number; percentile: number };
    country: { rank: number; total: number; percentile: number; name: string };
    city: { rank: number; total: number; percentile: number; name: string };
  };
  sports: {
    [sportSlug: string]: {
      score: number;
      global: { rank: number; total: number };
      country: { rank: number; total: number };
      city: { rank: number; total: number };
      friends: { rank: number; total: number };
    };
  };
}
```

### Get Leaderboard
```typescript
// GET /api/rankings/leaderboard
// Query params: sport, scope, scopeValue, period, page, limit

interface LeaderboardRequest {
  sport?: string;        // Sport slug, or omit for overall sport index
  scope: 'global' | 'country' | 'city' | 'friends' | 'team';
  scopeValue?: string;   // e.g., "Czech Republic" or "Prague"
  period?: 'all_time' | 'this_year' | 'this_month' | 'this_week';
  page?: number;
  limit?: number;        // Default 50
}

interface LeaderboardResponse {
  leaderboard: {
    rank: number;
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    score: number;
    trend: 'up' | 'down' | 'same';
    trendAmount: number;
    isCurrentUser: boolean;
    isFriend: boolean;
  }[];
  currentUser: {
    rank: number;
    score: number;
    nextRank: { rank: number; score: number; gap: number } | null;
    prevRank: { rank: number; score: number; userId: string; name: string } | null;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    scope: string;
    period: string;
  };
}
```

### Get Insights
```typescript
// GET /api/rankings/insights/:userId
// Returns personalized ranking insights

interface InsightsResponse {
  insights: {
    type: 'rank_up' | 'rank_down' | 'close_to_milestone' | 'friend_nearby' | 'improvement';
    message: string;
    actionText?: string;
    actionUrl?: string;
    priority: number;
  }[];
}

// Example insights:
// - "Run 5km more this week to overtake Jana in the Prague rankings!"
// - "You're just 2 spots away from the top 100 in Czech Republic!"
// - "Your Sport Index increased by 15 points this month. Keep it up!"
// - "You moved up 3 positions in the global cycling rankings!"
```

---

## UI Components

### Your Rankings Widget (Sidebar)

```jsx
function YourRankingsWidget({ rankings }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Your Rankings</h3>
        <div className="flex gap-1">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Rankings List */}
      <div className="divide-y divide-gray-50">
        {rankings.sports.map((sport) => (
          <div key={sport.slug} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sport.icon}</span>
              <div>
                <div className="font-medium text-gray-800">{sport.name}</div>
                <div className="text-sm text-gray-500">{sport.scopeName}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-gray-800">#{sport.rank.toLocaleString()}</span>
              {sport.trend === 'up' && (
                <span className="text-green-500 text-xs">↑{sport.trendAmount}</span>
              )}
              {sport.trend === 'down' && (
                <span className="text-red-500 text-xs">↓{sport.trendAmount}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Sport Index Footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-100">Your Sport Index</div>
            <div className="text-2xl font-bold">{rankings.sportIndex.score}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-100">Top {rankings.sportIndex.percentile}%</div>
            <div className="text-sm">#{rankings.sportIndex.globalRank.toLocaleString()} globally</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Ranking Bar (Profile Page)

```jsx
function RankingBar({ rankings, sport }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-8 text-white">
          {/* City Rank */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{rankings.city.rank}.</span>
            <span className="text-blue-100">in {rankings.city.name}</span>
          </div>
          
          {/* Country Rank */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{rankings.country.rank.toLocaleString()}.</span>
            <span className="text-blue-100">in {rankings.country.name}</span>
          </div>
          
          {/* Global Rank */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{rankings.global.rank.toLocaleString()}.</span>
            <span className="text-blue-100">Worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Leaderboard Page

```jsx
function LeaderboardPage() {
  const [sport, setSport] = useState('all');
  const [scope, setScope] = useState('country');
  const [period, setPeriod] = useState('all_time');
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Sport Selector */}
          <select 
            value={sport} 
            onChange={(e) => setSport(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Sports (Sport Index)</option>
            <option value="running">🏃 Running</option>
            <option value="cycling">🚴 Cycling</option>
            {/* ... more sports */}
          </select>
          
          {/* Scope Selector */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {['city', 'country', 'global', 'friends'].map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-4 py-2 text-sm font-medium ${
                  scope === s 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Period Selector */}
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all_time">All Time</option>
            <option value="this_year">This Year</option>
            <option value="this_month">This Month</option>
            <option value="this_week">This Week</option>
          </select>
        </div>
      </div>
      
      {/* Current User Position Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-blue-100 text-sm">Your Position</div>
            <div className="text-3xl font-bold">#{currentUser.rank.toLocaleString()}</div>
            <div className="text-blue-100">of {meta.total.toLocaleString()} • Top {currentUser.percentile}%</div>
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">Your Score</div>
            <div className="text-2xl font-bold">{currentUser.score}</div>
            {currentUser.nextRank && (
              <div className="text-blue-100 text-sm">
                {currentUser.nextRank.gap} pts to #{currentUser.nextRank.rank}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Athlete</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Score</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <tr 
                key={entry.userId}
                className={`${entry.isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {entry.rank === 1 && <span className="text-yellow-500">🥇</span>}
                    {entry.rank === 2 && <span className="text-gray-400">🥈</span>}
                    {entry.rank === 3 && <span className="text-amber-600">🥉</span>}
                    <span className={`font-bold ${entry.isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                      {entry.rank}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={entry.avatarUrl} name={entry.displayName} size="sm" />
                    <div>
                      <div className={`font-medium ${entry.isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                        {entry.isCurrentUser && '★ '}
                        {entry.displayName}
                      </div>
                      {entry.isFriend && (
                        <span className="text-xs text-gray-500">Friend</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.location}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">
                  {entry.score.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {entry.trend === 'up' && (
                    <span className="text-green-500 font-medium">↑{entry.trendAmount}</span>
                  )}
                  {entry.trend === 'down' && (
                    <span className="text-red-500 font-medium">↓{entry.trendAmount}</span>
                  )}
                  {entry.trend === 'same' && (
                    <span className="text-gray-400">=</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, meta.total)} of {meta.total}
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Insights Card

```jsx
function InsightsCard({ insights }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Insights</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl">
              {insight.type === 'friend_nearby' && '🏃'}
              {insight.type === 'close_to_milestone' && '🎯'}
              {insight.type === 'rank_up' && '🏆'}
              {insight.type === 'improvement' && '📈'}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm">{insight.message}</p>
              {insight.actionText && (
                <a 
                  href={insight.actionUrl}
                  className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {insight.actionText} →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Background Jobs

### Daily Ranking Recalculation

```typescript
// Run daily at 2:00 AM
async function recalculateAllRankings() {
  // 1. Recalculate all user sport indexes
  const users = await db.user.findMany({
    include: { stats: true, sportStats: true }
  });
  
  for (const user of users) {
    const newIndex = calculateSportIndex(user, user.stats, user.sportStats);
    await db.userStats.update({
      where: { userId: user.id },
      data: { 
        sportIndex: newIndex,
        sportIndexBest: Math.max(newIndex, user.stats.sportIndexBest)
      }
    });
  }
  
  // 2. Recalculate global rankings
  await recalculateRankingsForScope('GLOBAL', null);
  
  // 3. Recalculate country rankings
  const countries = await db.userStats.findMany({
    distinct: ['country'],
    select: { country: true }
  });
  for (const { country } of countries) {
    if (country) {
      await recalculateRankingsForScope('COUNTRY', country);
    }
  }
  
  // 4. Recalculate city rankings
  const cities = await db.userStats.findMany({
    distinct: ['city'],
    select: { city: true }
  });
  for (const { city } of cities) {
    if (city) {
      await recalculateRankingsForScope('CITY', city);
    }
  }
  
  // 5. Cache top 100 leaderboards
  await cacheLeaderboards();
}

async function recalculateRankingsForScope(scope: RankingScope, scopeValue: string | null) {
  const whereClause = scopeValue 
    ? { [scope.toLowerCase()]: scopeValue }
    : {};
    
  const users = await db.userStats.findMany({
    where: whereClause,
    orderBy: { sportIndex: 'desc' },
    select: { userId: true, sportIndex: true }
  });
  
  for (let i = 0; i < users.length; i++) {
    const rankField = `${scope.toLowerCase()}Rank`;
    await db.userStats.update({
      where: { userId: users[i].userId },
      data: { [rankField]: i + 1 }
    });
  }
}
```

### Real-time Updates (After Activity)

```typescript
// Trigger after new activity is logged
async function onActivityCreated(activity: Activity) {
  const userId = activity.userId;
  
  // 1. Update user stats
  await updateUserStats(userId, activity);
  
  // 2. Recalculate sport index
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { stats: true, sportStats: true }
  });
  const newIndex = calculateSportIndex(user, user.stats, user.sportStats);
  
  // 3. Check for rank changes
  const oldRank = user.stats.globalRank;
  // ... quick rank recalculation for user's immediate area
  
  // 4. Generate insights
  if (rankImproved) {
    await createInsight(userId, 'rank_up', `You moved up to #${newRank} globally!`);
  }
  
  // 5. Check for friend overtakes
  await checkFriendOvertakes(userId, newIndex);
}
```
