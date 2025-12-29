"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Link2,
  RefreshCw,
  Unlink,
  CheckCircle2,
  Clock,
  Activity,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface StravaIntegrationProps {
  isConnected: boolean
  lastSyncAt: string | null
  connectedAt: string | null
  activityCount: number
  isConfigured: boolean
}

export function StravaIntegration({
  isConnected,
  lastSyncAt,
  connectedAt,
  activityCount,
  isConfigured,
}: StravaIntegrationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Handle URL parameters for success/error messages
  const success = searchParams.get("success")
  const error = searchParams.get("error")

  // Show toast based on URL params (only once)
  useState(() => {
    if (success === "strava_connected") {
      toast.success("Strava connected successfully! Your activities are being imported.")
      router.replace("/settings/integrations")
    }
    if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "Authorization failed - no code received",
        token_exchange_failed: "Failed to connect to Strava",
        no_athlete: "Could not get athlete information",
        already_connected: "This Strava account is already connected to another user",
        not_configured: "Strava integration is not configured",
        internal_error: "An error occurred. Please try again.",
      }
      toast.error(errorMessages[error] || "Connection failed")
      router.replace("/settings/integrations")
    }
  })

  const handleConnect = () => {
    // Redirect to Strava OAuth
    window.location.href = "/api/strava/connect"
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/strava/sync", { method: "POST" })
      const data = await response.json()

      if (response.ok) {
        toast.success(
          `Sync complete! Imported ${data.result.imported} new activities, updated ${data.result.updated}.`
        )
        router.refresh()
      } else {
        toast.error(data.error || "Sync failed")
      }
    } catch {
      toast.error("Failed to sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Strava? Your imported activities will remain.")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/strava/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deauthorize: true }),
      })

      if (response.ok) {
        toast.success("Strava disconnected")
        router.refresh()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to disconnect")
      }
    } catch {
      toast.error("Failed to disconnect")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isConfigured) {
    return (
      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FC4C02]/10 flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FC4C02">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Strava</h3>
            <p className="text-sm text-slate-500">Integration not configured</p>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Contact admin</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border rounded-xl p-6 transition-all",
        isConnected
          ? "border-green-200 bg-green-50/50"
          : "border-slate-200 hover:border-[#FC4C02]/30"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Strava Logo */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isConnected ? "bg-[#FC4C02]" : "bg-[#FC4C02]/10"
            )}
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill={isConnected ? "white" : "#FC4C02"}
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">Strava</h3>
              {isConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {isConnected
                ? "Automatically sync your Strava activities"
                : "Import runs, rides, and more from Strava"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4 mr-2" />
                )}
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-[#FC4C02] hover:bg-[#E34500] text-white"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect Strava
            </Button>
          )}
        </div>
      </div>

      {/* Stats when connected */}
      {isConnected && (
        <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#FC4C02]" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{activityCount}</div>
              <div className="text-xs text-slate-500">Activities</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                {formatDate(lastSyncAt)}
              </div>
              <div className="text-xs text-slate-500">Last Sync</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Link2 className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                {formatDate(connectedAt)}
              </div>
              <div className="text-xs text-slate-500">Connected</div>
            </div>
          </div>
        </div>
      )}

      {/* Info for non-connected */}
      {!isConnected && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Connect your Strava account to automatically import your activities.
            We'll sync runs, rides, swims, and more - including your personal bests!
          </p>
        </div>
      )}
    </div>
  )
}
