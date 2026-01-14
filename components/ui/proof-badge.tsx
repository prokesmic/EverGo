/**
 * Proof Badge Component (V11)
 *
 * Displays verification tier badges with appropriate styling.
 * Used on profiles, leaderboards, and activity cards.
 */

"use client"

import { cn } from "@/lib/utils"
import { TIER_CONFIG, type VerificationTier } from "@/lib/verification/ladder"
import {
  Shield,
  ShieldCheck,
  BadgeCheck,
  Crown,
  type LucideIcon,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// =============================================================================
// TYPES
// =============================================================================

interface ProofBadgeProps {
  tier: VerificationTier
  size?: "xs" | "sm" | "md" | "lg"
  showLabel?: boolean
  showTooltip?: boolean
  className?: string
}

// =============================================================================
// ICON MAP
// =============================================================================

const TIER_ICONS: Record<VerificationTier, LucideIcon> = {
  BRONZE: Shield,
  SILVER: ShieldCheck,
  GOLD: BadgeCheck,
  PLATINUM: Crown,
}

const SIZE_MAP = {
  xs: { icon: 12, text: "text-[10px]", padding: "px-1 py-0.5" },
  sm: { icon: 14, text: "text-xs", padding: "px-1.5 py-0.5" },
  md: { icon: 16, text: "text-sm", padding: "px-2 py-1" },
  lg: { icon: 20, text: "text-base", padding: "px-2.5 py-1.5" },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProofBadge({
  tier,
  size = "sm",
  showLabel = false,
  showTooltip = true,
  className,
}: ProofBadgeProps) {
  const config = TIER_CONFIG[tier]
  const Icon = TIER_ICONS[tier]
  const sizeConfig = SIZE_MAP[size]

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config.bgColor,
        config.borderColor,
        sizeConfig.padding,
        className
      )}
      style={{ color: config.color }}
    >
      <Icon size={sizeConfig.icon} className="shrink-0" />
      {showLabel && (
        <span className={cn(sizeConfig.text)}>{config.name}</span>
      )}
    </span>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-semibold">{config.name} Verified</div>
            <div className="text-xs text-muted-foreground">
              {config.description}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// =============================================================================
// PROOF LEVEL BADGE
// =============================================================================

type ProofLevel = "MANUAL" | "PHOTO" | "GPX" | "SENSOR" | "VERIFIED"

interface ProofLevelBadgeProps {
  level: ProofLevel
  size?: "xs" | "sm" | "md"
  className?: string
}

const PROOF_LEVEL_CONFIG: Record<ProofLevel, {
  label: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  MANUAL: {
    label: "Manual",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
  PHOTO: {
    label: "Photo",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  GPX: {
    label: "GPS",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  SENSOR: {
    label: "Sensor",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  VERIFIED: {
    label: "Verified",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
}

export function ProofLevelBadge({
  level,
  size = "sm",
  className,
}: ProofLevelBadgeProps) {
  const config = PROOF_LEVEL_CONFIG[level]
  const sizeConfig = SIZE_MAP[size]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.color,
        config.bgColor,
        config.borderColor,
        sizeConfig.padding,
        sizeConfig.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}

// =============================================================================
// VERIFICATION PROGRESS
// =============================================================================

interface VerificationProgressProps {
  currentTier: VerificationTier
  progressToNext: number
  nextTier: VerificationTier | null
  className?: string
}

export function VerificationProgress({
  currentTier,
  progressToNext,
  nextTier,
  className,
}: VerificationProgressProps) {
  const currentConfig = TIER_CONFIG[currentTier]
  const nextConfig = nextTier ? TIER_CONFIG[nextTier] : null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <ProofBadge tier={currentTier} showLabel size="sm" showTooltip={false} />
        </div>
        {nextTier && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">Next:</span>
            <ProofBadge tier={nextTier} showLabel size="sm" showTooltip={false} />
          </div>
        )}
      </div>

      {nextTier && (
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${progressToNext}%`,
              backgroundColor: currentConfig.color,
            }}
          />
        </div>
      )}

      {!nextTier && (
        <div className="text-xs text-center text-muted-foreground">
          Maximum tier achieved!
        </div>
      )}
    </div>
  )
}
