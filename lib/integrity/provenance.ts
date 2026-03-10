export interface ActivityProvenanceItem {
  label: string
  detail: string
  status: "OK" | "WARN" | "FLAG"
  timestamp: string
}

export function buildActivityProvenance(activity: {
  activityDate: Date
  createdAt: Date
  updatedAt: Date
  source: string
  proofLevel: string
  verificationTier: string
  gpsRoute: string | null
  avgHeartRate: number | null
  anomalyScore: number | null
  isAnomalous: boolean
}) {
  const items: ActivityProvenanceItem[] = []
  const sourceLabel = activity.source.toUpperCase()
  const proofLabel = activity.proofLevel.toUpperCase()
  const tierLabel = activity.verificationTier.toUpperCase()

  items.push({
    label: "Recorded",
    detail: "Activity timestamped",
    status: "OK",
    timestamp: activity.activityDate.toISOString(),
  })

  items.push({
    label: "Data source",
    detail: sourceLabel === "MANUAL" ? "Manual entry" : "Connected device or import",
    status: sourceLabel === "MANUAL" ? "WARN" : "OK",
    timestamp: activity.createdAt.toISOString(),
  })

  items.push({
    label: "Proof",
    detail: proofLabel === "MANUAL" ? "No external proof attached" : `${proofLabel} attached`,
    status: proofLabel === "MANUAL" ? "WARN" : "OK",
    timestamp: activity.updatedAt.toISOString(),
  })

  items.push({
    label: "Verification tier",
    detail: tierLabel,
    status: tierLabel === "BRONZE" ? "WARN" : "OK",
    timestamp: activity.updatedAt.toISOString(),
  })

  if (activity.gpsRoute) {
    items.push({
      label: "GPS telemetry",
      detail: "Route captured and stored",
      status: "OK",
      timestamp: activity.updatedAt.toISOString(),
    })
  }

  if (activity.avgHeartRate) {
    items.push({
      label: "Heart-rate data",
      detail: "HR telemetry available",
      status: "OK",
      timestamp: activity.updatedAt.toISOString(),
    })
  }

  if (activity.isAnomalous || (activity.anomalyScore ?? 0) > 40) {
    items.push({
      label: "Integrity review",
      detail: "Anomaly signal detected for review",
      status: "FLAG",
      timestamp: activity.updatedAt.toISOString(),
    })
  }

  return items
}
