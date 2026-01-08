"use client"

/**
 * Verified Athlete Badge
 *
 * Blue checkmark badge for users with verified data.
 */

import { cn } from "@/lib/utils"
import { BadgeCheck } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VerifiedBadgeProps {
  isVerified: boolean
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  className?: string
}

const SIZES = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function VerifiedBadge({
  isVerified,
  size = "md",
  showTooltip = true,
  className,
}: VerifiedBadgeProps) {
  if (!isVerified) return null

  const badge = (
    <BadgeCheck
      className={cn(
        SIZES[size],
        "text-blue-500 dark:text-blue-400 flex-shrink-0",
        className
      )}
      data-testid="verified-athlete-badge"
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
        <TooltipContent>
          <p className="font-medium">Data Verified</p>
          <p className="text-xs text-muted-foreground">
            Verified activities + PB evidence
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Verified status card for profile or settings
 */
interface VerifiedStatusCardProps {
  isVerified: boolean
  verifiedSince?: Date | null
  activityCount: number
  hasVerifiedPb: boolean
  className?: string
}

export function VerifiedStatusCard({
  isVerified,
  verifiedSince,
  activityCount,
  hasVerifiedPb,
  className,
}: VerifiedStatusCardProps) {
  const requiredActivities = 5

  return (
    <div
      className={cn(
        "p-4 rounded-lg border",
        isVerified
          ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          : "bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <BadgeCheck
          className={cn(
            "h-5 w-5",
            isVerified ? "text-blue-500" : "text-muted-foreground"
          )}
        />
        <h3 className="font-semibold">
          {isVerified ? "Data Verified" : "Get Verified"}
        </h3>
      </div>

      {isVerified ? (
        <p className="text-sm text-muted-foreground">
          Verified since{" "}
          {verifiedSince?.toLocaleDateString() || "recently"}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Complete these requirements to earn the verified badge:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-xs",
                  activityCount >= requiredActivities
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {activityCount >= requiredActivities ? "✓" : activityCount}
              </div>
              <span>
                {activityCount >= requiredActivities
                  ? `${activityCount} verified activities`
                  : `${requiredActivities - activityCount} more verified activities needed`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-xs",
                  hasVerifiedPb
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {hasVerifiedPb ? "✓" : "○"}
              </div>
              <span>
                {hasVerifiedPb
                  ? "Has verified personal best"
                  : "Need 1 verified personal best"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
