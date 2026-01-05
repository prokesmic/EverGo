"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/onboarding/store"
import {
  getBenchmarkConfig,
  isBenchmarkSkipped,
  parseBenchmarkInput,
  type SportBenchmarkConfig,
  type BenchmarkConfig,
} from "@/lib/onboarding/benchmarkMap"
import { Target, Check, AlertTriangle, Gauge, Shield, Clock } from "lucide-react"

import type { CatalogSportWithId } from "../OnboardingWizard"

interface BenchmarkDefinition {
  id: string
  slug: string
  name: string
  unit: string
  higherIsBetter: boolean
}

interface Step3BenchmarkProps {
  sports: CatalogSportWithId[]
  benchmarks: BenchmarkDefinition[]
}

// Fairness badge type
type FairnessBadgeType = "STANDARD" | "NORMALIZED" | "SEGMENT" | "RATING"

// Get fairness badge icon
function FairnessBadgeIcon({ type, className }: { type: FairnessBadgeType; className?: string }) {
  switch (type) {
    case "STANDARD":
      return <Check className={className} />
    case "NORMALIZED":
      return <Gauge className={className} />
    case "SEGMENT":
      return <Target className={className} />
    case "RATING":
      return <Shield className={className} />
    default:
      return <Check className={className} />
  }
}

// Fairness badge descriptions
const FAIRNESS_BADGES: Record<FairnessBadgeType, { label: string; color: string }> = {
  STANDARD: { label: "Standard", color: "bg-green-100 text-green-800" },
  NORMALIZED: { label: "Normalized", color: "bg-blue-100 text-blue-800" },
  SEGMENT: { label: "Segment", color: "bg-purple-100 text-purple-800" },
  RATING: { label: "Rating", color: "bg-yellow-100 text-yellow-800" },
}

export function Step3Benchmark({ sports, benchmarks }: Step3BenchmarkProps) {
  const store = useOnboardingStore()
  const [rawInput, setRawInput] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [skipBenchmark, setSkipBenchmark] = useState(false)

  // Get selected sport
  const selectedSport = useMemo(
    () => sports.find((s) => s.id === store.primarySportId),
    [sports, store.primarySportId]
  )

  // Get benchmark config for selected sport
  const benchmarkConfig = useMemo<SportBenchmarkConfig | undefined>(() => {
    if (!selectedSport) return undefined
    return getBenchmarkConfig(selectedSport.slug)
  }, [selectedSport])

  // Check if this sport should skip benchmarks (or has no config at all)
  const shouldSkip = !benchmarkConfig || isBenchmarkSkipped(benchmarkConfig)

  // Get the matching benchmark definition
  const benchmarkDef = useMemo(() => {
    if (!benchmarkConfig || isBenchmarkSkipped(benchmarkConfig)) return undefined
    return benchmarks.find((b) => b.slug === benchmarkConfig.benchmarkSlug)
  }, [benchmarks, benchmarkConfig])

  // Parse input when it changes
  useEffect(() => {
    if (!benchmarkConfig || isBenchmarkSkipped(benchmarkConfig) || !rawInput.trim()) {
      setParseError(null)
      if (!rawInput.trim()) {
        store.setField("initialBenchmark", undefined)
      }
      return
    }

    const config = benchmarkConfig as BenchmarkConfig
    const value = parseBenchmarkInput(rawInput, config.inputType, selectedSport?.slug || "")

    if (value === null) {
      setParseError(`Invalid format. Example: ${config.placeholder}`)
      store.setField("initialBenchmark", undefined)
    } else {
      setParseError(null)
      store.setField("initialBenchmark", {
        benchmarkId: benchmarkDef?.id || "",
        disciplineSlug: config.benchmarkSlug,
        rawInput,
        value,
        unit: config.unit,
      })
    }
  }, [rawInput, benchmarkConfig, benchmarkDef, selectedSport, store])

  // Handle skip
  useEffect(() => {
    if (skipBenchmark || shouldSkip) {
      store.setField("initialBenchmark", undefined)
    }
  }, [skipBenchmark, shouldSkip, store])

  if (!selectedSport) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a sport first</p>
      </div>
    )
  }

  // For sports that don't have benchmarks (team sports, or sports without config)
  if (shouldSkip) {
    const skipMessage = benchmarkConfig && isBenchmarkSkipped(benchmarkConfig)
      ? benchmarkConfig.message
      : "Your Fitness Score will rank you as you log activities."

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <Target className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No benchmark needed</h2>
          <p className="text-gray-600 mt-2">{skipMessage}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Your Fitness Score will start at 0
          </h3>
          <p className="text-sm text-gray-600">
            Log your first activity after onboarding to start building your ranking.
            Track matches, training sessions, and activities to climb the leaderboard.
          </p>
        </div>
      </div>
    )
  }

  const config = benchmarkConfig as BenchmarkConfig

  // Defensive: ensure fairnessBadge is a valid key
  const fairnessKey: FairnessBadgeType =
    config.fairnessBadge && config.fairnessBadge in FAIRNESS_BADGES
      ? config.fairnessBadge
      : "STANDARD"
  const FairnessBadge = FAIRNESS_BADGES[fairnessKey]

  // Safety check - if no fairness badge found, skip to no-benchmark UI
  if (!FairnessBadge) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <Target className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No benchmark needed</h2>
          <p className="text-gray-600 mt-2">Your Fitness Score will rank you as you log activities.</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Clock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Your Fitness Score will start at 0
          </h3>
          <p className="text-sm text-gray-600">
            Log your first activity after onboarding to start building your ranking.
            Track matches, training sessions, and activities to climb the leaderboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <Target className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Enter your personal best</h2>
        <p className="text-gray-600 mt-2">
          Get ranked immediately in your city and team
        </p>
      </div>

      {/* Benchmark Input */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{String(config.label || "Benchmark")}</h3>
              <p className="text-sm text-gray-500">{String(selectedSport?.label || "Selected sport")}</p>
            </div>
            <Badge className={cn("flex items-center gap-1", FairnessBadge.color)}>
              <FairnessBadgeIcon type={fairnessKey} className="w-3 h-3" />
              {String(FairnessBadge.label)}
            </Badge>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={String(config.placeholder || "")}
              className={cn(
                "text-lg",
                parseError && "border-red-300 focus:ring-red-500"
              )}
              disabled={skipBenchmark}
            />
            {parseError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {parseError}
              </p>
            )}
            {config.helpText && !parseError && (
              <p className="text-sm text-gray-500">{String(config.helpText)}</p>
            )}
          </div>
        </div>

        {/* Eligibility Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">This entry is eligible for:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-green-300 text-green-700">
              <Check className="w-3 h-3 mr-1" /> City Rank
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              <Check className="w-3 h-3 mr-1" /> Team Rank
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              <Check className="w-3 h-3 mr-1" /> Friends Rank
            </Badge>
            {config.requiresVerification && (
              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                <Shield className="w-3 h-3 mr-1" /> Country/Global: Verify to appear
              </Badge>
            )}
          </div>
        </div>

        {/* Sensor requirement warning */}
        {config.sensorRequired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Sensor recommended</p>
              <p className="text-yellow-700">
                For verified global rankings, sync with a compatible device.
              </p>
            </div>
          </div>
        )}

        {/* Skip option */}
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full text-gray-500"
            onClick={() => setSkipBenchmark(!skipBenchmark)}
          >
            {skipBenchmark ? "Enter a benchmark" : "Skip for now"}
          </Button>
          {skipBenchmark && (
            <p className="text-center text-sm text-gray-500 mt-2">
              You can add your personal bests later from your profile.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
