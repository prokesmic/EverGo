"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  MapPin,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Target,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// =============================================================================
// TYPES
// =============================================================================

type RankScope = "GLOBAL" | "COUNTRY" | "CITY" | "TEAM"

type RankData = {
  scope: RankScope
  label: string
  rank: number | null
  total: number | null
  delta: number | null // Trend: positive = moved up, negative = moved down
  needsSetup?: "COUNTRY" | "CITY" | "TEAM"
  scopeValue?: string | null
}

type RankStripData = {
  lens: {
    metric: string
    sportId: string | null
    disciplineId: string | null
  }
  labels: {
    sportName: string
    disciplineName: string | null
  }
  kpis: {
    sportIndex: number
    fitnessScore: number
  }
  ranks: RankData[]
}

type SportOption = { id: string; name: string }
type DisciplineOption = { id: string; name: string }

// =============================================================================
// TIER STYLING
// =============================================================================

function getTierClass(rank: number | null): string {
  if (rank === null) return ""
  if (rank <= 10) return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10"
  if (rank <= 100) return "bg-gradient-to-r from-slate-400/10 to-slate-300/10"
  if (rank <= 1000) return "bg-gradient-to-r from-orange-900/10 to-orange-700/10"
  return ""
}

// =============================================================================
// RANK PILL COMPONENT
// =============================================================================

interface RankPillProps {
  scope: RankScope
  icon: React.ReactNode
  label: string
  rank: number | null
  total: number | null
  delta: number | null
  needsSetup?: string
  scopeValue?: string | null
  onSetupClick?: () => void
  testId: string
  compact?: boolean
}

function RankPill({
  scope,
  icon,
  label,
  rank,
  total,
  delta,
  needsSetup,
  scopeValue,
  onSetupClick,
  testId,
  compact = false,
}: RankPillProps) {
  const getCTAText = () => {
    if (needsSetup === "CITY") return "Find Local Rivals"
    if (needsSetup === "COUNTRY") return "Set Location"
    if (needsSetup === "TEAM") return "Join Team"
    return null
  }

  const ctaText = getCTAText()

  // Trend indicator
  const TrendIndicator = () => {
    if (delta === null || Math.abs(delta) < 1) {
      return <Minus className="h-3 w-3 text-white/40" />
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-emerald-400">
          <TrendingUp className="h-3 w-3" />
          <span className="text-[10px] font-medium">{delta}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400">
        <TrendingDown className="h-3 w-3" />
        <span className="text-[10px] font-medium">{Math.abs(delta)}</span>
      </span>
    )
  }

  if (ctaText) {
    return (
      <button
        type="button"
        data-testid={testId}
        onClick={onSetupClick}
        className={cn(
          "group relative flex flex-col items-start gap-1 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2",
          "text-left transition hover:bg-orange-500/20 hover:border-orange-500/50",
          compact && "px-2 py-1.5"
        )}
      >
        <div className="flex items-center gap-1.5 text-orange-300">
          {icon}
          <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
        </div>
        <span className="text-xs font-medium text-orange-200">{ctaText}</span>
      </button>
    )
  }

  return (
    <div
      data-testid={testId}
      className={cn(
        "group relative flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2",
        "backdrop-blur-md transition hover:bg-white/10",
        getTierClass(rank),
        compact && "px-2 py-1.5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-white/60">
          {icon}
          <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
        </div>
        <TrendIndicator />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white tabular-nums">
          {rank !== null ? `#${rank}` : "-"}
        </span>
        {total !== null && (
          <span className="text-[10px] text-white/50">of {total}</span>
        )}
      </div>
      {scopeValue && (
        <span className="text-[10px] text-white/40 truncate max-w-[100px]">
          {scopeValue}
        </span>
      )}
    </div>
  )
}

// =============================================================================
// MOBILE PILL (COMPACT)
// =============================================================================

function MobilePrimaryPill({
  rank,
  delta,
  onClick,
}: {
  rank: number | null
  delta: number | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5",
        "backdrop-blur-md transition hover:bg-white/10"
      )}
    >
      <Globe className="h-3.5 w-3.5 text-white/60" />
      <span className="text-sm font-bold text-white tabular-nums">
        {rank !== null ? `#${rank}` : "-"}
      </span>
      {delta !== null && Math.abs(delta) >= 1 && (
        <span
          className={cn(
            "text-xs font-medium",
            delta > 0 ? "text-emerald-400" : "text-red-400"
          )}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
      <ChevronDown className="h-3.5 w-3.5 text-white/40" />
    </button>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface RankStripProps {
  className?: string
  onLocationSetup?: () => void
}

export function RankStrip({ className, onLocationSetup }: RankStripProps) {
  const [data, setData] = useState<RankStripData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [sportOptions, setSportOptions] = useState<SportOption[]>([])
  const [disciplineOptions, setDisciplineOptions] = useState<DisciplineOption[]>([])

  // Lens state
  const [metric, setMetric] = useState<"SPORT_INDEX" | "FITNESS_SCORE">("SPORT_INDEX")
  const [sportId, setSportId] = useState<string | null>(null)
  const [disciplineId, setDisciplineId] = useState<string | null>(null)

  // Build query string
  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set("metric", metric)
    if (sportId) params.set("sportId", sportId)
    if (disciplineId) params.set("disciplineId", disciplineId)
    return params.toString()
  }, [metric, sportId, disciplineId])

  // Fetch rank data
  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/me/rankings/hero?${query}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (alive) setData(json)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [query])

  // Fetch sports list
  useEffect(() => {
    fetch(`/api/sports`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : { sports: [] }))
      .then((j) => setSportOptions(j.sports ?? []))
      .catch(() => setSportOptions([]))
  }, [])

  // Fetch disciplines when sport changes
  useEffect(() => {
    if (!sportId) {
      setDisciplineOptions([])
      return
    }
    fetch(`/api/sports/${sportId}/disciplines`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : { disciplines: [] }))
      .then((j) => setDisciplineOptions(j.disciplines ?? []))
      .catch(() => setDisciplineOptions([]))
  }, [sportId])

  const ranks = data?.ranks ?? []
  const global = ranks.find((r) => r.scope === "GLOBAL")
  const country = ranks.find((r) => r.scope === "COUNTRY")
  const city = ranks.find((r) => r.scope === "CITY")
  const team = ranks.find((r) => r.scope === "TEAM")

  const lensLabel = data
    ? `${data.labels.sportName}${data.labels.disciplineName ? ` · ${data.labels.disciplineName}` : ""}`
    : "Rankings"

  const handleSetupClick = useCallback(
    (type: string) => {
      if (type === "TEAM") {
        window.location.href = "/teams"
      } else if (onLocationSetup) {
        onLocationSetup()
      } else {
        window.location.href = "/settings/profile"
      }
    },
    [onLocationSetup]
  )

  // Lens Selector Content
  const LensSelector = (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMetric("SPORT_INDEX")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
            metric === "SPORT_INDEX"
              ? "bg-orange-500 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          data-testid="lens-metric-sportIndex"
        >
          <Trophy className="h-4 w-4" /> Sport Index
        </button>
        <button
          type="button"
          onClick={() => setMetric("FITNESS_SCORE")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
            metric === "FITNESS_SCORE"
              ? "bg-orange-500 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          data-testid="lens-metric-fitness"
        >
          <Target className="h-4 w-4" /> Fitness
        </button>
      </div>

      <div className="space-y-2">
        <Select
          value={sportId ?? "overall"}
          onValueChange={(v) => {
            setSportId(v === "overall" ? null : v)
            setDisciplineId(null)
          }}
        >
          <SelectTrigger data-testid="lens-sport" className="w-full">
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall</SelectItem>
            {sportOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={disciplineId ?? "all"}
          onValueChange={(v) => setDisciplineId(v === "all" ? null : v)}
          disabled={!sportId}
        >
          <SelectTrigger data-testid="lens-discipline" className="w-full">
            <SelectValue placeholder={sportId ? "Discipline" : "Pick a sport first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All disciplines</SelectItem>
            {disciplineOptions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-slate-500">
        Choose what your ranks are based on
      </p>
    </div>
  )

  return (
    <div
      data-testid="rank-strip"
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl",
        "shadow-lg shadow-black/20",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.12em] font-semibold text-white/50">
            Rankings
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-testid="lens-trigger"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1",
                  "text-xs text-white/90 hover:bg-white/10 transition"
                )}
              >
                <span className="max-w-[160px] truncate">{lensLabel}</span>
                <ChevronDown className="h-3 w-3 text-white/60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[260px]">
              {LensSelector}
            </PopoverContent>
          </Popover>
        </div>

        <Link
          data-testid="rank-strip-full-rankings"
          href={`/leaderboard?${query}`}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-white/50 hover:text-white transition-colors"
        >
          Full rankings <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {/* Desktop: All 4 pills inline */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <RankPill
            testId="rank-pill-global"
            scope="GLOBAL"
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Global"
            rank={global?.rank ?? null}
            total={global?.total ?? null}
            delta={global?.delta ?? null}
          />
          <RankPill
            testId="rank-pill-country"
            scope="COUNTRY"
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Country"
            rank={country?.rank ?? null}
            total={country?.total ?? null}
            delta={country?.delta ?? null}
            needsSetup={country?.needsSetup}
            scopeValue={country?.scopeValue ?? undefined}
            onSetupClick={() => handleSetupClick("COUNTRY")}
          />
          <RankPill
            testId="rank-pill-city"
            scope="CITY"
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="City"
            rank={city?.rank ?? null}
            total={city?.total ?? null}
            delta={city?.delta ?? null}
            needsSetup={city?.needsSetup}
            scopeValue={city?.scopeValue ?? undefined}
            onSetupClick={() => handleSetupClick("CITY")}
          />
          <RankPill
            testId="rank-pill-team"
            scope="TEAM"
            icon={<Users className="h-3.5 w-3.5" />}
            label="Team"
            rank={team?.rank ?? null}
            total={team?.total ?? null}
            delta={team?.delta ?? null}
            needsSetup={team?.needsSetup}
            scopeValue={team?.scopeValue ?? undefined}
            onSetupClick={() => handleSetupClick("TEAM")}
          />
        </div>

        {/* Mobile: Primary pill + expand */}
        <div className="md:hidden">
          <div className="flex items-center justify-between">
            <MobilePrimaryPill
              rank={global?.rank ?? null}
              delta={global?.delta ?? null}
              onClick={() => setExpanded(!expanded)}
            />
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white/70 transition"
            >
              {expanded ? "Less" : "More"}
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Expanded grid */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <RankPill
                    testId="rank-pill-global-mobile"
                    scope="GLOBAL"
                    icon={<Globe className="h-3.5 w-3.5" />}
                    label="Global"
                    rank={global?.rank ?? null}
                    total={global?.total ?? null}
                    delta={global?.delta ?? null}
                    compact
                  />
                  <RankPill
                    testId="rank-pill-country-mobile"
                    scope="COUNTRY"
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Country"
                    rank={country?.rank ?? null}
                    total={country?.total ?? null}
                    delta={country?.delta ?? null}
                    needsSetup={country?.needsSetup}
                    scopeValue={country?.scopeValue ?? undefined}
                    onSetupClick={() => handleSetupClick("COUNTRY")}
                    compact
                  />
                  <RankPill
                    testId="rank-pill-city-mobile"
                    scope="CITY"
                    icon={<Building2 className="h-3.5 w-3.5" />}
                    label="City"
                    rank={city?.rank ?? null}
                    total={city?.total ?? null}
                    delta={city?.delta ?? null}
                    needsSetup={city?.needsSetup}
                    scopeValue={city?.scopeValue ?? undefined}
                    onSetupClick={() => handleSetupClick("CITY")}
                    compact
                  />
                  <RankPill
                    testId="rank-pill-team-mobile"
                    scope="TEAM"
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Team"
                    rank={team?.rank ?? null}
                    total={team?.total ?? null}
                    delta={team?.delta ?? null}
                    needsSetup={team?.needsSetup}
                    scopeValue={team?.scopeValue ?? undefined}
                    onSetupClick={() => handleSetupClick("TEAM")}
                    compact
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default RankStrip
