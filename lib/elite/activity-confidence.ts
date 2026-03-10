import { prisma } from "@/lib/db"

export type ConfidenceBand = "LOW" | "MEDIUM" | "HIGH" | "VERIFIED"

export interface ActivityConfidence {
  score: number
  band: ConfidenceBand
  checks: Array<{
    label: string
    impact: number
    status: "PASS" | "WARN" | "FAIL"
  }>
}

export async function getActivityConfidence(activityId: string): Promise<ActivityConfidence | null> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: {
      id: true,
      source: true,
      proofLevel: true,
      verificationTier: true,
      anomalyScore: true,
      isAnomalous: true,
      gpsRoute: true,
      avgHeartRate: true,
      durationSeconds: true,
      distanceMeters: true,
      userId: true,
    },
  })

  if (!activity) return null
  return computeActivityConfidence(activity)
}

export function computeActivityConfidence(activity: {
  source: string
  proofLevel: string
  verificationTier: string
  anomalyScore: number | null
  isAnomalous: boolean
  gpsRoute: string | null
  avgHeartRate: number | null
  durationSeconds: number | null
  distanceMeters: number | null
}) {
  let score = 45
  const checks: ActivityConfidence["checks"] = []

  const source = activity.source.toUpperCase()
  if (source === "MANUAL") {
    checks.push({ label: "Manual entry source", impact: -8, status: "WARN" })
    score -= 8
  } else {
    checks.push({ label: "Connected/imported source", impact: 12, status: "PASS" })
    score += 12
  }

  const proofLevel = activity.proofLevel.toUpperCase()
  if (proofLevel === "MANUAL") {
    checks.push({ label: "No external proof attached", impact: -6, status: "WARN" })
    score -= 6
  } else if (proofLevel === "PHOTO" || proofLevel === "GPX") {
    checks.push({ label: "Evidence attached", impact: 10, status: "PASS" })
    score += 10
  } else {
    checks.push({ label: "Sensor or verified proof", impact: 16, status: "PASS" })
    score += 16
  }

  const verificationTier = activity.verificationTier.toUpperCase()
  if (verificationTier === "PLATINUM") {
    checks.push({ label: "Top verification tier", impact: 10, status: "PASS" })
    score += 10
  } else if (verificationTier === "GOLD") {
    checks.push({ label: "High verification tier", impact: 7, status: "PASS" })
    score += 7
  } else if (verificationTier === "BRONZE") {
    checks.push({ label: "Entry verification tier", impact: -3, status: "WARN" })
    score -= 3
  }

  if (activity.gpsRoute) {
    checks.push({ label: "GPS route present", impact: 8, status: "PASS" })
    score += 8
  } else if ((activity.distanceMeters ?? 0) > 3000) {
    checks.push({ label: "No GPS route for long effort", impact: -6, status: "WARN" })
    score -= 6
  }

  if (activity.avgHeartRate && activity.durationSeconds && activity.durationSeconds > 900) {
    checks.push({ label: "Heart-rate telemetry available", impact: 5, status: "PASS" })
    score += 5
  }

  if (activity.isAnomalous) {
    checks.push({ label: "Anomaly detected by integrity checks", impact: -20, status: "FAIL" })
    score -= 20
  } else if ((activity.anomalyScore ?? 0) > 40) {
    checks.push({ label: "Moderate anomaly risk", impact: -10, status: "WARN" })
    score -= 10
  }

  score = Math.max(5, Math.min(99, Math.round(score)))
  const band: ConfidenceBand =
    score >= 90 ? "VERIFIED" : score >= 72 ? "HIGH" : score >= 50 ? "MEDIUM" : "LOW"

  return { score, band, checks }
}

export async function createActivityDispute(input: {
  reporterUserId: string
  activityId: string
  reason: string
  note?: string
}) {
  const activity = await prisma.activity.findUnique({
    where: { id: input.activityId },
    select: {
      id: true,
      userId: true,
      title: true,
    },
  })

  if (!activity) {
    throw new Error("Activity not found")
  }

  if (activity.userId === input.reporterUserId) {
    throw new Error("You cannot dispute your own activity")
  }

  const dispute = await prisma.dispute.create({
    data: {
      reporterUserId: input.reporterUserId,
      againstUserId: activity.userId,
      activityId: activity.id,
      reason: input.reason,
      detailJson: {
        note: input.note ?? null,
        source: "activity-confidence",
      },
    },
  })

  await prisma.notification.create({
    data: {
      userId: activity.userId,
      type: "INTEGRITY_DISPUTE",
      title: "Activity under review",
      message: `Your activity "${activity.title}" was flagged for review.`,
      data: JSON.stringify({ activityId: activity.id, disputeId: dispute.id }),
    },
  })

  return dispute
}
