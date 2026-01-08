"use client"

/**
 * Target Card Component
 *
 * Displays a user's dynamic target with progress tracking.
 *
 * Updated to match schema: Target model with targetValue, currentValue, targetDate, achievedAt
 * Status enum: ACTIVE, ACHIEVED, ABANDONED, EXPIRED
 */

import { cn } from "@/lib/utils"
import {
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react"
import type { Target as TargetType } from "@/lib/targets"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TargetCardProps {
  target: TargetType
  onCancel?: (targetId: string) => void
  className?: string
}

export function TargetCard({ target, onCancel, className }: TargetCardProps) {
  const isActive = target.status === "ACTIVE"
  const isAchieved = target.status === "ACHIEVED"
  const isExpired = target.status === "EXPIRED"
  const isAbandoned = target.status === "ABANDONED"

  // Calculate progress from currentValue/targetValue
  const progress = target.progressPct ?? (
    target.currentValue != null && target.targetValue > 0
      ? Math.min(100, (target.currentValue / target.targetValue) * 100)
      : 0
  )

  // Calculate days until deadline
  let daysRemaining: number | null = null
  if (target.targetDate && isActive) {
    const now = new Date()
    const deadline = new Date(target.targetDate)
    daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all",
        isActive && "bg-card hover:bg-muted/50",
        isAchieved && "bg-emerald-500/10 border-emerald-500/30",
        isExpired && "bg-red-500/10 border-red-500/30",
        isAbandoned && "opacity-50",
        className
      )}
      data-testid="target-card"
    >
      {/* Status badge */}
      {!isActive && (
        <div
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
            isAchieved && "bg-emerald-500/20 text-emerald-500",
            isExpired && "bg-red-500/20 text-red-500",
            isAbandoned && "bg-muted text-muted-foreground"
          )}
        >
          {isAchieved && <CheckCircle2 className="h-3 w-3" />}
          {isExpired && <XCircle className="h-3 w-3" />}
          {target.status}
        </div>
      )}

      {/* Menu for active targets */}
      {isActive && onCancel && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-2 right-2 p-1 rounded hover:bg-muted">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onCancel(target.id)}
            >
              Abandon target
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Main content */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
            isActive && "bg-primary/10",
            isAchieved && "bg-emerald-500/20",
            isExpired && "bg-red-500/20",
            isAbandoned && "bg-muted"
          )}
        >
          <TargetIcon
            hasBenchmark={!!target.benchmarkId}
            className={cn(
              "h-5 w-5",
              isActive && "text-primary",
              isAchieved && "text-emerald-500",
              isExpired && "text-red-500",
              isAbandoned && "text-muted-foreground"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            {target.benchmarkId ? "Benchmark Target" : "Target"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {target.disciplineId ? `Discipline goal` : `General goal`}
          </p>

          {/* Progress */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                {formatValue(target.currentValue ?? 0)} /{" "}
                {formatValue(target.targetValue)}
              </span>
              <span
                className={cn(
                  "font-medium",
                  progress >= 100
                    ? "text-emerald-500"
                    : progress >= 75
                    ? "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isAchieved
                    ? "bg-emerald-500"
                    : isExpired
                    ? "bg-red-500"
                    : progress >= 75
                    ? "bg-amber-500"
                    : "bg-primary"
                )}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>

          {/* Deadline */}
          {daysRemaining !== null && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs",
                daysRemaining <= 1 ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              {daysRemaining <= 0
                ? "Due today"
                : daysRemaining === 1
                ? "1 day left"
                : `${daysRemaining} days left`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TargetIcon({ hasBenchmark, className }: { hasBenchmark: boolean; className?: string }) {
  if (hasBenchmark) {
    return <Trophy className={className} />
  }
  return <Target className={className} />
}

function formatValue(value: number): string {
  if (value >= 3600) {
    const hours = Math.floor(value / 3600)
    const mins = Math.round((value % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  if (value >= 60) {
    return `${Math.round(value / 60)}m`
  }
  return `${Math.round(value)}`
}

/**
 * Empty state when no targets
 */
export function TargetsEmptyState({
  onCreateTarget,
  className,
}: {
  onCreateTarget?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center",
        "border-primary/30 bg-primary/5",
        className
      )}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <Target className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold text-sm">No Active Targets</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Set a goal to track your progress!
      </p>
      {onCreateTarget && (
        <button
          onClick={onCreateTarget}
          className="inline-flex mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition"
        >
          Create a target
        </button>
      )}
    </div>
  )
}

/**
 * Target list wrapper
 */
export function TargetList({
  targets,
  onCancel,
  className,
}: {
  targets: TargetType[]
  onCancel?: (targetId: string) => void
  className?: string
}) {
  const activeTargets = targets.filter((t) => t.status === "ACTIVE")
  const achievedTargets = targets.filter((t) => t.status === "ACHIEVED")

  return (
    <div className={cn("space-y-4", className)}>
      {activeTargets.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Active Targets
          </h3>
          <div className="space-y-2">
            {activeTargets.map((target) => (
              <TargetCard key={target.id} target={target} onCancel={onCancel} />
            ))}
          </div>
        </div>
      )}

      {achievedTargets.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Achieved
          </h3>
          <div className="space-y-2">
            {achievedTargets.slice(0, 3).map((target) => (
              <TargetCard key={target.id} target={target} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
