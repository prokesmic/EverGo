# EverGo Section 6: Retention & Notifications

## Overview
Implement push notifications, in-app nudges, and retention mechanics to keep users engaged, informed, and motivated.

---

## Database Schema

### Notifications
```prisma
model Notification {
  id            String              @id @default(cuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type          NotificationType
  title         String
  message       String
  
  // Related entities
  data          Json?               // { postId, challengeId, userId, badgeId, etc. }
  
  // Status
  isRead        Boolean             @default(false)
  readAt        DateTime?
  
  // For push notifications
  isPushed      Boolean             @default(false)
  pushedAt      DateTime?
  
  createdAt     DateTime            @default(now())
  
  @@index([userId, isRead, createdAt(sort: Desc)])
}

enum NotificationType {
  // Social
  LIKE
  COMMENT
  FOLLOW
  MENTION
  
  // Rankings
  RANK_UP
  RANK_DOWN
  FRIEND_OVERTAKE
  MILESTONE_RANK
  
  // Streaks
  STREAK_REMINDER
  STREAK_BROKEN
  STREAK_MILESTONE
  
  // Challenges
  CHALLENGE_JOINED
  CHALLENGE_PROGRESS
  CHALLENGE_ENDING
  CHALLENGE_COMPLETED
  
  // Badges
  BADGE_EARNED
  
  // Teams
  TEAM_INVITE
  TEAM_JOIN_REQUEST
  TEAM_POST
  
  // System
  WEEKLY_SUMMARY
  PRODUCT_UPDATE
}
```

### User Notification Settings
```prisma
model NotificationSettings {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Push notification toggles
  pushEnabled         Boolean   @default(true)
  
  // Category toggles
  socialEnabled       Boolean   @default(true)    // Likes, comments, follows
  rankingEnabled      Boolean   @default(true)    // Rank changes
  streakEnabled       Boolean   @default(true)    // Streak reminders
  challengeEnabled    Boolean   @default(true)    // Challenge updates
  teamEnabled         Boolean   @default(true)    // Team activity
  marketingEnabled    Boolean   @default(false)   // Product updates, offers
  
  // Digest preferences
  weeklyDigestEnabled Boolean   @default(true)
  weeklyDigestDay     Int       @default(0)       // 0 = Sunday
  
  // Quiet hours
  quietHoursEnabled   Boolean   @default(false)
  quietHoursStart     String?   // "22:00"
  quietHoursEnd       String?   // "08:00"
  
  updatedAt           DateTime  @updatedAt
}
```

### Push Tokens
```prisma
model PushToken {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token       String    @unique
  platform    Platform
  deviceId    String?
  
  isActive    Boolean   @default(true)
  
  createdAt   DateTime  @default(now())
  lastUsedAt  DateTime  @default(now())
  
  @@index([userId])
}

enum Platform {
  IOS
  ANDROID
  WEB
}
```

---

## API Endpoints

### Notifications
```typescript
// GET /api/notifications
// Query: unreadOnly, page, limit
interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}

// PUT /api/notifications/:id/read
// Mark single notification as read

// PUT /api/notifications/read-all
// Mark all notifications as read

// GET /api/notifications/unread-count
interface UnreadCountResponse {
  count: number;
}
```

### Settings
```typescript
// GET /api/notifications/settings
// PUT /api/notifications/settings
interface UpdateSettingsRequest {
  pushEnabled?: boolean;
  socialEnabled?: boolean;
  rankingEnabled?: boolean;
  streakEnabled?: boolean;
  challengeEnabled?: boolean;
  teamEnabled?: boolean;
  marketingEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  weeklyDigestDay?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
```

### Push Tokens
```typescript
// POST /api/push-tokens
interface RegisterTokenRequest {
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  deviceId?: string;
}

// DELETE /api/push-tokens/:token
// Unregister a push token
```

---

## UI Components

### Notification Bell (Header)

```jsx
function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    fetchUnreadCount().then(data => setUnreadCount(data.count));
  }, []);
  
  const handleOpen = async () => {
    setIsOpen(true);
    const data = await fetchNotifications({ limit: 10 });
    setNotifications(data.notifications);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            
            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))
              )}
            </div>
            
            {/* Footer */}
            <a 
              href="/notifications"
              className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-gray-50 border-t border-gray-100"
            >
              View all notifications
            </a>
          </div>
        </>
      )}
    </div>
  );
}
```

### Notification Item

```jsx
function NotificationItem({ notification, onClick }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'LIKE': return '❤️';
      case 'COMMENT': return '💬';
      case 'FOLLOW': return '👤';
      case 'RANK_UP': return '📈';
      case 'RANK_DOWN': return '📉';
      case 'FRIEND_OVERTAKE': return '🏃';
      case 'STREAK_REMINDER': return '🔥';
      case 'STREAK_MILESTONE': return '🔥';
      case 'CHALLENGE_COMPLETED': return '🏆';
      case 'BADGE_EARNED': return '🎖️';
      case 'TEAM_INVITE': return '👥';
      case 'WEEKLY_SUMMARY': return '📊';
      default: return '🔔';
    }
  };
  
  return (
    <a
      href={getNotificationLink(notification)}
      onClick={() => onClick?.(notification)}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <span className="text-xl flex-shrink-0">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} text-gray-800`}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </a>
  );
}
```

### Notification Settings Page

```jsx
function NotificationSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchNotificationSettings().then(setSettings);
  }, []);
  
  const handleToggle = async (key) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    setIsSaving(true);
    await updateNotificationSettings({ [key]: newValue });
    setIsSaving(false);
  };
  
  if (!settings) return <div>Loading...</div>;
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notification Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
        {/* Master Toggle */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-800">Push Notifications</div>
            <div className="text-sm text-gray-500">Receive push notifications on your device</div>
          </div>
          <Toggle 
            checked={settings.pushEnabled} 
            onChange={() => handleToggle('pushEnabled')} 
          />
        </div>
        
        {/* Category Toggles */}
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-4">Notification Types</h3>
          <div className="space-y-4">
            <SettingRow
              icon="❤️"
              label="Social Activity"
              description="Likes, comments, and new followers"
              checked={settings.socialEnabled}
              onChange={() => handleToggle('socialEnabled')}
            />
            <SettingRow
              icon="📈"
              label="Rankings"
              description="Rank changes and friend competition"
              checked={settings.rankingEnabled}
              onChange={() => handleToggle('rankingEnabled')}
            />
            <SettingRow
              icon="🔥"
              label="Streaks"
              description="Streak reminders and milestones"
              checked={settings.streakEnabled}
              onChange={() => handleToggle('streakEnabled')}
            />
            <SettingRow
              icon="🏆"
              label="Challenges"
              description="Challenge updates and completions"
              checked={settings.challengeEnabled}
              onChange={() => handleToggle('challengeEnabled')}
            />
            <SettingRow
              icon="👥"
              label="Teams"
              description="Team invites and activity"
              checked={settings.teamEnabled}
              onChange={() => handleToggle('teamEnabled')}
            />
            <SettingRow
              icon="📢"
              label="Product Updates"
              description="New features and special offers"
              checked={settings.marketingEnabled}
              onChange={() => handleToggle('marketingEnabled')}
            />
          </div>
        </div>
        
        {/* Weekly Digest */}
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-4">Weekly Digest</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-700">Receive weekly summary</div>
              <div className="text-sm text-gray-500">Get a recap of your week every Sunday</div>
            </div>
            <Toggle 
              checked={settings.weeklyDigestEnabled} 
              onChange={() => handleToggle('weeklyDigestEnabled')} 
            />
          </div>
        </div>
        
        {/* Quiet Hours */}
        <div className="p-4">
          <h3 className="font-medium text-gray-800 mb-4">Quiet Hours</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-gray-700">Enable quiet hours</div>
              <div className="text-sm text-gray-500">Pause notifications during set times</div>
            </div>
            <Toggle 
              checked={settings.quietHoursEnabled} 
              onChange={() => handleToggle('quietHoursEnabled')} 
            />
          </div>
          {settings.quietHoursEnabled && (
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600">From</label>
                <input 
                  type="time" 
                  value={settings.quietHoursStart || '22:00'}
                  onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">To</label>
                <input 
                  type="time" 
                  value={settings.quietHoursEnd || '08:00'}
                  onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-gray-700">{label}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span 
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          checked ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}
```

### In-App Nudge Banner

```jsx
function NudgeBanner({ nudge, onDismiss }) {
  if (!nudge) return null;
  
  const getColor = () => {
    switch (nudge.type) {
      case 'streak_warning': return 'bg-orange-500';
      case 'challenge_ending': return 'bg-purple-500';
      case 'rank_opportunity': return 'bg-blue-500';
      case 'achievement_close': return 'bg-green-500';
      default: return 'bg-gray-800';
    }
  };
  
  return (
    <div className={`${getColor()} text-white px-4 py-3`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{nudge.icon}</span>
          <span className="font-medium">{nudge.message}</span>
        </div>
        <div className="flex items-center gap-3">
          {nudge.actionText && (
            <a 
              href={nudge.actionUrl}
              className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium"
            >
              {nudge.actionText}
            </a>
          )}
          <button 
            onClick={onDismiss}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Weekly Highlights Widget

```jsx
function WeeklyHighlightsWidget({ highlights }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm text-white overflow-hidden">
      <div className="px-4 py-3 border-b border-white/20">
        <h3 className="font-semibold">This Week's Highlights</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Total Activity */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏃</span>
          <div>
            <div className="font-medium">
              You logged {highlights.totalDistance.toFixed(1)} km
            </div>
            {highlights.distanceChange > 0 && (
              <div className="text-sm text-blue-200">
                ↑ {highlights.distanceChange.toFixed(1)} km more than last week
              </div>
            )}
          </div>
        </div>
        
        {/* Challenges */}
        {highlights.challengesCompleted > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-medium">
                Completed {highlights.challengesCompleted} {highlights.challengesCompleted === 1 ? 'challenge' : 'challenges'}
              </div>
            </div>
          </div>
        )}
        
        {/* Streak */}
        {highlights.currentStreak > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="font-medium">
                {highlights.currentStreak}-day streak maintained
              </div>
            </div>
          </div>
        )}
        
        {/* Rank Change */}
        {highlights.rankChange !== 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{highlights.rankChange > 0 ? '📈' : '📉'}</span>
            <div>
              <div className="font-medium">
                Moved {highlights.rankChange > 0 ? 'up' : 'down'} {Math.abs(highlights.rankChange)} spots in {highlights.rankScope}
              </div>
            </div>
          </div>
        )}
        
        {/* Social */}
        {highlights.kudosReceived > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <div className="font-medium">
                Received {highlights.kudosReceived} kudos from friends
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Notification Triggers

### Social Notifications
```typescript
// When someone likes a post
async function onPostLiked(postId: string, likerId: string) {
  const post = await db.post.findUnique({ 
    where: { id: postId },
    include: { user: true }
  });
  const liker = await db.user.findUnique({ where: { id: likerId } });
  
  if (post.userId === likerId) return; // Don't notify self
  
  await createNotification(post.userId, {
    type: 'LIKE',
    title: 'New Like',
    message: `${liker.displayName} liked your post`,
    data: { postId, userId: likerId }
  });
}

// When someone comments
async function onCommentCreated(comment: Comment) {
  const post = await db.post.findUnique({ where: { id: comment.postId } });
  const commenter = await db.user.findUnique({ where: { id: comment.userId } });
  
  if (post.userId === comment.userId) return;
  
  await createNotification(post.userId, {
    type: 'COMMENT',
    title: 'New Comment',
    message: `${commenter.displayName} commented on your post`,
    data: { postId: comment.postId, commentId: comment.id }
  });
}
```

### Ranking Notifications
```typescript
// After daily ranking recalculation
async function sendRankChangeNotifications() {
  const significantChanges = await db.userStats.findMany({
    where: {
      OR: [
        { globalRankChange: { lte: -10 } },  // Moved up 10+ spots
        { globalRankChange: { gte: 10 } },   // Dropped 10+ spots
      ]
    }
  });
  
  for (const user of significantChanges) {
    if (user.globalRankChange < 0) {
      await createNotification(user.userId, {
        type: 'RANK_UP',
        title: 'Rank Improved! 📈',
        message: `You moved up ${Math.abs(user.globalRankChange)} spots to #${user.globalRank} globally!`,
        data: { newRank: user.globalRank, change: user.globalRankChange }
      });
    }
  }
}

// Friend overtake notification
async function checkFriendOvertakes(userId: string, newIndex: number) {
  const friends = await getFriends(userId);
  
  for (const friend of friends) {
    const friendStats = await db.userStats.findUnique({ where: { userId: friend.id } });
    
    // Check if user just passed this friend
    if (newIndex > friendStats.sportIndex && (newIndex - 5) <= friendStats.sportIndex) {
      await createNotification(friend.id, {
        type: 'FRIEND_OVERTAKE',
        title: 'You\'ve been passed!',
        message: `${user.displayName} just overtook you in the rankings. Time to reclaim your spot!`,
        data: { userId, newGap: newIndex - friendStats.sportIndex }
      });
    }
  }
}
```

### Streak Reminders
```typescript
// Run at 6 PM local time
async function sendStreakReminders() {
  const usersAtRisk = await db.userStreak.findMany({
    where: {
      currentStreak: { gte: 3 }, // Only for users with 3+ day streaks
      lastActivityDate: {
        lt: startOfDay(new Date()) // No activity today
      }
    },
    include: { 
      user: { include: { notificationSettings: true } }
    }
  });
  
  for (const streak of usersAtRisk) {
    if (!streak.user.notificationSettings?.streakEnabled) continue;
    
    await createNotification(streak.userId, {
      type: 'STREAK_REMINDER',
      title: 'Keep Your Streak Alive! 🔥',
      message: `Don't break your ${streak.currentStreak}-day streak! Log an activity before midnight.`,
      data: { currentStreak: streak.currentStreak }
    });
  }
}
```

### Challenge Notifications
```typescript
// Challenge ending soon (run daily)
async function sendChallengeEndingReminders() {
  const tomorrow = addDays(new Date(), 1);
  
  const endingChallenges = await db.challenge.findMany({
    where: {
      endDate: {
        gte: startOfDay(tomorrow),
        lt: endOfDay(tomorrow)
      },
      isActive: true
    }
  });
  
  for (const challenge of endingChallenges) {
    const incompleteParticipants = await db.challengeParticipant.findMany({
      where: {
        challengeId: challenge.id,
        isCompleted: false
      }
    });
    
    for (const participant of incompleteParticipants) {
      const remaining = challenge.targetValue - participant.currentValue;
      
      await createNotification(participant.userId, {
        type: 'CHALLENGE_ENDING',
        title: 'Challenge Ends Tomorrow!',
        message: `Last day to complete ${challenge.title}! You need ${remaining.toFixed(1)} more ${challenge.targetUnit}.`,
        data: { challengeId: challenge.id, remaining }
      });
    }
  }
}
```

### Weekly Summary (run Sunday evening)
```typescript
async function generateWeeklySummaries() {
  const users = await db.user.findMany({
    where: {
      notificationSettings: { weeklyDigestEnabled: true }
    }
  });
  
  for (const user of users) {
    const weekStart = startOfWeek(new Date());
    
    // Gather stats
    const activities = await db.activity.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: weekStart }
      }
    });
    
    const totalDistance = activities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000;
    const totalDuration = activities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0);
    
    // Compare to last week
    const lastWeekActivities = await db.activity.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: subDays(weekStart, 7),
          lt: weekStart
        }
      }
    });
    const lastWeekDistance = lastWeekActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000;
    
    await createNotification(user.id, {
      type: 'WEEKLY_SUMMARY',
      title: 'Your Weekly Summary 📊',
      message: `This week: ${totalDistance.toFixed(1)}km in ${activities.length} activities. ${
        totalDistance > lastWeekDistance 
          ? `That's ${(totalDistance - lastWeekDistance).toFixed(1)}km more than last week! 🎉`
          : 'Keep pushing next week!'
      }`,
      data: {
        totalDistance,
        totalDuration,
        activityCount: activities.length,
        distanceChange: totalDistance - lastWeekDistance
      }
    });
  }
}
```

---

## Push Notification Service

```typescript
// Using Firebase Cloud Messaging (FCM)
import * as admin from 'firebase-admin';

async function sendPushNotification(userId: string, notification: Notification) {
  // Check user settings
  const settings = await db.notificationSettings.findUnique({ where: { userId } });
  if (!settings?.pushEnabled) return;
  
  // Check quiet hours
  if (settings.quietHoursEnabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (isInQuietHours(currentTime, settings.quietHoursStart, settings.quietHoursEnd)) {
      return;
    }
  }
  
  // Get push tokens
  const tokens = await db.pushToken.findMany({
    where: { userId, isActive: true }
  });
  
  if (tokens.length === 0) return;
  
  // Send to all devices
  const message = {
    notification: {
      title: notification.title,
      body: notification.message,
    },
    data: {
      type: notification.type,
      notificationId: notification.id,
      ...notification.data
    },
    tokens: tokens.map(t => t.token)
  };
  
  try {
    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        // Deactivate invalid token
        db.pushToken.update({
          where: { token: tokens[idx].token },
          data: { isActive: false }
        });
      }
    });
    
    // Mark as pushed
    await db.notification.update({
      where: { id: notification.id },
      data: { isPushed: true, pushedAt: new Date() }
    });
  } catch (error) {
    console.error('Push notification failed:', error);
  }
}

async function createNotification(userId: string, data: CreateNotificationInput) {
  const notification = await db.notification.create({
    data: {
      userId,
      ...data
    }
  });
  
  // Send push notification asynchronously
  sendPushNotification(userId, notification).catch(console.error);
  
  return notification;
}
```

---

## Background Jobs Schedule

```typescript
// Cron jobs for notifications

// Every day at 6 PM - Streak reminders
cron.schedule('0 18 * * *', sendStreakReminders);

// Every day at 8 AM - Challenge ending reminders
cron.schedule('0 8 * * *', sendChallengeEndingReminders);

// Every Sunday at 8 PM - Weekly summaries
cron.schedule('0 20 * * 0', generateWeeklySummaries);

// Every hour - Check for ranking changes
cron.schedule('0 * * * *', sendRankChangeNotifications);
```
