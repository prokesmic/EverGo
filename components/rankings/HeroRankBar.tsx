"use client"

import React from "react"
import Link from "next/link"
import { useRankLens } from "@/components/rankings/RankLensProvider"
import { lensToQuery, formatLensLabel } from "@/lib/rankings/rankLens"
import type { RankMetric, RankScope } from "@/lib/rankings/rankLens"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Globe,
  MapPin,
  Building2,
  Users,
  SlidersHorizontal,
  Trophy,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react"

// =============================================================================
// TYPES
// =============================================================================

type HeroRanksResponse = {
  lens: {
    metric: RankMetric
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
  ranks: Array<{
    scope: RankScope
    label: string
    rank: number | null
    total: number | null
    needsSetup?: "COUNTRY" | "CITY" | "TEAM"
    scopeValue?: string | null
  }>
}

// =============================================================================
// RANK PILL COMPONENT
// =============================================================================

function RankPill({
  icon,
  label,
  rank,
  total,
  needsSetup,
  onClick,
  testId,
}: {
  icon: React.ReactNode
  label: string
  rank: number | null
  total: number | null
  needsSetup?: string
  onClick?: () => void
  testId: string
}) {
  const text = needsSetup
    ? needsSetup === "TEAM"
      ? "Join"
      : "Set"
    : rank != null
      ? `#${rank}${total ? ` / ${total}` : ""}`
      : "-"

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5",
        "text-xs text-white/90 backdrop-blur-md hover:bg-white/10 transition"
      )}
    >
      <span className="text-white/70 group-hover:text-white/90">{icon}</span>
      <span className="font-medium hidden sm:inline">{label}</span>
      <span
        className={cn(
          "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
          needsSetup
            ? "bg-orange-500/20 text-orange-200"
            : "bg-white/10 text-white/90"
        )}
      >
        {text}
      </span>
    </button>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HeroRankBar({ className }: { className?: string }) {
  const { lens, setLens } = useRankLens()
  const [data, setData] = React.useState<HeroRanksResponse | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [sportOptions, setSportOptions] = React.useState<
    Array<{ id: string; name: string }>
  >([])
  const [disciplineOptions, setDisciplineOptions] = React.useState<
    Array<{ id: string; name: string }>
  >([])

  const query = React.useMemo(() => lensToQuery(lens), [lens])

  // Fetch hero ranks
  React.useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/me/rankings/hero?${query}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (alive) setData(j)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [query])

  // Fetch sports
  React.useEffect(() => {
    fetch(`/api/sports`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : { sports: [] }))
      .then((j) => setSportOptions(j.sports ?? []))
      .catch(() => setSportOptions([]))
  }, [])

  // Fetch disciplines when sport changes
  React.useEffect(() => {
    if (!lens.sportId) {
      setDisciplineOptions([])
      return
    }
    fetch(`/api/sports/${lens.sportId}/disciplines`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : { disciplines: [] }))
      .then((j) => setDisciplineOptions(j.disciplines ?? []))
      .catch(() => setDisciplineOptions([]))
  }, [lens.sportId])

  const ranks = data?.ranks ?? []
  const global = ranks.find((r) => r.scope === "GLOBAL")
  const country = ranks.find((r) => r.scope === "COUNTRY")
  const city = ranks.find((r) => r.scope === "CITY")
  const team = ranks.find((r) => r.scope === "TEAM")

  const lensLabel = data
    ? formatLensLabel(
        data.labels.sportName,
        data.labels.disciplineName,
        lens.metric
      )
    : "Rankings"

  // Lens selector content
  const LensSelector = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={lens.metric === "SPORT_INDEX" ? "default" : "secondary"}
          size="sm"
          className="justify-start"
          onClick={() => setLens({ ...lens, metric: "SPORT_INDEX" })}
          data-testid="lens-metric-sportIndex"
        >
          <Trophy className="mr-2 h-4 w-4" /> Sport Index
        </Button>

        <Button
          type="button"
          variant={lens.metric === "FITNESS_SCORE" ? "default" : "secondary"}
          size="sm"
          className="justify-start"
          onClick={() => setLens({ ...lens, metric: "FITNESS_SCORE" })}
          data-testid="lens-metric-fitness"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" /> Fitness
        </Button>
      </div>

      <div className="space-y-2">
        <Select
          value={lens.sportId ?? "overall"}
          onValueChange={(v) =>
            setLens({
              ...lens,
              sportId: v === "overall" ? null : v,
              disciplineId: null,
            })
          }
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
          value={lens.disciplineId ?? "all"}
          onValueChange={(v) =>
            setLens({ ...lens, disciplineId: v === "all" ? null : v })
          }
          disabled={!lens.sportId}
        >
          <SelectTrigger data-testid="lens-discipline" className="w-full">
            <SelectValue
              placeholder={lens.sportId ? "Discipline" : "Pick a sport first"}
            />
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

      <div className="text-xs text-muted-foreground">
        Choose what your ranks are based on
      </div>
    </div>
  )

  return (
    <div
      data-testid="hero-rankbar"
      className={cn(
        "w-full",
        "rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl",
        "shadow-lg shadow-black/20",
        "px-4 py-3",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* KPIs */}
        <div className="flex items-center gap-4">
          <div className="min-w-[100px]">
            <div className="text-[10px] uppercase tracking-wide text-white/50">
              Fitness
            </div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {loading ? "..." : (data?.kpis.fitnessScore ?? 0)}
              <span className="ml-1 text-xs text-white/50">/100</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="min-w-[120px]">
            <div className="text-[10px] uppercase tracking-wide text-white/50">
              Sport Index
            </div>
            <div className="text-lg font-semibold text-white tabular-nums">
              {loading ? "..." : (data?.kpis.sportIndex ?? 0)}
              <span className="ml-1 text-xs text-white/50">/1000</span>
            </div>
          </div>
        </div>

        {/* Lens Selector */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                data-testid="lens-trigger"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5",
                  "text-sm text-white/90 hover:bg-white/10 transition"
                )}
              >
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-orange-200 text-[10px]"
                >
                  Lens
                </Badge>
                <span className="max-w-[200px] truncate text-xs">
                  {lensLabel}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-white/60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-[280px]">
              {LensSelector}
            </PopoverContent>
          </Popover>

          <Link
            data-testid="hero-full-rankings"
            href={`/leaderboard?${query}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            Full rankings <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Scope Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <RankPill
            testId="rank-pill-global"
            icon={<Globe className="h-3.5 w-3.5" />}
            label="Global"
            rank={global?.rank ?? null}
            total={global?.total ?? null}
          />

          <RankPill
            testId="rank-pill-country"
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Country"
            rank={country?.rank ?? null}
            total={country?.total ?? null}
            needsSetup={country?.needsSetup}
            onClick={() => {
              if (country?.needsSetup) {
                window.location.href = "/settings/profile"
              }
            }}
          />

          <RankPill
            testId="rank-pill-city"
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="City"
            rank={city?.rank ?? null}
            total={city?.total ?? null}
            needsSetup={city?.needsSetup}
            onClick={() => {
              if (city?.needsSetup) {
                window.location.href = "/settings/profile"
              }
            }}
          />

          <RankPill
            testId="rank-pill-team"
            icon={<Users className="h-3.5 w-3.5" />}
            label="Team"
            rank={team?.rank ?? null}
            total={team?.total ?? null}
            needsSetup={team?.needsSetup}
            onClick={() => {
              if (team?.needsSetup) {
                window.location.href = "/teams"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
