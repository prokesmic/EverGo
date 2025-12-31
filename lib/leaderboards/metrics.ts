/**
 * Metric definitions for leaderboards
 * This is the single source of truth for sort direction and display
 */

export type MetricKey = string

export type MetricMeta = {
  key: MetricKey
  label: string
  unit: string
  // "DESC" means higher is better, "ASC" means lower is better (e.g., time)
  order: "ASC" | "DESC"
  // Format function for display
  formatValue: (value: number) => string
}

/**
 * Format seconds as mm:ss or hh:mm:ss
 */
function formatTime(seconds: number): string {
  if (seconds < 0) return "--:--"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

/**
 * Format pace as min/km
 */
function formatPace(secondsPerKm: number): string {
  if (secondsPerKm <= 0) return "--:--"
  const m = Math.floor(secondsPerKm / 60)
  const s = Math.floor(secondsPerKm % 60)
  return `${m}:${s.toString().padStart(2, "0")}/km`
}

/**
 * Format distance in km
 */
function formatDistance(meters: number): string {
  const km = meters / 1000
  if (km >= 100) return `${Math.round(km)} km`
  if (km >= 10) return `${km.toFixed(1)} km`
  return `${km.toFixed(2)} km`
}

/**
 * Format points/score
 */
function formatPoints(value: number): string {
  return value.toLocaleString()
}

/**
 * Core metrics registry
 * Maps metricKey -> MetricMeta
 */
export const METRICS: Record<string, MetricMeta> = {
  // Universal Activity Score (Sport Index)
  "activity:score": {
    key: "activity:score",
    label: "Sport Index",
    unit: "pts",
    order: "DESC",
    formatValue: formatPoints,
  },

  // Activity Score (30-day effort)
  "activity:effort": {
    key: "activity:effort",
    label: "Activity Score",
    unit: "pts",
    order: "DESC",
    formatValue: formatPoints,
  },

  // Running benchmarks
  "running:5k_time": {
    key: "running:5k_time",
    label: "5K Time",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },
  "running:10k_time": {
    key: "running:10k_time",
    label: "10K Time",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },
  "running:half_marathon_time": {
    key: "running:half_marathon_time",
    label: "Half Marathon",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },
  "running:marathon_time": {
    key: "running:marathon_time",
    label: "Marathon",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },

  // Cycling benchmarks
  "cycling:ftp": {
    key: "cycling:ftp",
    label: "FTP",
    unit: "W",
    order: "DESC",
    formatValue: (v) => `${Math.round(v)} W`,
  },
  "cycling:100km_time": {
    key: "cycling:100km_time",
    label: "100K Time",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },

  // Swimming benchmarks
  "swimming:100m_time": {
    key: "swimming:100m_time",
    label: "100m Time",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },
  "swimming:1500m_time": {
    key: "swimming:1500m_time",
    label: "1500m Time",
    unit: "time",
    order: "ASC",
    formatValue: formatTime,
  },
}

/**
 * Get metric metadata or throw if unknown
 */
export function getMetricMeta(key: MetricKey): MetricMeta {
  const meta = METRICS[key]
  if (!meta) {
    // Fallback for dynamic/unknown metrics
    return {
      key,
      label: key.replace(/_/g, " ").replace(/:/g, ": "),
      unit: "",
      order: "DESC",
      formatValue: formatPoints,
    }
  }
  return meta
}

/**
 * Get all available metric keys
 */
export function getAllMetricKeys(): MetricKey[] {
  return Object.keys(METRICS)
}

/**
 * Get default metric for a sport
 */
export function getDefaultMetricForSport(sportSlug: string): MetricKey {
  const sportMetrics: Record<string, MetricKey> = {
    running: "running:5k_time",
    cycling: "cycling:ftp",
    swimming: "swimming:100m_time",
  }
  return sportMetrics[sportSlug] ?? "activity:score"
}
