"use client"

import { BadgeCheck, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Verified Badge - Shows user's activity verification status
 *
 * V11: Trust Score determines badge level
 * - Sensor Verified (>80% sensor activities): Blue checkmark
 * - Mixed (50-80% sensor): Gray shield
 * - Manual Only (<50% sensor): No badge shown
 */

interface VerifiedBadgeProps {
  /** Trust score (0-1) or isVerified boolean */
  trustScore?: number
  /** Whether user is verified (shorthand for trustScore >= 0.8) */
  isVerified?: boolean
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Additional className */
  className?: string
}

type TrustLevel = {
  min: number
  icon: typeof BadgeCheck | null
  color: string
  label: string
}

const TRUST_LEVELS: Record<string, TrustLevel> = {
  VERIFIED: { min: 0.8, icon: BadgeCheck, color: "text-blue-500", label: "Sensor Verified" },
  MIXED: { min: 0.5, icon: Shield, color: "text-gray-400", label: "Mixed Sources" },
  MANUAL: { min: 0, icon: null, color: "", label: "Manual Entry" },
}

export function VerifiedBadge({
  trustScore,
  isVerified,
  size = "sm",
  showTooltip = true,
  className,
}: VerifiedBadgeProps) {
  // Determine trust level
  const score = trustScore ?? (isVerified ? 1.0 : 0)

  let level = TRUST_LEVELS.MANUAL
  if (score >= TRUST_LEVELS.VERIFIED.min) {
    level = TRUST_LEVELS.VERIFIED
  } else if (score >= TRUST_LEVELS.MIXED.min) {
    level = TRUST_LEVELS.MIXED
  }

  // Don't show badge for manual-only users
  const Icon = level.icon
  if (!Icon) {
    return null
  }

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const badge = (
    <Icon
      className={cn(sizeClasses[size], level.color, className)}
      aria-label={level.label}
    />
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{level.label}</span>
            {trustScore !== undefined && (
              <span className="text-muted-foreground">
                {Math.round(trustScore * 100)}% sensor-verified activities
              </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Inline verified badge for use next to usernames
 */
export function InlineVerifiedBadge({
  isVerified,
  className,
}: {
  isVerified: boolean
  className?: string
}) {
  if (!isVerified) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <BadgeCheck className={cn("w-4 h-4 text-blue-500", className)} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Sensor Verified Athlete
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
