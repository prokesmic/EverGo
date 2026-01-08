"use client"

/**
 * ModeToggle Component
 *
 * Two-mode leaderboard toggle: Clubhouse vs Pro-Am
 * - Clubhouse: Inclusive, includes manual entries
 * - Pro-Am: Strict, verified entries only
 */

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Home, Trophy } from "lucide-react"

export type LeaderboardMode = "COMMUNITY" | "VERIFIED"

interface ModeToggleProps {
  mode: LeaderboardMode
  onChange: (mode: LeaderboardMode) => void
  className?: string
  disabled?: boolean
}

const STORAGE_KEY = "evergo.rankMode"

export function ModeToggle({
  mode,
  onChange,
  className,
  disabled = false,
}: ModeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg bg-muted p-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      data-testid="rank-mode-toggle"
    >
      <button
        type="button"
        onClick={() => !disabled && onChange("COMMUNITY")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          mode === "COMMUNITY"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={mode === "COMMUNITY"}
      >
        <Home className="h-4 w-4" />
        <span>Clubhouse</span>
      </button>
      <button
        type="button"
        onClick={() => !disabled && onChange("VERIFIED")}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          mode === "VERIFIED"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={mode === "VERIFIED"}
      >
        <Trophy className="h-4 w-4" />
        <span>Pro-Am</span>
      </button>
    </div>
  )
}

/**
 * Hook to manage leaderboard mode with localStorage persistence
 */
export function useLeaderboardMode(): [
  LeaderboardMode,
  (mode: LeaderboardMode) => void
] {
  const [mode, setMode] = useState<LeaderboardMode>("COMMUNITY")

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY)
      if ((saved === "COMMUNITY" || saved === "VERIFIED") && saved !== mode) {
        setMode(saved)
      }
    }
  }, [mode])

  // Save to localStorage on change
  const handleChange = (newMode: LeaderboardMode) => {
    setMode(newMode)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newMode)
    }
  }

  return [mode, handleChange]
}

/**
 * Mode badge for display in leaderboards
 */
export function ModeBadge({
  mode,
  className,
}: {
  mode: LeaderboardMode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
        mode === "VERIFIED"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        className
      )}
    >
      {mode === "VERIFIED" ? (
        <>
          <Trophy className="h-3 w-3" />
          Pro-Am
        </>
      ) : (
        <>
          <Home className="h-3 w-3" />
          Clubhouse
        </>
      )}
    </span>
  )
}

/**
 * Lock state indicator for Pro-Am mode when user is ineligible
 */
export function ProAmLockState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center bg-muted/50 rounded-lg border border-dashed",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
        <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="font-semibold text-lg mb-1">Verify to Compete</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Connect a device or upload .fit/.gpx/.tcx files to appear in Pro-Am
        rankings.
      </p>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upload Activity File
        </button>
        <button className="px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80">
          Connect Device
        </button>
      </div>
    </div>
  )
}
