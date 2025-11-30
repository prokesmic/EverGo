# EverGo Section 4: Teams & Communities

## Overview
Build team profiles and interest-based communities where users can join groups, see collective stats, and interact in group discussions.

---

## Database Schema

### Teams
```prisma
model Team {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  description     String?
  
  // Branding
  logoUrl         String?
  coverPhotoUrl   String?
  
  // Sport association
  sportId         String
  sport           Sport       @relation(fields: [sportId], references: [id])
  
  // Location
  city            String?
  country         String?
  
  // Settings
  teamType        TeamType    @default(CLUB)
  isPublic        Boolean     @default(true)
  isVerified      Boolean     @default(false)
  
  // Stats (aggregated)
  memberCount     Int         @default(0)
  totalDistance   Float       @default(0)
  totalActivities Int         @default(0)
  avgSportIndex   Float       @default(0)
  
  // Rankings
  globalRank      Int?
  countryRank     Int?
  cityRank        Int?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  members         TeamMember[]
  posts           TeamPost[]
  joinRequests    TeamJoinRequest[]
  
  @@index([sportId])
  @@index([city, sportId])
}

enum TeamType {
  CLUB          // Official sports club
  CASUAL        // Casual group of friends
  PROFESSIONAL  // Professional team
  CORPORATE     // Company team
}

model TeamMember {
  id          String      @id @default(cuid())
  teamId      String
  team        Team        @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role        TeamRole    @default(MEMBER)
  jerseyNumber String?
  position    String?
  
  joinedAt    DateTime    @default(now())
  
  @@unique([teamId, userId])
  @@index([userId])
}

enum TeamRole {
  OWNER
  ADMIN
  COACH
  CAPTAIN
  MEMBER
}

model TeamJoinRequest {
  id          String              @id @default(cuid())
  teamId      String
  team        Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      String
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status      JoinRequestStatus   @default(PENDING)
  message     String?
  
  createdAt   DateTime            @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?
  
  @@unique([teamId, userId])
}

enum JoinRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model TeamPost {
  id          String    @id @default(cuid())
  teamId      String
  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  postType    TeamPostType @default(UPDATE)
  content     String
  photos      String[]
  
  isPinned    Boolean   @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([teamId, createdAt(sort: Desc)])
}

enum TeamPostType {
  UPDATE        // General update
  ANNOUNCEMENT  // Important announcement (from admin)
  RESULT        // Match/competition result
  EVENT         // Upcoming event
}
```

### Communities
```prisma
model Community {
  id              String      @id @default(cuid())
  name            String
  slug            String      @unique
  description     String?
  
  // Branding
  coverPhotoUrl   String?
  
  // Topic/Focus
  sportId         String?     // Optional - can be multi-sport
  sport           Sport?      @relation(fields: [sportId], references: [id])
  topic           String?     // e.g., "Trail Running", "Beginner Cyclists"
  
  // Location (optional)
  city            String?
  country         String?
  
  // Settings
  isPublic        Boolean     @default(true)
  
  // Stats
  memberCount     Int         @default(0)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  members         CommunityMember[]
  posts           CommunityPost[]
  
  @@index([sportId])
  @@index([city])
}

model CommunityMember {
  id            String          @id @default(cuid())
  communityId   String
  community     Community       @relation(fields: [communityId], references: [id], onDelete: Cascade)
  userId        String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  role          CommunityRole   @default(MEMBER)
  
  joinedAt      DateTime        @default(now())
  
  @@unique([communityId, userId])
  @@index([userId])
}

enum CommunityRole {
  OWNER
  MODERATOR
  MEMBER
}

model CommunityPost {
  id            String    @id @default(cuid())
  communityId   String
  community     Community @relation(fields: [communityId], references: [id], onDelete: Cascade)
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  content       String
  photos        String[]
  
  likesCount    Int       @default(0)
  commentsCount Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([communityId, createdAt(sort: Desc)])
}
```

---

## API Endpoints

### Teams
```typescript
// GET /api/teams
// Query: sport, city, country, search, page, limit
interface ListTeamsResponse {
  teams: TeamSummary[];
  total: number;
  hasMore: boolean;
}

// GET /api/teams/:slug
interface TeamDetailResponse {
  team: Team;
  members: TeamMemberWithUser[];
  stats: TeamStats;
  recentPosts: TeamPost[];
  currentUserMembership: TeamMember | null;
}

// POST /api/teams
interface CreateTeamRequest {
  name: string;
  description?: string;
  sportId: string;
  city?: string;
  country?: string;
  teamType: TeamType;
  isPublic: boolean;
}

// POST /api/teams/:slug/join
// Request to join a team (or join directly if public)

// POST /api/teams/:slug/leave
// Leave a team

// POST /api/teams/:slug/members/:userId/role
// Update member role (admin only)
interface UpdateRoleRequest {
  role: TeamRole;
}

// GET /api/teams/:slug/requests
// Get pending join requests (admin only)

// POST /api/teams/:slug/requests/:requestId/approve
// POST /api/teams/:slug/requests/:requestId/reject
```

### Communities
```typescript
// GET /api/communities
// Query: sport, city, topic, search, page, limit

// GET /api/communities/:slug
// POST /api/communities
// POST /api/communities/:slug/join
// POST /api/communities/:slug/leave
// Similar structure to teams but simpler (open join, no approval)
```

---

## UI Components

### Team Card (for listings)

```jsx
function TeamCard({ team }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover Image */}
      <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 relative">
        {team.coverPhotoUrl && (
          <img src={team.coverPhotoUrl} className="w-full h-full object-cover" />
        )}
        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center overflow-hidden">
            {team.logoUrl ? (
              <img src={team.logoUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{team.sport.icon}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="pt-8 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{team.name}</h3>
            <p className="text-sm text-gray-500">
              {team.sport.name} • {team.city || team.country}
            </p>
          </div>
          {team.isVerified && (
            <span className="text-blue-500" title="Verified Team">✓</span>
          )}
        </div>
        
        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span>{team.memberCount} members</span>
          {team.globalRank && (
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              #{team.globalRank}
            </span>
          )}
        </div>
        
        {/* Action */}
        <a 
          href={`/teams/${team.slug}`}
          className="mt-4 block w-full py-2 text-center bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          View Team
        </a>
      </div>
    </div>
  );
}
```

### Team Page

```jsx
function TeamPage({ team, members, stats, posts, currentMembership }) {
  const isAdmin = currentMembership?.role === 'OWNER' || currentMembership?.role === 'ADMIN';
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          {team.coverPhotoUrl && (
            <img src={team.coverPhotoUrl} className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end gap-4 -mt-12 pb-4">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
              {team.logoUrl ? (
                <img src={team.logoUrl} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{team.sport.icon}</span>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
                {team.isVerified && (
                  <span className="text-blue-500 text-xl">✓</span>
                )}
              </div>
              <p className="text-gray-600">
                {team.sport.name} • {team.city}, {team.country}
              </p>
            </div>
            
            {/* Actions */}
            <div className="pb-2">
              {!currentMembership ? (
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
                  Join Team
                </button>
              ) : (
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Member ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Info */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 text-sm">{team.description || 'No description'}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{team.memberCount} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(team.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Team Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Team Rank</span>
                  <span className="font-bold text-gray-800">
                    #{team.globalRank || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Total Distance</span>
                  <span className="font-bold text-gray-800">
                    {(team.totalDistance / 1000).toFixed(0)} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Avg Sport Index</span>
                  <span className="font-bold text-gray-800">
                    {team.avgSportIndex.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Activities This Month</span>
                  <span className="font-bold text-gray-800">
                    {stats.activitiesThisMonth}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Top Members */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Top Members</h3>
              <div className="space-y-3">
                {members.slice(0, 5).map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="w-5 text-gray-500 text-sm">{index + 1}.</span>
                    <Avatar src={member.user.avatarUrl} name={member.user.displayName} size="sm" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{member.user.displayName}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {member.user.stats.sportIndex}
                    </span>
                  </div>
                ))}
              </div>
              <a href="#members" className="block mt-3 text-sm text-blue-600 hover:underline">
                View all members →
              </a>
            </div>
          </div>
          
          {/* Right Column - Feed */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* Post Composer (if member) */}
            {currentMembership && (
              <TeamPostComposer teamId={team.id} isAdmin={isAdmin} />
            )}
            
            {/* Team Feed */}
            {posts.map((post) => (
              <TeamPostCard key={post.id} post={post} />
            ))}
            
            {posts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                No posts yet. Be the first to share an update!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Team Post Composer

```jsx
function TeamPostComposer({ teamId, isAdmin }) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('UPDATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    await createTeamPost(teamId, { content, postType });
    setContent('');
    setIsSubmitting(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share an update with your team..."
        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
        rows={3}
      />
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          {isAdmin && (
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="UPDATE">Update</option>
              <option value="ANNOUNCEMENT">📢 Announcement</option>
              <option value="RESULT">🏆 Result</option>
              <option value="EVENT">📅 Event</option>
            </select>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
```

### Team Post Card

```jsx
function TeamPostCard({ post }) {
  const isAnnouncement = post.postType === 'ANNOUNCEMENT';
  
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      isAnnouncement ? 'border-l-4 border-blue-500' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Avatar src={post.user.avatarUrl} name={post.user.displayName} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{post.user.displayName}</span>
            {post.postType === 'ANNOUNCEMENT' && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                Announcement
              </span>
            )}
            {post.postType === 'RESULT' && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                Result
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formatTimeAgo(post.createdAt)}
          </div>
        </div>
        
        {post.isPinned && (
          <span className="text-gray-400" title="Pinned">📌</span>
        )}
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        
        {post.photos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {post.photos.map((photo, i) => (
              <img key={i} src={photo} className="rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Communities List Page

```jsx
function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [filters, setFilters] = useState({
    sport: '',
    city: '',
    search: ''
  });
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Communities</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
          Create Community
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search communities..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filters.sport}
            onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Sports</option>
            <option value="running">🏃 Running</option>
            <option value="cycling">🚴 Cycling</option>
            {/* ... */}
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Locations</option>
            <option value="prague">Prague</option>
            <option value="brno">Brno</option>
            {/* ... */}
          </select>
        </div>
      </div>
      
      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </div>
  );
}
```

### Community Card

```jsx
function CommunityCard({ community }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
        {community.coverPhotoUrl && (
          <img src={community.coverPhotoUrl} className="w-full h-full object-cover" />
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{community.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {community.sport?.name || community.topic} 
          {community.city && ` • ${community.city}`}
        </p>
        
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {community.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {community.memberCount} members
          </span>
          <a 
            href={`/communities/${community.slug}`}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            View →
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## Background Jobs

### Update Team Stats

```typescript
// Run hourly or after member activities
async function updateTeamStats(teamId: string) {
  const members = await db.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        include: { stats: true }
      }
    }
  });
  
  // Calculate aggregates
  const totalDistance = members.reduce((sum, m) => sum + (m.user.stats?.totalDistance || 0), 0);
  const totalActivities = members.reduce((sum, m) => sum + (m.user.stats?.totalActivities || 0), 0);
  const avgSportIndex = members.length > 0
    ? members.reduce((sum, m) => sum + (m.user.stats?.sportIndex || 0), 0) / members.length
    : 0;
  
  await db.team.update({
    where: { id: teamId },
    data: {
      memberCount: members.length,
      totalDistance,
      totalActivities,
      avgSportIndex
    }
  });
}

// Calculate team rankings
async function calculateTeamRankings() {
  const teams = await db.team.findMany({
    orderBy: { avgSportIndex: 'desc' }
  });
  
  for (let i = 0; i < teams.length; i++) {
    await db.team.update({
      where: { id: teams[i].id },
      data: { globalRank: i + 1 }
    });
  }
}
```
