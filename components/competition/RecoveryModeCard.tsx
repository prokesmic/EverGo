"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Pause,
  Play,
  Clock,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

/**
 * Recovery Mode Card (V11)
 *
 * Allows users to pause ranking decay during rest/injury periods.
 * Shows status, controls, and remaining uses.
 */

interface RecoveryStatus {
  isActive: boolean
  startedAt: string | null
  endsAt: string | null
  usesRemaining: number
  canActivate: boolean
  cannotActivateReason?: string
  daysRemaining?: number
  config: {
    minDurationDays: number
    maxDurationDays: number
    maxUsesPerSeason: number
    cooldownDays: number
  }
}

interface RecoveryModeCardProps {
  className?: string
}

export function RecoveryModeCard({ className }: RecoveryModeCardProps) {
  const [status, setStatus] = useState<RecoveryStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [selectedDays, setSelectedDays] = useState(7)
  const [showActivateForm, setShowActivateForm] = useState(false)

  // Fetch recovery status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/me/recovery")
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
          setSelectedDays(data.config.minDurationDays)
        }
      } catch (error) {
        console.error("Failed to fetch recovery status:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const handleActivate = async () => {
    if (!status?.canActivate) return

    setActivating(true)
    try {
      const res = await fetch("/api/me/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays: selectedDays }),
      })

      const data = await res.json()

      if (data.activated) {
        toast.success("Recovery mode activated", {
          description: `Ranking decay paused for ${selectedDays} days`,
        })
        // Refresh status
        const statusRes = await fetch("/api/me/recovery")
        if (statusRes.ok) {
          setStatus(await statusRes.json())
        }
        setShowActivateForm(false)
      } else {
        toast.error("Failed to activate", {
          description: data.error,
        })
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setActivating(false)
    }
  }

  const handleDeactivate = async () => {
    setActivating(true)
    try {
      const res = await fetch("/api/me/recovery", {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.deactivated) {
        toast.success("Recovery mode ended")
        // Refresh status
        const statusRes = await fetch("/api/me/recovery")
        if (statusRes.ok) {
          setStatus(await statusRes.json())
        }
      } else {
        toast.error("Failed to deactivate", {
          description: data.error,
        })
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setActivating(false)
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!status) {
    return null
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base">Recovery Mode</CardTitle>
          </div>
          {status.isActive && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          Pause ranking decay during rest or injury periods
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status.isActive ? (
          // Active state
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                Ends{" "}
                {status.endsAt && (
                  <>
                    {formatDistanceToNow(new Date(status.endsAt), {
                      addSuffix: true,
                    })}
                    <span className="text-muted-foreground">
                      {" "}
                      ({format(new Date(status.endsAt), "MMM d")})
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Your rankings are protected. Activities still count toward
                volume metrics.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDeactivate}
              disabled={activating}
            >
              {activating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              End Recovery Early
            </Button>
          </div>
        ) : showActivateForm ? (
          // Activation form
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Duration</span>
                <span className="font-medium">{selectedDays} days</span>
              </div>
              <Slider
                value={[selectedDays]}
                onValueChange={([value]) => setSelectedDays(value)}
                min={status.config.minDurationDays}
                max={status.config.maxDurationDays}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {status.config.minDurationDays}-{status.config.maxDurationDays} days available
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowActivateForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleActivate}
                disabled={activating || !status.canActivate}
              >
                {activating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Pause className="w-4 h-4 mr-2" />
                )}
                Activate
              </Button>
            </div>
          </div>
        ) : (
          // Default state
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uses remaining</span>
              <span className="font-medium">
                {status.usesRemaining} / {status.config.maxUsesPerSeason}
              </span>
            </div>

            {!status.canActivate && status.cannotActivateReason && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {status.cannotActivateReason}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowActivateForm(true)}
              disabled={!status.canActivate}
            >
              <Pause className="w-4 h-4 mr-2" />
              Start Recovery Period
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <p className="text-xs text-muted-foreground">
          Recovery mode pauses ELO decay but you can still log activities.
        </p>
      </CardFooter>
    </Card>
  )
}
