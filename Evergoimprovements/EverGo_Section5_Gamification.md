# EverGo Section 5: Challenges, Streaks & Badges

## Overview
Implement gamification elements including challenges, activity streaks, and achievement badges to motivate users and reward engagement.

---

## Database Schema

### Challenges
```prisma
model Challenge {
  id              String          @id @default(cuid())
  
  // Basic info
  title           String
  description     String
  imageUrl        String?
  
  // Duration
  startDate       DateTime
  endDate         DateTime
  
  // Target
  targetType      ChallengeTarget
  targetValue     Float           // e.g., 50 for "Run 50km"
  targetUnit      String          // e.g., "km", "workouts", "minutes"
  
  // Sport filter (optional)
  sportId         String?
  sport           Sport?          @relation(fields: [sportId], references: [id])
  
  // Scope
  scope           ChallengeScope  @default(GLOBAL)
  teamId          String?         // If team-specific
  communityId     String?         // If community-specific
  
  // Reward
  badgeId         String?         // Badge awarded on completion
  badge           Badge?          @relation(fields: [badgeId], references: [id])
  
  // Sponsorship
  sponsorName     String?
  sponsorLogoUrl  String?
  sponsorReward   String?         // e.g., "10% off Nike shoes"
  
  // Status
  isActive        Boolean         @default(true)
  
  createdAt       DateTime        @default(now())
  
  participants    ChallengeParticipant[]
  
  @@index([isActive, endDate])
  @@index([sportId])
}

enum ChallengeTarget {
  DISTANCE        // Total distance
  DURATION        // Total time
  ACTIVITIES      // Number of workouts
  CALORIES        // Calories burned
  ELEVATION       // Elevation gain
  STREAK          // Consecutive days
}

enum ChallengeScope {
  GLOBAL
  TEAM
  COMMUNITY
  PERSONAL
}

model ChallengeParticipant {
  id            String    @id @default(cuid())
  challengeId   String
  challenge     Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Progress
  currentValue  Float     @default(0)
  isCompleted   Boolean   @default(false)
  completedAt   DateTime?
  
  // Ranking within challenge
  rank          Int?
  
  joinedAt      DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([challengeId, userId])
  @@index([challengeId, currentValue(sort: Desc)])
}
```

### Streaks
```prisma
// Add to User model or create separate table
model UserStreak {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Daily activity streak
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastActivityDate DateTime?
  
  // Weekly goal streak
  weeklyStreak    Int       @default(0)
  weeklyGoal      Int       @default(3)  // Activities per week
  weeklyProgress  Int       @default(0)  // Current week's count
  weekStartDate   DateTime?
  
  updatedAt       DateTime  @updatedAt
}
```

### Badges
```prisma
model Badge {
  id              String      @id @default(cuid())
  
  // Display
  name            String
  description     String
  iconUrl         String
  color           String      // Hex color for badge background
  
  // Category
  category        BadgeCategory
  
  // Criteria
  criteriaType    BadgeCriteria
  criteriaValue   Float       // e.g., 100 for "Run 100km total"
  sportId         String?     // Sport-specific badge
  
  // Rarity
  rarity          BadgeRarity @default(COMMON)
  
  // Ordering
  displayOrder    Int         @default(0)
  
  isActive        Boolean     @default(true)
  
  earnedBy        UserBadge[]
  challenges      Challenge[]
}

enum BadgeCategory {
  DISTANCE        // Distance milestones
  CONSISTENCY     // Streak-based
  PERFORMANCE     // Personal records
  SOCIAL          // Community engagement
  CHALLENGE       // Challenge completion
  SPECIAL         // Special events
}

enum BadgeCriteria {
  TOTAL_DISTANCE
  SINGLE_ACTIVITY_DISTANCE
  TOTAL_ACTIVITIES
  STREAK_DAYS
  CHALLENGES_COMPLETED
  FRIENDS_COUNT
  TEAMS_JOINED
  SPORT_INDEX
}

enum BadgeRarity {
  COMMON
  UNCOMMON
  RARE
  EPIC
  LEGENDARY
}

model UserBadge {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId     String
  badge       Badge     @relation(fields: [badgeId], references: [id])
  
  earnedAt    DateTime  @default(now())
  
  // For display - pin up to 3 badges on profile
  isPinned    Boolean   @default(false)
  
  @@unique([userId, badgeId])
  @@index([userId])
}
```

---

## Seed Data: Default Badges

```typescript
const defaultBadges = [
  // Distance Badges
  {
    name: "First Steps",
    description: "Complete your first activity",
    iconUrl: "/badges/first-steps.svg",
    color: "#22C55E",
    category: "DISTANCE",
    criteriaType: "TOTAL_ACTIVITIES",
    criteriaValue: 1,
    rarity: "COMMON"
  },
  {
    name: "10K Club",
    description: "Run a total of 10 kilometers",
    iconUrl: "/badges/10k.svg",
    color: "#3B82F6",
    category: "DISTANCE",
    criteriaType: "TOTAL_DISTANCE",
    criteriaValue: 10000, // meters
    sportId: "running",
    rarity: "COMMON"
  },
  {
    name: "Century Ride",
    description: "Complete a 100km bike ride in one activity",
    iconUrl: "/badges/century.svg",
    color: "#8B5CF6",
    category: "DISTANCE",
    criteriaType: "SINGLE_ACTIVITY_DISTANCE",
    criteriaValue: 100000,
    sportId: "cycling",
    rarity: "EPIC"
  },
  {
    name: "Marathon Finisher",
    description: "Run 42.2km in a single activity",
    iconUrl: "/badges/marathon.svg",
    color: "#F59E0B",
    category: "DISTANCE",
    criteriaType: "SINGLE_ACTIVITY_DISTANCE",
    criteriaValue: 42200,
    sportId: "running",
    rarity: "EPIC"
  },
  {
    name: "1000km Legend",
    description: "Accumulate 1000km total distance",
    iconUrl: "/badges/1000km.svg",
    color: "#EC4899",
    category: "DISTANCE",
    criteriaType: "TOTAL_DISTANCE",
    criteriaValue: 1000000,
    rarity: "LEGENDARY"
  },
  
  // Consistency Badges
  {
    name: "Week Warrior",
    description: "Maintain a 7-day activity streak",
    iconUrl: "/badges/week-warrior.svg",
    color: "#F97316",
    category: "CONSISTENCY",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 7,
    rarity: "COMMON"
  },
  {
    name: "Month Master",
    description: "Maintain a 30-day activity streak",
    iconUrl: "/badges/month-master.svg",
    color: "#EF4444",
    category: "CONSISTENCY",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 30,
    rarity: "RARE"
  },
  {
    name: "Year Legend",
    description: "Maintain a 365-day activity streak",
    iconUrl: "/badges/year-legend.svg",
    color: "#FFD700",
    category: "CONSISTENCY",
    criteriaType: "STREAK_DAYS",
    criteriaValue: 365,
    rarity: "LEGENDARY"
  },
  
  // Social Badges
  {
    name: "Connector",
    description: "Add 10 friends",
    iconUrl: "/badges/connector.svg",
    color: "#06B6D4",
    category: "SOCIAL",
    criteriaType: "FRIENDS_COUNT",
    criteriaValue: 10,
    rarity: "COMMON"
  },
  {
    name: "Team Player",
    description: "Join 3 teams",
    iconUrl: "/badges/team-player.svg",
    color: "#10B981",
    category: "SOCIAL",
    criteriaType: "TEAMS_JOINED",
    criteriaValue: 3,
    rarity: "UNCOMMON"
  },
  
  // Challenge Badges
  {
    name: "Challenge Accepted",
    description: "Complete your first challenge",
    iconUrl: "/badges/challenge-accepted.svg",
    color: "#8B5CF6",
    category: "CHALLENGE",
    criteriaType: "CHALLENGES_COMPLETED",
    criteriaValue: 1,
    rarity: "COMMON"
  },
  {
    name: "Challenge Champion",
    description: "Complete 10 challenges",
    iconUrl: "/badges/challenge-champion.svg",
    color: "#6366F1",
    category: "CHALLENGE",
    criteriaType: "CHALLENGES_COMPLETED",
    criteriaValue: 10,
    rarity: "RARE"
  },
  
  // Performance Badges
  {
    name: "Rising Star",
    description: "Reach a Sport Index of 300",
    iconUrl: "/badges/rising-star.svg",
    color: "#F59E0B",
    category: "PERFORMANCE",
    criteriaType: "SPORT_INDEX",
    criteriaValue: 300,
    rarity: "UNCOMMON"
  },
  {
    name: "Elite Athlete",
    description: "Reach a Sport Index of 700",
    iconUrl: "/badges/elite.svg",
    color: "#FFD700",
    category: "PERFORMANCE",
    criteriaType: "SPORT_INDEX",
    criteriaValue: 700,
    rarity: "LEGENDARY"
  }
];
```

---

## API Endpoints

### Challenges
```typescript
// GET /api/challenges
// Query: status (active, completed, upcoming), sport, scope
interface ListChallengesResponse {
  challenges: ChallengeWithProgress[];
}

// GET /api/challenges/:id
interface ChallengeDetailResponse {
  challenge: Challenge;
  participation: ChallengeParticipant | null;
  leaderboard: ChallengeLeaderboardEntry[];
  totalParticipants: number;
}

// POST /api/challenges/:id/join
// Join a challenge

// GET /api/challenges/:id/leaderboard
// Query: page, limit
```

### Streaks
```typescript
// GET /api/users/:userId/streak
interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  weeklyProgress: number;
  weeklyGoal: number;
  streakAtRisk: boolean; // True if no activity today
}
```

### Badges
```typescript
// GET /api/badges
// List all available badges with earned status

// GET /api/users/:userId/badges
// List user's earned badges

// PUT /api/users/:userId/badges/:badgeId/pin
// Pin/unpin a badge to profile
```

---

## UI Components

### Active Challenges Widget (Sidebar)

```jsx
function ChallengesWidget({ challenges }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Active Challenges</h3>
        <a href="/challenges" className="text-sm text-blue-600 hover:underline">
          View all
        </a>
      </div>
      
      <div className="divide-y divide-gray-50">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="p-4">
            <div className="flex items-center gap-3 mb-2">
              {challenge.sponsorLogoUrl ? (
                <img src={challenge.sponsorLogoUrl} className="h-6" />
              ) : (
                <span className="text-xl">{challenge.sport?.icon || '🏆'}</span>
              )}
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800">{challenge.title}</div>
                <div className="text-xs text-gray-500">
                  {daysRemaining(challenge.endDate)} days left
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (challenge.progress / challenge.targetValue) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{challenge.progress.toFixed(1)} {challenge.targetUnit}</span>
                <span>{challenge.targetValue} {challenge.targetUnit}</span>
              </div>
            </div>
          </div>
        ))}
        
        {challenges.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            No active challenges. 
            <a href="/challenges" className="text-blue-600 hover:underline ml-1">
              Browse challenges
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Challenge Card

```jsx
function ChallengeCard({ challenge, participation }) {
  const progress = participation?.currentValue || 0;
  const percentage = Math.min(100, (progress / challenge.targetValue) * 100);
  const isCompleted = participation?.isCompleted;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 relative">
        {challenge.imageUrl && (
          <img src={challenge.imageUrl} className="w-full h-full object-cover" />
        )}
        {challenge.sponsorLogoUrl && (
          <div className="absolute top-3 right-3 bg-white/90 rounded px-2 py-1">
            <img src={challenge.sponsorLogoUrl} className="h-4" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold">
            ✓ Completed
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
            <p className="text-sm text-gray-500">
              {formatDateRange(challenge.startDate, challenge.endDate)}
            </p>
          </div>
          <span className="text-2xl">{challenge.sport?.icon || '🏆'}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
        
        {/* Target */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {challenge.targetValue} {challenge.targetUnit}
            </div>
            <div className="text-sm text-gray-500">Goal</div>
          </div>
        </div>
        
        {/* Progress (if participating) */}
        {participation && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Your progress</span>
              <span className="font-medium text-gray-800">
                {progress.toFixed(1)} / {challenge.targetValue} {challenge.targetUnit}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Reward */}
        {challenge.badge && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg mb-4">
            <img src={challenge.badge.iconUrl} className="w-8 h-8" />
            <div className="text-sm">
              <span className="text-gray-600">Earn: </span>
              <span className="font-medium text-gray-800">{challenge.badge.name}</span>
            </div>
          </div>
        )}
        
        {/* Action */}
        {!participation ? (
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
            Join Challenge
          </button>
        ) : (
          <a 
            href={`/challenges/${challenge.id}`}
            className="block w-full py-2 text-center border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            View Leaderboard
          </a>
        )}
      </div>
    </div>
  );
}
```

### Streak Display

```jsx
function StreakDisplay({ streak }) {
  const isAtRisk = streak.streakAtRisk;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Your Streak</h3>
        <span className="text-2xl">🔥</span>
      </div>
      
      {/* Current Streak */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${isAtRisk ? 'text-orange-500' : 'text-gray-800'}`}>
          {streak.currentStreak}
        </div>
        <div className="text-gray-500">day streak</div>
        {isAtRisk && (
          <div className="mt-2 text-sm text-orange-500 font-medium">
            ⚠️ Log an activity today to keep your streak!
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-xl font-bold text-gray-800">{streak.longestStreak}</div>
          <div className="text-xs text-gray-500">Longest streak</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-gray-800">
            {streak.weeklyProgress}/{streak.weeklyGoal}
          </div>
          <div className="text-xs text-gray-500">This week</div>
        </div>
      </div>
      
      {/* Weekly Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Weekly goal</span>
          <span>{streak.weeklyProgress} of {streak.weeklyGoal} activities</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${Math.min(100, (streak.weeklyProgress / streak.weeklyGoal) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Badge Gallery

```jsx
function BadgeGallery({ badges, earnedBadges }) {
  const earnedIds = new Set(earnedBadges.map(b => b.badgeId));
  
  const categories = [
    { key: 'DISTANCE', label: 'Distance', icon: '🏃' },
    { key: 'CONSISTENCY', label: 'Consistency', icon: '🔥' },
    { key: 'PERFORMANCE', label: 'Performance', icon: '⭐' },
    { key: 'SOCIAL', label: 'Social', icon: '👥' },
    { key: 'CHALLENGE', label: 'Challenges', icon: '🏆' },
  ];
  
  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryBadges = badges.filter(b => b.category === category.key);
        if (categoryBadges.length === 0) return null;
        
        return (
          <div key={category.key}>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
              {category.label}
            </h3>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categoryBadges.map((badge) => {
                const isEarned = earnedIds.has(badge.id);
                
                return (
                  <div 
                    key={badge.id}
                    className={`relative group cursor-pointer ${!isEarned ? 'opacity-40 grayscale' : ''}`}
                    title={badge.name}
                  >
                    <div 
                      className="w-full aspect-square rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: isEarned ? badge.color + '20' : '#f3f4f6' }}
                    >
                      <img 
                        src={badge.iconUrl} 
                        alt={badge.name}
                        className="w-12 h-12"
                      />
                    </div>
                    
                    {/* Rarity indicator */}
                    {badge.rarity !== 'COMMON' && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                        badge.rarity === 'LEGENDARY' ? 'bg-yellow-400' :
                        badge.rarity === 'EPIC' ? 'bg-purple-500' :
                        badge.rarity === 'RARE' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`} />
                    )}
                    
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {badge.name}
                        {!isEarned && (
                          <div className="text-gray-400">{badge.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Achievement Popup

```jsx
function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-bounce-in">
        {/* Confetti background */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-100 to-white" />
        
        <div className="relative p-6 text-center">
          {/* Badge icon */}
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: achievement.badge.color + '30' }}
          >
            <img 
              src={achievement.badge.iconUrl} 
              alt=""
              className="w-16 h-16"
            />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            🎉 Achievement Unlocked!
          </h2>
          
          {/* Badge name */}
          <div className="text-xl font-semibold text-gray-800 mb-1">
            {achievement.badge.name}
          </div>
          
          {/* Description */}
          <p className="text-gray-600 mb-6">
            {achievement.badge.description}
          </p>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => shareAchievement(achievement)}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Share 🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Background Logic

### Update Streak on Activity

```typescript
async function updateStreakOnActivity(userId: string, activityDate: Date) {
  const streak = await db.userStreak.findUnique({ where: { userId } });
  
  if (!streak) {
    // Create new streak record
    await db.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: activityDate,
        weeklyProgress: 1
      }
    });
    return;
  }
  
  const today = startOfDay(activityDate);
  const lastDate = streak.lastActivityDate ? startOfDay(streak.lastActivityDate) : null;
  
  let newStreak = streak.currentStreak;
  
  if (!lastDate) {
    // First activity
    newStreak = 1;
  } else if (isSameDay(today, lastDate)) {
    // Already logged today, no change
    return;
  } else if (isYesterday(lastDate, today)) {
    // Consecutive day
    newStreak = streak.currentStreak + 1;
  } else {
    // Streak broken
    newStreak = 1;
  }
  
  await db.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivityDate: activityDate,
      weeklyProgress: streak.weeklyProgress + 1
    }
  });
  
  // Check for streak badges
  await checkStreakBadges(userId, newStreak);
}
```

### Check and Award Badges

```typescript
async function checkBadgesOnActivity(userId: string, activity: Activity) {
  const userStats = await db.userStats.findUnique({ where: { userId } });
  const earnedBadgeIds = await db.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  }).then(badges => new Set(badges.map(b => b.badgeId)));
  
  const allBadges = await db.badge.findMany({ where: { isActive: true } });
  
  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;
    
    let earned = false;
    
    switch (badge.criteriaType) {
      case 'TOTAL_DISTANCE':
        if (badge.sportId) {
          const sportStats = await db.userSportStats.findUnique({
            where: { userId_sportId: { userId, sportId: badge.sportId } }
          });
          earned = (sportStats?.totalDistance || 0) >= badge.criteriaValue;
        } else {
          earned = (userStats?.totalDistance || 0) >= badge.criteriaValue;
        }
        break;
        
      case 'SINGLE_ACTIVITY_DISTANCE':
        if (!badge.sportId || activity.sportId === badge.sportId) {
          earned = (activity.distanceMeters || 0) >= badge.criteriaValue;
        }
        break;
        
      case 'TOTAL_ACTIVITIES':
        earned = (userStats?.totalActivities || 0) >= badge.criteriaValue;
        break;
        
      case 'SPORT_INDEX':
        earned = (userStats?.sportIndex || 0) >= badge.criteriaValue;
        break;
    }
    
    if (earned) {
      await awardBadge(userId, badge);
    }
  }
}

async function awardBadge(userId: string, badge: Badge) {
  await db.userBadge.create({
    data: { userId, badgeId: badge.id }
  });
  
  // Send notification
  await createNotification(userId, {
    type: 'BADGE_EARNED',
    title: 'Achievement Unlocked!',
    message: `You earned the ${badge.name} badge!`,
    data: { badgeId: badge.id }
  });
  
  // Optionally auto-create a post
  // await createAchievementPost(userId, badge);
}
```

### Update Challenge Progress

```typescript
async function updateChallengeProgress(userId: string, activity: Activity) {
  const participations = await db.challengeParticipant.findMany({
    where: { 
      userId,
      isCompleted: false,
      challenge: {
        isActive: true,
        endDate: { gte: new Date() },
        OR: [
          { sportId: null },
          { sportId: activity.sportId }
        ]
      }
    },
    include: { challenge: true }
  });
  
  for (const participation of participations) {
    const challenge = participation.challenge;
    let increment = 0;
    
    switch (challenge.targetType) {
      case 'DISTANCE':
        increment = (activity.distanceMeters || 0) / 1000; // Convert to km
        break;
      case 'DURATION':
        increment = (activity.durationSeconds || 0) / 60; // Convert to minutes
        break;
      case 'ACTIVITIES':
        increment = 1;
        break;
      case 'CALORIES':
        increment = activity.caloriesBurned || 0;
        break;
      case 'ELEVATION':
        increment = activity.elevationGain || 0;
        break;
    }
    
    const newValue = participation.currentValue + increment;
    const isCompleted = newValue >= challenge.targetValue;
    
    await db.challengeParticipant.update({
      where: { id: participation.id },
      data: {
        currentValue: newValue,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });
    
    if (isCompleted) {
      // Award challenge badge if applicable
      if (challenge.badgeId) {
        await awardBadge(userId, await db.badge.findUnique({ where: { id: challenge.badgeId } }));
      }
      
      // Send completion notification
      await createNotification(userId, {
        type: 'CHALLENGE_COMPLETED',
        title: 'Challenge Completed! 🎉',
        message: `You completed the ${challenge.title} challenge!`,
        data: { challengeId: challenge.id }
      });
    }
  }
}
```
