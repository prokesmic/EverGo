"use client"

import { useState, useEffect } from "react"
import { Globe, MapPin, Building2, Users, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type LeaderboardScope = "GLOBAL" | "COUNTRY" | "CITY" | "TEAM"

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

interface ScopeSelectorProps {
  scope: LeaderboardScope
  teamId?: string
  onScopeChange: (scope: LeaderboardScope, teamId?: string) => void
  teams?: Team[]
  locationInfo?: LocationInfo
  variant?: "pills" | "compact"
  className?: string
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

export function ScopeSelector({
  scope,
  teamId,
  onScopeChange,
  teams = [],
  locationInfo,
  variant = "pills",
  className,
}: ScopeSelectorProps) {
  const scopes: LeaderboardScope[] = ["GLOBAL", "COUNTRY", "CITY", "TEAM"]
  const hasMultipleTeams = teams.length > 1
  const selectedTeam = teams.find((t) => t.id === teamId)

  // Filter available scopes based on user data
  const availableScopes = scopes.filter((s) => {
    if (s === "COUNTRY" && !locationInfo?.hasCountry) return false
    if (s === "CITY" && !locationInfo?.hasCity) return false
    if (s === "TEAM" && teams.length === 0) return false
    return true
  })

  const handleScopeClick = (newScope: LeaderboardScope) => {
    if (newScope === "TEAM") {
      // If user has only one team, select it automatically
      if (teams.length === 1) {
        onScopeChange("TEAM", teams[0].id)
      } else if (teams.length > 1 && !teamId) {
        // If multiple teams and none selected, select first
        onScopeChange("TEAM", teams[0].id)
      } else {
        onScopeChange("TEAM", teamId)
      }
    } else {
      onScopeChange(newScope)
    }
  }

  const getScopeLabel = (s: LeaderboardScope): string => {
    if (s === "COUNTRY" && locationInfo?.country) {
      return locationInfo.country
    }
    if (s === "CITY" && locationInfo?.city) {
      return locationInfo.city
    }
    if (s === "TEAM" && selectedTeam) {
      return selectedTeam.name
    }
    return scopeLabels[s]
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-muted/50 hover:bg-muted transition-colors",
              className
            )}
          >
            {(() => {
              const Icon = scopeIcons[scope]
              return <Icon className="h-4 w-4 text-muted-foreground" />
            })()}
            <span>{getScopeLabel(scope)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {availableScopes.map((s) => {
            const Icon = scopeIcons[s]
            return (
              <DropdownMenuItem
                key={s}
                onClick={() => handleScopeClick(s)}
                className={cn(scope === s && "bg-muted")}
              >
                <Icon className="h-4 w-4 mr-2" />
                {getScopeLabel(s)}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Pills variant
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
        {availableScopes.map((s) => {
          const Icon = scopeIcons[s]
          const isActive = scope === s
          const showTeamDropdown = s === "TEAM" && hasMultipleTeams && isActive

          if (showTeamDropdown) {
            return (
              <DropdownMenu key={s}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="max-w-[80px] truncate">{selectedTeam?.name || scopeLabels[s]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {teams.map((team) => (
                    <DropdownMenuItem
                      key={team.id}
                      onClick={() => onScopeChange("TEAM", team.id)}
                      className={cn(teamId === team.id && "bg-muted")}
                    >
                      {team.logoUrl && (
                        <img
                          src={team.logoUrl}
                          alt=""
                          className="h-4 w-4 rounded mr-2 object-cover"
                        />
                      )}
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
              onClick={() => handleScopeClick(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{scopeLabels[s]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
