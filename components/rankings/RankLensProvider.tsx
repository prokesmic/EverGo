"use client"

import React from "react"
import {
  RankLens,
  DEFAULT_RANK_LENS,
  normalizeRankLens,
} from "@/lib/rankings/rankLens"
import { loadRankLens, saveRankLens } from "@/lib/rankings/rankLensStorage"

type Ctx = {
  lens: RankLens
  setLens: (next: RankLens) => void
}

const RankLensContext = React.createContext<Ctx | null>(null)

export function RankLensProvider({ children }: { children: React.ReactNode }) {
  const [lens, setLensState] = React.useState<RankLens>(DEFAULT_RANK_LENS)

  React.useEffect(() => {
    setLensState(loadRankLens())
  }, [])

  const setLens = React.useCallback((next: RankLens) => {
    const normalized = normalizeRankLens(next)
    setLensState(normalized)
    saveRankLens(normalized)
  }, [])

  return (
    <RankLensContext.Provider value={{ lens, setLens }}>
      {children}
    </RankLensContext.Provider>
  )
}

export function useRankLens(): Ctx {
  const ctx = React.useContext(RankLensContext)
  if (!ctx)
    throw new Error("useRankLens must be used within RankLensProvider")
  return ctx
}
