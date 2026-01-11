import { z } from "zod"

/**
 * API Contract Schemas
 *
 * Centralized Zod schemas for API request/response validation.
 * Use these in API routes to ensure type safety and contract hygiene.
 *
 * Convention:
 * - *RequestSchema: Validates incoming request body/params
 * - *ResponseSchema: Defines response shape (for documentation)
 * - *ParamsSchema: Validates URL params
 * - *QuerySchema: Validates query string params
 */

// Common building blocks
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
})

// User schemas
export const userPreviewSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
})

export type UserPreview = z.infer<typeof userPreviewSchema>

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().min(2, "Query must be at least 2 characters"),
  type: z.enum(["all", "users", "teams", "challenges"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const searchResultItemSchema = z.object({
  type: z.enum(["user", "team", "challenge"]),
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  image: z.string().nullable().optional(),
  icon: z.string().optional(),
})

export const searchResponseSchema = z.object({
  results: z.array(searchResultItemSchema),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
export type SearchResultItem = z.infer<typeof searchResultItemSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>

// Activity schemas
export const createActivityRequestSchema = z.object({
  sportId: z.string().min(1, "Sport is required"),
  disciplineId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  activityDate: z.string().datetime(),
  durationSeconds: z.number().int().positive("Duration must be positive"),
  distanceMeters: z.number().positive().optional().nullable(),
  elevationGain: z.number().optional().nullable(),
  avgHeartRate: z.number().int().positive().optional().nullable(),
  maxHeartRate: z.number().int().positive().optional().nullable(),
  avgPace: z.number().positive().optional().nullable(),
  caloriesBurned: z.number().int().positive().optional().nullable(),
  rpe: z.number().int().min(1).max(10).optional(),
  isRace: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).default("PUBLIC"),
})

export type CreateActivityRequest = z.infer<typeof createActivityRequestSchema>

// Feed schemas
export const feedQuerySchema = z.object({
  type: z.enum(["all", "following", "friends"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const feedPostSchema = z.object({
  id: z.string(),
  postType: z.string(),
  content: z.string().nullable(),
  photos: z.array(z.string()),
  mapImageUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  visibility: z.string(),
  user: userPreviewSchema,
  activity: z.object({
    id: z.string(),
    title: z.string().nullable(),
    sportName: z.string(),
    sportIcon: z.string(),
    durationSeconds: z.number().nullable(),
    distanceMeters: z.number().nullable(),
    caloriesBurned: z.number().nullable(),
    elevationGain: z.number().nullable(),
    avgPace: z.number().nullable(),
    avgHeartRate: z.number().nullable(),
  }).nullable(),
  engagement: z.object({
    likesCount: z.number(),
    commentsCount: z.number(),
    isLikedByMe: z.boolean(),
  }),
})

export const feedResponseSchema = z.object({
  posts: z.array(feedPostSchema),
  hasMore: z.boolean(),
  nextPage: z.number().nullable(),
})

export type FeedQuery = z.infer<typeof feedQuerySchema>
export type FeedPost = z.infer<typeof feedPostSchema>
export type FeedResponse = z.infer<typeof feedResponseSchema>

// Follow schemas
export const followRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
})

export type FollowRequest = z.infer<typeof followRequestSchema>

// Gauntlet schemas
export const createGauntletRequestSchema = z.object({
  challengedUserId: z.string().min(1, "Challenged user is required"),
  sportId: z.string().min(1, "Sport is required"),
  disciplineId: z.string().optional(),
  metric: z.enum(["DISTANCE", "DURATION", "POWER"]),
  targetValue: z.number().positive("Target must be positive"),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  wager: z.string().optional(),
})

export type CreateGauntletRequest = z.infer<typeof createGauntletRequestSchema>

// Rankings schemas
export const rankingsQuerySchema = z.object({
  scope: z.enum(["global", "country", "city"]).default("global"),
  sport: z.string().optional(),
  period: z.enum(["week", "month", "season", "alltime"]).default("week"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const leaderboardEntrySchema = z.object({
  rank: z.number().int().positive(),
  userId: z.string(),
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  score: z.number(),
  delta: z.number().optional(),
})

export const leaderboardResponseSchema = z.object({
  entries: z.array(leaderboardEntrySchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  userPosition: leaderboardEntrySchema.nullable().optional(),
})

export type RankingsQuery = z.infer<typeof rankingsQuerySchema>
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>

// API error response
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.string()).optional(),
})

export type ApiError = z.infer<typeof apiErrorSchema>

// Helper function to validate request body
export function validateBody<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join(", "),
  }
}

// Helper function to validate query params
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  params: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const obj: Record<string, string> = {}
  params.forEach((value, key) => {
    obj[key] = value
  })
  return validateBody(schema, obj)
}
