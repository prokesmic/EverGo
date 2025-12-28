/**
 * Compare values to determine if a new value is a personal best
 */
export function isBetter(
  value: number,
  current: number | null | undefined,
  higherIsBetter: boolean
): boolean {
  if (current == null) return true
  return higherIsBetter ? value > current : value < current
}

/**
 * Epley formula for 1RM estimate from weight and reps
 */
export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg
  return weightKg * (1 + reps / 30)
}

/**
 * Map result string to numeric value
 */
export function resultToValue(result: "win" | "draw" | "loss"): number {
  switch (result) {
    case "win":
      return 1
    case "draw":
      return 0.5
    case "loss":
      return 0
  }
}
