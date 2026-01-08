/**
 * Percentile Calculations
 *
 * Uses Standard Competition Ranking for ties ("1224" method):
 * - If users tie at rank 1, next rank is 3 (not 2)
 * - Percentile = ((N - rank) / N) * 100
 */

/**
 * Format percentile for display
 * "Top X%" format that's always meaningful
 */
export function formatPercentile(percentile: number): string {
  // Round to nearest integer for clean display
  const rounded = Math.round(percentile)

  // Clamp to valid range
  const clamped = Math.max(1, Math.min(99, rounded))

  // "Top X%" is intuitive - lower number = better
  // percentile 95 means "Top 5%"
  const topPercent = 100 - clamped

  if (topPercent <= 1) {
    return "Top 1%"
  } else if (topPercent <= 5) {
    return `Top ${topPercent}%`
  } else if (topPercent <= 10) {
    return `Top ${topPercent}%`
  } else if (topPercent <= 25) {
    return `Top ${Math.round(topPercent / 5) * 5}%`
  } else if (topPercent <= 50) {
    return `Top ${Math.round(topPercent / 10) * 10}%`
  } else {
    // For bottom half, show actual percentile
    return `${clamped}th percentile`
  }
}

/**
 * Calculate percentile from rank and total
 * Uses standard formula: ((N - rank + 1) / N) * 100
 *
 * Example: rank 1 of 100 = 100th percentile (top)
 * Example: rank 100 of 100 = 1st percentile (bottom)
 */
export function calculatePercentile(rank: number, total: number): number {
  if (total <= 0) return 0
  if (rank <= 0) return 100

  // Standard percentile formula
  const percentile = ((total - rank + 1) / total) * 100

  return Math.max(0, Math.min(100, percentile))
}

/**
 * Format rank for display with context
 * Handles the "Rank #2 of 2" problem by using percentiles when total is low
 */
export function formatRankDisplay(
  rank: number,
  total: number,
  options: { showPercentile?: boolean; minForRank?: number } = {}
): string {
  const { showPercentile = true, minForRank = 10 } = options

  // If total is too low, percentiles are more meaningful than ranks
  if (total < minForRank && showPercentile) {
    const percentile = calculatePercentile(rank, total)
    return formatPercentile(percentile)
  }

  // Standard rank display for larger pools
  const suffix = getOrdinalSuffix(rank)
  return `${rank}${suffix}`
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

/**
 * Format standings display for the ribbon
 * Prioritizes percentile for clarity
 */
export function formatStandingsDisplay(
  rank: number,
  total: number,
  scope: string
): { primary: string; secondary: string } {
  const percentile = calculatePercentile(rank, total)
  const formattedPercentile = formatPercentile(percentile)

  // Primary is always percentile (more meaningful)
  // Secondary shows rank/total for context
  return {
    primary: formattedPercentile,
    secondary: `#${rank} of ${total.toLocaleString()} ${scope}`,
  }
}
