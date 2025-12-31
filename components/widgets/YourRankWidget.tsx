"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trophy, TrendingUp, TrendingDown, Minus, Globe, MapPin, Building2, Users, ArrowUpRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type LeaderboardScope = "GLOBAL" | "COUNTRY" | "CITY" | "TEAM"

interface Team {
  id: string
  name: string
  logoUrl: string | null
}

interface LocationInfo {
  hasCountry: boolean
  hasCity: boolean
  country: string | null
  city: string | null
}

interface LeaderboardResult {
  meta: {
    key: string
    label: string
    unit: string
    order: "ASC" | "DESC"
  }
  top: Array<{
    userId: string
    displayName: string
    avatarUrl: string | null
    value: number
    formattedValue: string
    rank: number
  }>
  me: {
    userId: string
    displayName: string
    avatarUrl: string | null
    value: number
    formattedValue: string
    rank: number
  } | null
  delta: number | null
  total: number
  scopeLabel: string
}

const scopeIcons: Record<LeaderboardScope, React.ComponentType<{ className?: string }>> = {
  GLOBAL: Globe,
  COUNTRY: MapPin,
  CITY: Building2,
  TEAM: Users,
}

const scopeLabels: Record<LeaderboardScope, string> = {
  GLOBAL: "Global",
  COUNTRY: "Country",
  CITY: "City",
  TEAM: "Team",
}

function getDeltaDisplay(delta: number | null) {
  if (delta === null) return null

  if (delta > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        +{delta}
      </span>
    )
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-red-400">
        <TrendingDown className="w-3 h-3" />
        {delta}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-slate-400">
      <Minus className="w-3 h-3" />
    </span>
  )
}

export function YourRankWidget() {
  const [scope, setScope] = useState<LeaderboardScope>("GLOBAL")
  const [teamId, setTeamId] = useState<string | undefined>()
  const [teams, setTeams] = useState<Team[]>([])
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)
  const [data, setData] = useState<LeaderboardResult | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user context (teams, location)
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch("/api/leaderboards", { method: "POST" })
        if (res.ok) {
          const context = await res.json()
          setTeams(context.teams || [])
          setLocationInfo(context.locationInfo || null)
        }
      } catch (error) {
        console.error("Failed to fetch context:", error)
      }
    }
    fetchContext()
  }, [])

  // Fetch leaderboard data when scope changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          metricKey: "activity:score",
          scope,
          limit: "5",
        })
        if (scope === "TEAM" && teamId) {
          params.set("teamId", teamId)
        }

        const res = await fetch(`/api/leaderboards?${params}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    // If TEAM scope but no team selected, skip
    if (scope === "TEAM" && !teamId && teams.length > 0) {
      setTeamId(teams[0].id)
      return
    }

    fetchLeaderboard()
  }, [scope, teamId, teams])

  const handleScopeChange = (newScope: LeaderboardScope, newTeamId?: string) => {
    setScope(newScope)
    if (newScope === "TEAM") {
      setTeamId(newTeamId || (teams.length > 0 ? teams[0].id : undefined))
    } else {
      setTeamId(undefined)
    }
  }

  // Get available scopes based on user data
  const availableScopes: LeaderboardScope[] = ["GLOBAL"]
  if (locationInfo?.hasCountry) availableScopes.push("COUNTRY")
  if (locationInfo?.hasCity) availableScopes.push("CITY")
  if (teams.length > 0) availableScopes.push("TEAM")

  const selectedTeam = teams.find((t) => t.id === teamId)
  const ScopeIcon = scopeIcons[scope]

  const getScopeDisplayLabel = (): string => {
    if (scope === "COUNTRY" && locationInfo?.country) return locationInfo.country
    if (scope === "CITY" && locationInfo?.city) return locationInfo.city
    if (scope === "TEAM" && selectedTeam) return selectedTeam.name
    return scopeLabels[scope]
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-lg"
      data-testid="your-rank-widget"
    >
      {/* Subtle accent glows */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/15 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />

      <div className="relative p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white text-sm">Your Rank</span>
          </div>
          <Link
            href="/rankings"
            className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-0.5 transition-colors"
            data-testid="cta-view-rankings"
          >
            Full Rankings <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Scope Selector */}
        <div className="flex gap-1 mb-3">
          {availableScopes.map((s) => {
            const Icon = scopeIcons[s]
            const isActive = scope === s
            const showTeamDropdown = s === "TEAM" && teams.length > 1 && isActive

            if (showTeamDropdown) {
              return (
                <DropdownMenu key={s}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="max-w-[60px] truncate">{selectedTeam?.name || "Team"}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[140px]">
                    {teams.map((team) => (
                      <DropdownMenuItem
                        key={team.id}
                        onClick={() => handleScopeChange("TEAM", team.id)}
                        className={cn(teamId === team.id && "bg-muted")}
                      >
                        {team.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            return (
              <button
                key={s}
                onClick={() => handleScopeChange(s)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{scopeLabels[s]}</span>
              </button>
            )
          })}
        </div>

        {/* Rank Display */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
          </div>
        ) : data?.me ? (
          <div className="rounded-lg bg-white/5 border border-white/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">
                  {getScopeDisplayLabel()}
                </p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  #{data.me.rank.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">
                  of {data.total.toLocaleString()} athletes
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white tabular-nums mb-0.5">
                  {data.me.formattedValue}
                </p>
                <p className="text-[10px] text-slate-400 mb-1">{data.meta.label}</p>
                {getDeltaDisplay(data.delta)}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white/5 border border-white/5 p-4 text-center">
            <p className="text-sm text-slate-400 mb-2">No ranking data yet</p>
            <Link
              href="/activity/create"
              className="text-xs text-orange-400 hover:text-orange-300 font-medium"
            >
              Log an activity to get ranked
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
