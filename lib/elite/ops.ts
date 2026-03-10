import { createHash } from "crypto"
import { prisma } from "@/lib/db"

export interface ExperimentAssignment {
  experiment: string
  variant: string
  rationale: string
}

export interface RetentionCohortSnapshot {
  cohort: string
  users: number
  activeD1: number
  activeD7: number
  activeD30: number
}

export interface OpsSLOSnapshot {
  generatedAt: string
  checks: Array<{
    name: string
    status: "OK" | "WARN" | "FAIL"
    value: string
  }>
}

export function assignExperimentVariant(userId: string, experiment: string, variants: string[]) {
  if (variants.length === 0) throw new Error("At least one variant is required")
  const hash = createHash("sha256").update(`${experiment}:${userId}`).digest("hex")
  const bucket = Number.parseInt(hash.slice(0, 8), 16)
  return variants[bucket % variants.length]
}

export function getExperimentAssignments(userId: string): ExperimentAssignment[] {
  const experiments = [
    {
      key: "feed-ranking-v3",
      variants: ["control", "diverse_ranking"],
      rationale: "Optimizes feed depth and return rate",
    },
    {
      key: "coach-cta-layout",
      variants: ["compact", "hero_primary"],
      rationale: "Improves completion of planned sessions",
    },
    {
      key: "route-intel-priority",
      variants: ["popularity_first", "safety_first"],
      rationale: "Balances adoption vs route safety confidence",
    },
  ]

  return experiments.map((experiment) => ({
    experiment: experiment.key,
    variant: assignExperimentVariant(userId, experiment.key, experiment.variants),
    rationale: experiment.rationale,
  }))
}

export async function getRetentionCohortSnapshot(): Promise<RetentionCohortSnapshot[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      createdAt: true,
      activities: {
        select: { activityDate: true },
      },
    },
    take: 5000,
  })

  const bucket = new Map<string, RetentionCohortSnapshot>()
  const now = Date.now()

  for (const user of users) {
    const created = user.createdAt
    const cohortKey = `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}`
    const snapshot =
      bucket.get(cohortKey) ??
      {
        cohort: cohortKey,
        users: 0,
        activeD1: 0,
        activeD7: 0,
        activeD30: 0,
      }

    snapshot.users += 1

    const activeWindows = {
      d1: false,
      d7: false,
      d30: false,
    }

    for (const activity of user.activities) {
      const deltaDays = Math.floor((activity.activityDate.getTime() - created.getTime()) / 86_400_000)
      if (deltaDays >= 0 && deltaDays <= 1) activeWindows.d1 = true
      if (deltaDays >= 0 && deltaDays <= 7) activeWindows.d7 = true
      if (deltaDays >= 0 && deltaDays <= 30) activeWindows.d30 = true
    }

    if (activeWindows.d1) snapshot.activeD1 += 1
    if (activeWindows.d7) snapshot.activeD7 += 1
    if (activeWindows.d30) snapshot.activeD30 += 1

    bucket.set(cohortKey, snapshot)

    if (Date.now() - now > 3_000) {
      // Avoid long stalls on large datasets in runtime environments.
      break
    }
  }

  return [...bucket.values()].sort((a, b) => b.cohort.localeCompare(a.cohort))
}

export async function getOpsSLOSnapshot(): Promise<OpsSLOSnapshot> {
  const [failedJobs24h, pendingJobs, unreadIntegrity, dbProbe] = await Promise.all([
    prisma.jobQueue.count({
      where: {
        status: "FAILED",
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.jobQueue.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),
    prisma.notification.count({
      where: {
        type: "INTEGRITY_DISPUTE",
        isRead: false,
      },
    }),
    probeDbHealth(),
  ])

  return {
    generatedAt: new Date().toISOString(),
    checks: [
      {
        name: "Database probe latency",
        status: dbProbe.ms < 250 ? "OK" : dbProbe.ms < 800 ? "WARN" : "FAIL",
        value: `${dbProbe.ms}ms`,
      },
      {
        name: "Failed jobs (24h)",
        status: failedJobs24h === 0 ? "OK" : failedJobs24h < 8 ? "WARN" : "FAIL",
        value: String(failedJobs24h),
      },
      {
        name: "Queue backlog",
        status: pendingJobs < 120 ? "OK" : pendingJobs < 400 ? "WARN" : "FAIL",
        value: String(pendingJobs),
      },
      {
        name: "Open integrity alerts",
        status: unreadIntegrity === 0 ? "OK" : unreadIntegrity < 20 ? "WARN" : "FAIL",
        value: String(unreadIntegrity),
      },
    ],
  }
}

async function probeDbHealth() {
  const start = Date.now()
  await prisma.user.count({ take: 1 })
  return { ms: Date.now() - start }
}
