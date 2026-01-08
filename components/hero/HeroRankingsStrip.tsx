"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import Link from "next/link"
import {
  Globe,
  MapPin,
  Building2,
  Users,
  ChevronDown,
  ArrowUpRight,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  HeroRankLensSnapshot,
  RankTileScope,
  RankTile,
  BenchmarkOption,
} from "@/lib/rankings/hero-rank-lens"

// ============================================================================
// SCOPE CONFIG
// ============================================================================

const SCOPE_CONFIG: Record<RankTileScope, { icon: typeof Globe; label: string; color: string }> = {
  global: { icon: Globe, label: "Global", color: "text-emerald-400" },
  country: { icon: MapPin, label: "Country", color: "text-sky-400" },
  city: { icon: Building2, label: "City", color: "text-amber-400" },
  team: { icon: Users, label: "Team", color: "text-violet-400" },
}

const SCOPE_ORDER: RankTileScope[] = ["global", "country", "city", "team"]

// ============================================================================
// LOCAL STORAGE KEY
// ============================================================================

const STORAGE_KEY_PREFIX = "evergo-rank-lens-benchmark-"

function getStoredBenchmarkId(sportId: string): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${sportId}`)
}

function storeBenchmarkId(sportId: string, benchmarkId: string | null): void {
  if (typeof window === "undefined") return
  const key = `${STORAGE_KEY_PREFIX}${sportId}`
  if (benchmarkId === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, benchmarkId)
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface HeroRankingsStripProps {
  snapshot: HeroRankLensSnapshot
  className?: string
}

// ============================================================================
// COMPACT RANK SEGMENT
// ============================================================================

function RankSeg({ tile }: { tile: RankTile }) {
  const config = SCOPE_CONFIG[tile.scope]
  const Icon = config.icon
  const hasRank = tile.rank !== null

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      data-testid={`rank-seg-${tile.scope}`}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-white/10",
          "h-8 w-8 shrink-0"
        )}
      >
        <Icon
          className={cn(
            hasRank ? config.color : "text-slate-500",
            "h-4 w-4"
          )}
        />
      </div>

      {/* Rank info */}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
          {config.label}
        </div>
        {hasRank ? (
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold tabular-nums text-white">
              #{tile.rank}
            </span>
            <span className="text-[10px] text-white/40">
              / {tile.total.toLocaleString()}
            </span>
          </div>
        ) : (
          <Link
            href="/settings/profile"
            className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors"
          >
            {tile.missingField === "country" && "Set location"}
            {tile.missingField === "city" && "Add city"}
            {tile.missingField === "team" && "Join team"}
            {!tile.missingField && "Add data"}
          </Link>
        )}
        {/* Scope value (country name, city, team) - with truncation */}
        {hasRank && tile.scopeValue && (
          <div className="text-[10px] text-white/40 truncate max-w-[140px]">
            {tile.scopeValue}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// BENCHMARK DROPDOWN (COMPACT)
// ============================================================================

function BenchmarkDropdownCompact({
  benchmarks,
  currentBenchmark,
  onSelect,
  isPending,
}: {
  benchmarks: BenchmarkOption[]
  currentBenchmark: BenchmarkOption | null
  onSelect: (benchmarkId: string | null) => void
  isPending: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside() {
      if (isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  const displayName = currentBenchmark?.name ?? "Sport Index"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1 rounded-full",
          "bg-white/10 px-2 py-1",
          "text-xs font-medium text-white",
          "hover:bg-white/15 transition-colors",
          "ring-1 ring-white/10",
          isPending && "opacity-60"
        )}
        data-testid="benchmark-dropdown-trigger"
      >
        <Trophy className="h-3 w-3 text-orange-400" />
        <span className="truncate max-w-[80px]">{displayName}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-white/60 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 mt-1.5 z-50",
            "min-w-[160px] max-w-[200px]",
            "rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl",
            "shadow-xl shadow-black/30",
            "py-1 overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
          data-testid="benchmark-dropdown-menu"
        >
          {/* Sport Index option */}
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setIsOpen(false)
            }}
            className={cn(
              "w-full px-3 py-1.5 text-left text-xs",
              "hover:bg-white/10 transition-colors",
              currentBenchmark === null
                ? "text-orange-400 font-medium"
                : "text-white/80"
            )}
          >
            Sport Index
          </button>

          {/* Separator */}
          {benchmarks.length > 0 && (
            <div className="my-1 border-t border-white/10" />
          )}

          {/* Benchmark options */}
          {benchmarks.map((benchmark) => (
            <button
              key={benchmark.id}
              type="button"
              onClick={() => {
                onSelect(benchmark.id)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-1.5 text-left text-xs",
                "hover:bg-white/10 transition-colors",
                currentBenchmark?.id === benchmark.id
                  ? "text-orange-400 font-medium"
                  : "text-white/80"
              )}
            >
              <div className="truncate">{benchmark.name}</div>
            </button>
          ))}

          {benchmarks.length === 0 && (
            <div className="px-3 py-1.5 text-[10px] text-white/40">
              No benchmarks available
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT - COMPACT STRIP
// ============================================================================

export function HeroRankingsStrip({ snapshot, className }: HeroRankingsStripProps) {
  const [data, setData] = useState(snapshot)
  const [isPending, startTransition] = useTransition()

  const handleBenchmarkChange = useCallback(async (benchmarkId: string | null) => {
    storeBenchmarkId(snapshot.sport.id, benchmarkId)

    startTransition(async () => {
      try {
        const response = await fetch("/api/home/hero-ranks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sportId: snapshot.sport.id,
            benchmarkId,
          }),
        })

        if (response.ok) {
          const newSnapshot = await response.json()
          setData(newSnapshot)
        }
      } catch (error) {
        console.error("Failed to fetch rank lens data:", error)
      }
    })
  }, [snapshot.sport.id])

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedBenchmarkId = getStoredBenchmarkId(snapshot.sport.id)
    if (
      storedBenchmarkId !== null &&
      storedBenchmarkId !== (snapshot.currentBenchmark?.id ?? null)
    ) {
      const benchmark = snapshot.benchmarks.find((b) => b.id === storedBenchmarkId)
      if (benchmark) {
        handleBenchmarkChange(storedBenchmarkId)
      }
    }
  }, [snapshot.sport.id, snapshot.currentBenchmark?.id, snapshot.benchmarks, handleBenchmarkChange])

  // Format sport + discipline label
  const sportLabel = data.currentBenchmark
    ? `${data.sport.name} • ${data.currentBenchmark.name}`
    : data.sport.name

  return (
    <div
      className={cn(
        // Compact glass container
        "relative w-full",
        "rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl",
        "shadow-lg shadow-black/10",
        "overflow-hidden",
        className
      )}
      data-testid="hero-rankings-strip"
    >
      {/* Single row: Sport Label + Ranks + Link */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 py-3">
        {/* Left: Sport + Discipline + Benchmark Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Rankings
            </h2>
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full",
                "bg-emerald-500/20 px-2 py-0.5",
                "text-[11px] font-medium text-emerald-300",
                "ring-1 ring-emerald-500/30"
              )}
            >
              {sportLabel}
            </div>
          </div>

          <BenchmarkDropdownCompact
            benchmarks={data.benchmarks}
            currentBenchmark={data.currentBenchmark}
            onSelect={handleBenchmarkChange}
            isPending={isPending}
          />
        </div>

        {/* Right: Full rankings link */}
        <Link
          href={`/leaderboard?sport=${data.sport.slug}`}
          className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-white/50 hover:text-white transition-colors"
        >
          Full rankings <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Rank segments - horizontal scroll on mobile, grid on desktop */}
      <div className="border-t border-white/5">
        {/* Desktop: 4-column grid */}
        <div className="hidden md:grid md:grid-cols-4 divide-x divide-white/5">
          {SCOPE_ORDER.map((scope) => (
            <RankSeg key={scope} tile={data.tiles[scope]} />
          ))}
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="grid grid-cols-2 md:hidden divide-x divide-y divide-white/5">
          {SCOPE_ORDER.map((scope) => (
            <RankSeg key={scope} tile={data.tiles[scope]} />
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
