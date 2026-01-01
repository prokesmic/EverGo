// lib/rankings/rankLensStorage.ts
import { RankLens, DEFAULT_RANK_LENS, normalizeRankLens } from "./rankLens"

const KEY = "evergo.rankLens.v1"

export function loadRankLens(): RankLens {
  if (typeof window === "undefined") return DEFAULT_RANK_LENS
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return DEFAULT_RANK_LENS
    return normalizeRankLens(JSON.parse(raw))
  } catch {
    return DEFAULT_RANK_LENS
  }
}

export function saveRankLens(lens: RankLens): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KEY, JSON.stringify(lens))
}
