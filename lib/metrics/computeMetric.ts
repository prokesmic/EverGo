/**
 * Metric Computation Engine
 *
 * Central place to compute any metric value for a user/sport.
 * Enforces sensor requirements based on SPORTS_CONFIG.
 *
 * KEY PRINCIPLE: If a metric requires sensor data, only activities
 * from sensor sources (Strava, Garmin, etc.) contribute to that metric.
 */

import { prisma } from "@/lib/db"
import { subDays } from "date-fns"
import {
  getSportConfig,
  getSportMetric,
  isSensorSource,
  SENSOR_SOURCES,
  type RankingMetric,
} from "@/lib/sports/config"

// =============================================================================
// TYPES
// =============================================================================

export type MetricRange = "week" | "month" | "year" | "all"

export interface ComputeMetricParams {
  metricKey: string
  userId: string
  sportSlug?: string | null
  range?: MetricRange
  /** Override sensor requirement check */
  ignoreSensorRequirement?: boolean
}

export interface MetricResult {
  value: number | null
  unit?: string
  formatted?: string
  /** Whether this result includes sensor-only data */
  isSensorVerified: boolean
  /** Metric configuration used */
  metric?: RankingMetric
}

// =============================================================================
// RANGE CALCULATION
// =============================================================================

function getDateRange(
  range: MetricRange,
  userCreatedAt?: Date
): { start: Date; end: Date } {
  const end = new Date()
  let start: Date

  switch (range) {
    case "week":
      start = subDays(end, 7)
      break
    case "month":
      start = subDays(end, 30)
      break
    case "year":
      start = subDays(end, 365)
      break
    case "all":
      start = userCreatedAt ?? new Date(0)
      break
    default:
      start = subDays(end, 7)
  }

  return { start, end }
}

// =============================================================================
// SOURCE FILTER
// =============================================================================

/**
 * Build source filter for Prisma queries
 * If requiresSensor is true, only include sensor sources
 */
function getSourceFilter(requiresSensor: boolean): object | undefined {
  if (!requiresSensor) return undefined

  return {
    source: {
      in: SENSOR_SOURCES as unknown as string[],
    },
  }
}

// =============================================================================
// MAIN COMPUTE FUNCTION
// =============================================================================

export async function computeMetric(
  params: ComputeMetricParams
): Promise<MetricResult> {
  const {
    metricKey,
    userId,
    sportSlug,
    range = "week",
    ignoreSensorRequirement = false,
  } = params

  // Get metric configuration
  const metric = sportSlug ? getSportMetric(sportSlug, metricKey) : undefined
  const requiresSensor =
    !ignoreSensorRequirement && (metric?.requiresSensor ?? false)

  // Get user for date range
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  })

  const { start, end } = getDateRange(range, user?.createdAt)

  // Compute based on metric key
  const result = await computeMetricValue({
    metricKey,
    userId,
    sportSlug,
    start,
    end,
    requiresSensor,
  })

  return {
    value: result.value,
    unit: metric?.unit ?? result.unit,
    formatted: formatMetricValue(result.value, metric),
    isSensorVerified: requiresSensor,
    metric,
  }
}

// =============================================================================
// METRIC VALUE COMPUTATION
// =============================================================================

interface ComputeValueParams {
  metricKey: string
  userId: string
  sportSlug?: string | null
  start: Date
  end: Date
  requiresSensor: boolean
}

interface RawResult {
  value: number | null
  unit?: string
}

async function computeMetricValue(params: ComputeValueParams): Promise<RawResult> {
  const { metricKey, userId, sportSlug, start, end, requiresSensor } = params

  // Build base where clause
  const baseWhere = {
    userId,
    activityDate: { gte: start, lte: end },
    ...(requiresSensor ? getSourceFilter(true) : {}),
  }

  // Sport filter if provided
  const sportFilter = sportSlug
    ? {
        discipline: {
          sport: {
            slug: sportSlug,
          },
        },
      }
    : {}

  const where = { ...baseWhere, ...sportFilter }

  switch (metricKey) {
    // =========================================================================
    // VOLUME METRICS
    // =========================================================================
    case "distance": {
      const result = await prisma.activity.aggregate({
        where,
        _sum: { distanceMeters: true },
      })
      const km = (result._sum.distanceMeters ?? 0) / 1000
      return { value: km, unit: "km" }
    }

    case "elevation_gain":
    case "vertical_descent": {
      const result = await prisma.activity.aggregate({
        where,
        _sum: { elevationGain: true },
      })
      return { value: result._sum.elevationGain ?? 0, unit: "m" }
    }

    case "active_time": {
      const result = await prisma.activity.aggregate({
        where,
        _sum: { durationSeconds: true },
      })
      return { value: result._sum.durationSeconds ?? 0, unit: "s" }
    }

    case "sessions":
    case "activities": {
      const count = await prisma.activity.count({ where })
      return { value: count }
    }

    case "calories": {
      const result = await prisma.activity.aggregate({
        where,
        _sum: { caloriesBurned: true },
      })
      return { value: result._sum.caloriesBurned ?? 0, unit: "kcal" }
    }

    case "tonnage": {
      // TODO: Implement when we have set/rep data
      // For now, estimate from duration * intensity
      return { value: null, unit: "kg" }
    }

    // =========================================================================
    // CONSISTENCY METRICS
    // =========================================================================
    case "days_active": {
      // Build sensor filter clause if needed
      const sensorClause = requiresSensor
        ? `AND "source" IN (${SENSOR_SOURCES.map((s) => `'${s}'`).join(", ")})`
        : ""

      const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `
        SELECT COUNT(DISTINCT DATE("activityDate")) as count
        FROM "Activity"
        WHERE "userId" = $1
          AND "activityDate" >= $2
          AND "activityDate" <= $3
          ${sensorClause}
        `,
        userId,
        start,
        end
      )
      return { value: Number(result[0]?.count ?? 0), unit: "days" }
    }

    case "streak": {
      const userStreak = await prisma.userStreak.findUnique({
        where: { userId },
        select: { currentStreak: true },
      })
      return { value: userStreak?.currentStreak ?? 0, unit: "days" }
    }

    case "variety": {
      const result = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT d."sportId") as count
        FROM "Activity" a
        JOIN "Discipline" d ON a."disciplineId" = d."id"
        WHERE a."userId" = ${userId}
          AND a."activityDate" >= ${start}
          AND a."activityDate" <= ${end}
      `
      return { value: Number(result[0]?.count ?? 0) }
    }

    // =========================================================================
    // PERFORMANCE METRICS (often require sensor)
    // =========================================================================
    case "sport_index": {
      const stats = await prisma.userStats.findUnique({
        where: { userId },
        select: { sportIndex: true },
      })
      return { value: stats?.sportIndex ?? 0 }
    }

    case "multisport_index": {
      // Computed by multisportIndex.ts
      // For now return sport_index as placeholder
      const stats = await prisma.userStats.findUnique({
        where: { userId },
        select: { sportIndex: true },
      })
      return { value: stats?.sportIndex ?? 0 }
    }

    case "max_speed": {
      const result = await prisma.activity.aggregate({
        where,
        _max: { avgSpeed: true }, // Using avgSpeed as proxy for maxSpeed
      })
      return { value: result._max.avgSpeed ?? null, unit: "km/h" }
    }

    case "avg_pace":
    case "pace_5k":
    case "pace_10k": {
      // Get best pace from activities
      const activities = await prisma.activity.findMany({
        where: {
          ...where,
          avgPace: { not: null },
          distanceMeters: { gte: metricKey === "pace_10k" ? 10000 : 5000 },
        },
        select: { avgPace: true },
        orderBy: { avgPace: "asc" }, // Lower is better
        take: 1,
      })
      return { value: activities[0]?.avgPace ?? null, unit: "s/km" }
    }

    // =========================================================================
    // SKILL METRICS (sport-specific)
    // =========================================================================
    case "max_jump_height": {
      // TODO: Requires maxJumpHeightMeters field in Activity
      // For now check if we have any data in raw JSON
      return { value: null, unit: "m" }
    }

    case "total_airtime": {
      // TODO: Requires totalAirtimeSeconds field in Activity
      return { value: null, unit: "s" }
    }

    case "longest_ride": {
      // For surfing - longest continuous segment
      // TODO: Implement when we have segment data
      return { value: null, unit: "s" }
    }

    case "session_rating": {
      // Average session rating (manual entry)
      // TODO: Requires sessionRating field in Activity
      return { value: null }
    }

    case "wave_count": {
      // TODO: Requires waveCount field in Activity
      return { value: null }
    }

    case "power_20min_wkg": {
      // TODO: Requires power data and user weight
      // Would need best 20min power from activities / user weight
      return { value: null, unit: "W/kg" }
    }

    case "ftp": {
      // Functional Threshold Power
      // TODO: Requires power meter data
      return { value: null, unit: "W" }
    }

    case "pyramid_top5_points": {
      // Climbing pyramid score
      // TODO: Implement when we have climb/send data
      return { value: null }
    }

    case "hardest_grade": {
      // TODO: Implement when we have grade data
      return { value: null }
    }

    case "strength_index": {
      // Composite strength score
      // TODO: Implement when we have lift data
      return { value: null }
    }

    case "benchmark_wod": {
      // Best benchmark WOD time
      // TODO: Implement when we have WOD tracking
      return { value: null, unit: "s" }
    }

    case "sinclair_total": {
      // Olympic weightlifting total
      // TODO: Implement when we have lift data
      return { value: null, unit: "kg" }
    }

    case "matches_played": {
      // Count activities that are matches/games
      const count = await prisma.activity.count({ where })
      return { value: count }
    }

    case "elo_rating": {
      // TODO: Implement ELO system
      return { value: null }
    }

    default:
      console.warn(`[computeMetric] Unknown metric key: ${metricKey}`)
      return { value: null }
  }
}

// =============================================================================
// FORMATTING
// =============================================================================

function formatMetricValue(
  value: number | null,
  metric?: RankingMetric
): string {
  if (value === null || value === undefined) return "—"

  if (!metric) return String(Math.round(value))

  switch (metric.format) {
    case "TIME": {
      // Format as MM:SS or HH:MM:SS
      const totalSeconds = Math.round(value)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      }
      return `${m}:${s.toString().padStart(2, "0")}`
    }

    case "DURATION": {
      // Format as Xh Ym
      const totalMinutes = Math.round(value / 60)
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      if (hours > 0) {
        return `${hours}h ${mins}m`
      }
      return `${mins}m`
    }

    case "DISTANCE": {
      // Format as X.X km
      if (value >= 100) {
        return `${Math.round(value).toLocaleString()}`
      }
      return value.toFixed(1)
    }

    case "SPEED":
      return `${value.toFixed(1)}`

    case "POWER":
      return metric.unit === "W/kg"
        ? value.toFixed(2)
        : Math.round(value).toString()

    case "HEIGHT":
      return value >= 100
        ? Math.round(value).toLocaleString()
        : value.toFixed(1)

    case "WEIGHT":
      return Math.round(value).toLocaleString()

    case "PACE": {
      // Format as M:SS/km
      const mins = Math.floor(value / 60)
      const secs = Math.round(value % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    case "PERCENT":
      return `${Math.round(value)}%`

    case "SCORE":
      return Math.round(value).toString()

    case "NUMBER":
      return Math.round(value).toLocaleString()

    case "GRADE":
      // Climbing grades - would need grade conversion
      return String(value)

    default:
      return String(Math.round(value))
  }
}

// =============================================================================
// BATCH COMPUTATION
// =============================================================================

/**
 * Compute multiple metrics at once for efficiency
 */
export async function computeMetrics(
  userId: string,
  metricKeys: string[],
  options: {
    sportSlug?: string | null
    range?: MetricRange
  } = {}
): Promise<Record<string, MetricResult>> {
  const results: Record<string, MetricResult> = {}

  // Compute in parallel
  await Promise.all(
    metricKeys.map(async (key) => {
      results[key] = await computeMetric({
        metricKey: key,
        userId,
        sportSlug: options.sportSlug,
        range: options.range,
      })
    })
  )

  return results
}
