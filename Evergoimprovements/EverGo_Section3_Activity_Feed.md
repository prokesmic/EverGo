# EverGo Section 3: Activity Feed & Composer

## Overview
Build a social activity feed where users share workouts, posts, and photos. Includes a composer for new posts and rich content previews for activities.

---

## Database Schema

### Posts Table
```prisma
model Post {
  id            String      @id @default(cuid())
  userId        String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  postType      PostType
  content       String?     // Text content for status posts
  
  // Activity-specific fields (when postType = ACTIVITY)
  activityId    String?     @unique
  activity      Activity?   @relation(fields: [activityId], references: [id])
  
  // Media
  photos        String[]    // Array of image URLs
  mapImageUrl   String?     // Static map image for GPS activities
  
  // Visibility
  visibility    Visibility  @default(PUBLIC)
  
  // Engagement counts (denormalized for performance)
  likesCount    Int         @default(0)
  commentsCount Int         @default(0)
  sharesCount   Int         @default(0)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  likes         Like[]
  comments      Comment[]
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
}

enum PostType {
  ACTIVITY      // Workout/activity post
  STATUS        // Text status update
  PHOTO         // Photo post
  ACHIEVEMENT   // Badge/milestone earned
  MILESTONE     // Distance/streak milestone
}

enum Visibility {
  PUBLIC
  FRIENDS
  TEAM
  PRIVATE
}
```

### Activity Table
```prisma
model Activity {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Sport & Discipline
  sportId         String
  sport           Sport       @relation(fields: [sportId], references: [id])
  disciplineId    String?
  discipline      Discipline? @relation(fields: [disciplineId], references: [id])
  
  // Basic Info
  title           String
  description     String?
  activityDate    DateTime
  
  // Metrics
  durationSeconds Int?
  distanceMeters  Float?
  elevationGain   Float?
  caloriesBurned  Int?
  avgHeartRate    Int?
  maxHeartRate    Int?
  avgPace         Float?      // seconds per km
  avgSpeed        Float?      // km/h
  
  // For scored sports (golf, etc.)
  score           Float?
  
  // GPS Data
  gpsRoute        Json?       // GeoJSON LineString
  startLocation   Json?       // {lat, lng, name}
  mapImageUrl     String?     // Static map preview
  
  // Media
  photos          String[]
  
  // Source
  source          ActivitySource @default(MANUAL)
  externalId      String?        // For deduplication from synced sources
  
  // Weather (optional)
  weatherConditions Json?      // {temp, humidity, wind, conditions}
  
  visibility      Visibility  @default(PUBLIC)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relation to post (auto-created when activity is logged)
  post            Post?
  
  @@index([userId, activityDate(sort: Desc)])
  @@index([sportId])
}

enum ActivitySource {
  MANUAL
  STRAVA
  GARMIN
  FITBIT
  APPLE_HEALTH
  GOOGLE_FIT
  GPX_IMPORT
}
```

### Likes & Comments
```prisma
model Like {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Reaction type (expandable for kudos, fire, etc.)
  type      ReactionType @default(LIKE)
  
  createdAt DateTime @default(now())
  
  @@unique([postId, userId])
  @@index([postId])
}

enum ReactionType {
  LIKE
  KUDOS
  FIRE
  STRONG
  IMPRESSIVE
}

model Comment {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  content   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([postId, createdAt])
}
```

---

## API Endpoints

### Feed
```typescript
// GET /api/feed
// Query params: type, page, limit

interface FeedRequest {
  type?: 'all' | 'friends' | 'following' | 'discover';
  page?: number;
  limit?: number;  // Default 10
}

interface FeedResponse {
  posts: PostWithDetails[];
  hasMore: boolean;
  nextCursor?: string;
}

interface PostWithDetails {
  id: string;
  postType: PostType;
  content: string | null;
  photos: string[];
  mapImageUrl: string | null;
  createdAt: string;
  
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  
  activity: {
    id: string;
    sportIcon: string;
    sportName: string;
    title: string;
    durationSeconds: number;
    distanceMeters: number;
    avgPace: number;
    elevationGain: number;
    caloriesBurned: number;
  } | null;
  
  engagement: {
    likesCount: number;
    commentsCount: number;
    isLikedByMe: boolean;
  };
}
```

### Posts
```typescript
// POST /api/posts
interface CreatePostRequest {
  postType: 'STATUS' | 'PHOTO';
  content: string;
  photos?: string[];
  visibility?: Visibility;
}

// POST /api/activities
interface CreateActivityRequest {
  sportId: string;
  disciplineId?: string;
  title: string;
  description?: string;
  activityDate: string;
  durationSeconds?: number;
  distanceMeters?: number;
  elevationGain?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  score?: number;
  gpsRoute?: GeoJSON;
  photos?: string[];
  visibility?: Visibility;
}

// Returns the created activity AND auto-created post
interface CreateActivityResponse {
  activity: Activity;
  post: Post;
}
```

### Engagement
```typescript
// POST /api/posts/:postId/like
// DELETE /api/posts/:postId/like

// GET /api/posts/:postId/comments
// POST /api/posts/:postId/comments
interface CreateCommentRequest {
  content: string;
}
```

---

## UI Components

### Create Post Box

```jsx
function CreatePostBox({ onPostCreated }) {
  const [mode, setMode] = useState('status'); // 'status' | 'activity'
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Collapsed State */}
      {!isExpanded && (
        <div 
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(true)}
        >
          <Avatar src={currentUser.avatarUrl} name={currentUser.displayName} size="sm" />
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-500">
            What's new with your training?
          </div>
        </div>
      )}
      
      {/* Expanded State */}
      {isExpanded && (
        <div className="p-4">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('status')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                mode === 'status' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              📝 Status
            </button>
            <button
              onClick={() => setMode('activity')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                mode === 'activity' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🏃 Log Activity
            </button>
          </div>
          
          {mode === 'status' && <StatusComposer onSubmit={onPostCreated} />}
          {mode === 'activity' && <ActivityComposer onSubmit={onPostCreated} />}
          
          <button 
            onClick={() => setIsExpanded(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
```

### Status Composer

```jsx
function StatusComposer({ onSubmit }) {
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!content.trim() && photos.length === 0) return;
    
    setIsSubmitting(true);
    try {
      await createPost({
        postType: photos.length > 0 ? 'PHOTO' : 'STATUS',
        content,
        photos
      });
      setContent('');
      setPhotos([]);
      onSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share what's on your mind..."
        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        rows={3}
      />
      
      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img src={photo} className="w-20 h-20 object-cover rounded" />
              <button
                onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">Photo</span>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">
            <MapPinIcon className="w-5 h-5" />
            <span className="text-sm">Location</span>
          </button>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && photos.length === 0)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
```

### Activity Composer

```jsx
function ActivityComposer({ onSubmit }) {
  const [formData, setFormData] = useState({
    sportId: '',
    title: '',
    description: '',
    activityDate: new Date().toISOString().slice(0, 16),
    durationHours: 0,
    durationMinutes: 0,
    durationSeconds: 0,
    distanceKm: '',
    elevationGain: '',
    caloriesBurned: '',
    avgHeartRate: '',
    photos: []
  });
  
  const handleSubmit = async () => {
    const durationSeconds = 
      (formData.durationHours * 3600) + 
      (formData.durationMinutes * 60) + 
      formData.durationSeconds;
    
    await createActivity({
      sportId: formData.sportId,
      title: formData.title || `${getSportName(formData.sportId)} workout`,
      description: formData.description,
      activityDate: formData.activityDate,
      durationSeconds,
      distanceMeters: formData.distanceKm ? parseFloat(formData.distanceKm) * 1000 : undefined,
      elevationGain: formData.elevationGain ? parseFloat(formData.elevationGain) : undefined,
      caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
      avgHeartRate: formData.avgHeartRate ? parseInt(formData.avgHeartRate) : undefined,
      photos: formData.photos
    });
    
    onSubmit?.();
  };
  
  return (
    <div className="space-y-4">
      {/* Sport Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sport *</label>
        <select
          value={formData.sportId}
          onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Select a sport</option>
          <option value="running">🏃 Running</option>
          <option value="cycling">🚴 Cycling</option>
          <option value="swimming">🏊 Swimming</option>
          <option value="golf">⛳ Golf</option>
          <option value="tennis">🎾 Tennis</option>
          <option value="fitness">💪 Fitness</option>
          {/* Add more sports */}
        </select>
      </div>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Morning run, Leg day, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      {/* Date/Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
        <input
          type="datetime-local"
          value={formData.activityDate}
          onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      
      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              value={formData.durationHours}
              onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-xs text-gray-500">hours</span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              max="59"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-xs text-gray-500">minutes</span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={formData.durationSeconds}
              onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              max="59"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <span className="text-xs text-gray-500">seconds</span>
          </div>
        </div>
      </div>
      
      {/* Distance (for running, cycling, etc.) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <input
            type="number"
            step="0.01"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
            placeholder="5.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Elevation (m)</label>
          <input
            type="number"
            value={formData.elevationGain}
            onChange={(e) => setFormData({ ...formData, elevationGain: e.target.value })}
            placeholder="150"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
          <input
            type="number"
            value={formData.caloriesBurned}
            onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
            placeholder="350"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avg Heart Rate</label>
          <input
            type="number"
            value={formData.avgHeartRate}
            onChange={(e) => setFormData({ ...formData, avgHeartRate: e.target.value })}
            placeholder="145"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="How did it feel? Any notes about this workout..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
          rows={2}
        />
      </div>
      
      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!formData.sportId}
        className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
      >
        Log Activity
      </button>
    </div>
  );
}
```

### Activity Post Card

```jsx
function ActivityPostCard({ post }) {
  const { activity, user, engagement } = post;
  const [isLiked, setIsLiked] = useState(engagement.isLikedByMe);
  const [likesCount, setLikesCount] = useState(engagement.likesCount);
  const [showComments, setShowComments] = useState(false);
  
  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    if (isLiked) {
      await unlikePost(post.id);
    } else {
      await likePost(post.id);
    }
  };
  
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  const formatPace = (secondsPerKm) => {
    const m = Math.floor(secondsPerKm / 60);
    const s = Math.round(secondsPerKm % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar src={user.avatarUrl} name={user.displayName} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <a href={`/@${user.username}`} className="font-semibold text-gray-800 hover:underline">
              {user.displayName}
            </a>
          </div>
          <div className="text-sm text-gray-500">
            {formatTimeAgo(post.createdAt)} • 
            <span className="text-blue-600 ml-1">{activity.sportName}</span>
          </div>
        </div>
      </div>
      
      {/* Activity Title & Description */}
      <div className="px-4 pb-3">
        <h3 className="font-semibold text-gray-800">{activity.title}</h3>
        {post.content && (
          <p className="text-gray-600 mt-1">{post.content}</p>
        )}
      </div>
      
      {/* Stats Box */}
      <div className="mx-4 mb-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {activity.distanceMeters && (
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Distance</div>
              <div className="text-xl font-bold text-gray-800">
                {(activity.distanceMeters / 1000).toFixed(2)} km
              </div>
            </div>
          )}
          {activity.durationSeconds && (
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
              <div className="text-xl font-bold text-gray-800">
                {formatDuration(activity.durationSeconds)}
              </div>
            </div>
          )}
          {activity.avgPace && (
            <div className="p-3 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Pace</div>
              <div className="text-xl font-bold text-gray-800">
                {formatPace(activity.avgPace)} /km
              </div>
            </div>
          )}
        </div>
        
        {/* Secondary Stats Row */}
        {(activity.elevationGain || activity.caloriesBurned || activity.avgHeartRate) && (
          <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-200 bg-gray-100">
            {activity.elevationGain && (
              <div className="p-2 text-center">
                <div className="text-xs text-gray-500">Elevation</div>
                <div className="font-semibold text-gray-700">{activity.elevationGain}m</div>
              </div>
            )}
            {activity.caloriesBurned && (
              <div className="p-2 text-center">
                <div className="text-xs text-gray-500">Calories</div>
                <div className="font-semibold text-gray-700">{activity.caloriesBurned}</div>
              </div>
            )}
            {activity.avgHeartRate && (
              <div className="p-2 text-center">
                <div className="text-xs text-gray-500">Avg HR</div>
                <div className="font-semibold text-gray-700">{activity.avgHeartRate} bpm</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Map Preview (if GPS data) */}
      {post.mapImageUrl && (
        <div className="mx-4 mb-3">
          <img 
            src={post.mapImageUrl} 
            alt="Activity route" 
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      {/* Photos */}
      {post.photos.length > 0 && (
        <div className="mx-4 mb-3">
          <div className={`grid gap-2 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.photos.slice(0, 4).map((photo, index) => (
              <img 
                key={index}
                src={photo} 
                alt="" 
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100">
        {likesCount > 0 && (
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        )}
        {engagement.commentsCount > 0 && (
          <span>{engagement.commentsCount} {engagement.commentsCount === 1 ? 'comment' : 'comments'}</span>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center gap-2 border-t border-gray-100">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 ${
            isLiked ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <HeartIcon className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">Like</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <MessageCircleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <ShareIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <CommentsSection postId={post.id} />
      )}
    </div>
  );
}
```

### Comments Section

```jsx
function CommentsSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadComments();
  }, [postId]);
  
  const loadComments = async () => {
    setIsLoading(true);
    const data = await fetchComments(postId);
    setComments(data);
    setIsLoading(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    // Optimistic update
    const tempComment = {
      id: 'temp-' + Date.now(),
      content: newComment,
      user: currentUser,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, tempComment]);
    setNewComment('');
    
    // Actual API call
    await createComment(postId, { content: newComment });
    loadComments(); // Refresh to get real data
  };
  
  return (
    <div className="border-t border-gray-100">
      {/* Comments List */}
      <div className="px-4 py-3 space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar src={comment.user.avatarUrl} name={comment.user.displayName} size="sm" />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <span className="font-semibold text-sm text-gray-800">
                    {comment.user.displayName}
                  </span>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(comment.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <Avatar src={currentUser.avatarUrl} name={currentUser.displayName} size="sm" />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}
```

### Feed Page Layout

```jsx
function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    loadFeed();
  }, []);
  
  const loadFeed = async () => {
    const data = await fetchFeed({ type: 'all', limit: 10 });
    setPosts(data.posts);
    setHasMore(data.hasMore);
    setIsLoading(false);
  };
  
  const loadMore = async () => {
    const lastPost = posts[posts.length - 1];
    const data = await fetchFeed({ 
      type: 'all', 
      limit: 10,
      cursor: lastPost.id 
    });
    setPosts([...posts, ...data.posts]);
    setHasMore(data.hasMore);
  };
  
  const handlePostCreated = () => {
    loadFeed(); // Refresh feed
  };
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Create Post Box */}
      <CreatePostBox onPostCreated={handlePostCreated} />
      
      {/* Feed */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No posts yet. Follow some athletes or log your first activity!
        </div>
      ) : (
        <>
          {posts.map((post) => (
            post.postType === 'ACTIVITY' ? (
              <ActivityPostCard key={post.id} post={post} />
            ) : (
              <StatusPostCard key={post.id} post={post} />
            )
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
}
```

---

## Feed Algorithm

For the initial implementation, use chronological ordering with friend prioritization:

```typescript
async function getFeed(userId: string, options: FeedOptions) {
  const { type, limit = 10, cursor } = options;
  
  // Get user's friends and following
  const connections = await getConnections(userId);
  const connectionIds = connections.map(c => c.id);
  
  let whereClause: any = {
    OR: [
      { visibility: 'PUBLIC' },
      { userId: { in: connectionIds }, visibility: 'FRIENDS' },
      { userId: userId } // User's own posts
    ]
  };
  
  if (type === 'friends') {
    whereClause = {
      userId: { in: connectionIds }
    };
  }
  
  if (cursor) {
    whereClause.createdAt = { lt: new Date(cursor) };
  }
  
  const posts = await db.post.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: {
      user: {
        select: { id: true, username: true, displayName: true, avatarUrl: true }
      },
      activity: true,
      _count: { select: { likes: true, comments: true } }
    }
  });
  
  // Check if current user liked each post
  const postIds = posts.map(p => p.id);
  const userLikes = await db.like.findMany({
    where: { postId: { in: postIds }, userId }
  });
  const likedPostIds = new Set(userLikes.map(l => l.postId));
  
  const hasMore = posts.length > limit;
  const postsToReturn = posts.slice(0, limit);
  
  return {
    posts: postsToReturn.map(p => ({
      ...p,
      engagement: {
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        isLikedByMe: likedPostIds.has(p.id)
      }
    })),
    hasMore
  };
}
```
