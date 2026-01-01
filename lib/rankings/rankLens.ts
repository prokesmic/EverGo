// lib/rankings/rankLens.ts

export type RankMetric = "SPORT_INDEX" | "FITNESS_SCORE"

export type RankScope = "GLOBAL" | "COUNTRY" | "CITY" | "TEAM"

export type RankLens = {
  metric: RankMetric
  sportId: string | null // null => overall
  disciplineId: string | null // null => all disciplines in sport / overall
}

export const DEFAULT_RANK_LENS: RankLens = {
  metric: "SPORT_INDEX",
  sportId: null,
  disciplineId: null,
}

export function normalizeRankLens(
  x: Partial<RankLens> | null | undefined
): RankLens {
  const metric: RankMetric =
    x?.metric === "FITNESS_SCORE" ? "FITNESS_SCORE" : "SPORT_INDEX"

  const sportId = x?.sportId ?? null
  const disciplineId = x?.disciplineId ?? null

  return { metric, sportId, disciplineId }
}

export function lensToQuery(lens: RankLens): string {
  const sp = new URLSearchParams()
  sp.set("metric", lens.metric)
  if (lens.sportId) sp.set("sportId", lens.sportId)
  if (lens.disciplineId) sp.set("disciplineId", lens.disciplineId)
  return sp.toString()
}

export function lensFromParams(params: URLSearchParams): RankLens {
  return normalizeRankLens({
    metric: params.get("metric") as RankMetric | null ?? undefined,
    sportId: params.get("sportId"),
    disciplineId: params.get("disciplineId"),
  })
}

export function formatLensLabel(
  sportName: string | null,
  disciplineName: string | null,
  metric: RankMetric
): string {
  const parts: string[] = []

  if (sportName) {
    parts.push(sportName)
  } else {
    parts.push("Overall")
  }

  if (disciplineName) {
    parts.push(disciplineName)
  }

  parts.push(metric === "FITNESS_SCORE" ? "Fitness" : "Sport Index")

  return parts.join(" · ")
}
