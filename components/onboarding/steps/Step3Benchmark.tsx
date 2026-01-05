"use client"

import { useState, useEffect, useMemo, Component, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
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

// Helper to safely convert any value to string
function safeString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  try {
    return String(value)
  } catch {
    return fallback
  }
}

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

// Error boundary to catch any render errors
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class Step3ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Step3Benchmark error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
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
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Fairness badge type and icons
type FairnessBadgeType = "STANDARD" | "NORMALIZED" | "SEGMENT" | "RATING"

function FairnessBadgeIcon({ type }: { type: string }) {
  const iconClass = "w-3 h-3"
  switch (type) {
    case "STANDARD":
      return <Check className={iconClass} />
    case "NORMALIZED":
      return <Gauge className={iconClass} />
    case "SEGMENT":
      return <Target className={iconClass} />
    case "RATING":
      return <Shield className={iconClass} />
    default:
      return <Check className={iconClass} />
  }
}

const FAIRNESS_BADGES: Record<string, { label: string; color: string }> = {
  STANDARD: { label: "Standard", color: "bg-green-100 text-green-800" },
  NORMALIZED: { label: "Normalized", color: "bg-blue-100 text-blue-800" },
  SEGMENT: { label: "Segment", color: "bg-purple-100 text-purple-800" },
  RATING: { label: "Rating", color: "bg-yellow-100 text-yellow-800" },
}

// No benchmark needed UI
function NoBenchmarkUI({ message }: { message?: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
          <Target className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No benchmark needed</h2>
        <p className="text-gray-600 mt-2">
          {safeString(message, "Your Fitness Score will rank you as you log activities.")}
        </p>
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

function Step3BenchmarkInner({ sports, benchmarks }: Step3BenchmarkProps) {
  const store = useOnboardingStore()
  const [rawInput, setRawInput] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [skipBenchmark, setSkipBenchmark] = useState(false)

  // Get selected sport - safely
  const selectedSport = useMemo(() => {
    if (!sports || !Array.isArray(sports)) return undefined
    const sportId = store.primarySportId
    if (!sportId || typeof sportId !== "string") return undefined
    return sports.find((s) => s && s.id === sportId)
  }, [sports, store.primarySportId])

  // Get benchmark config for selected sport - safely
  const benchmarkConfig = useMemo<SportBenchmarkConfig | undefined>(() => {
    if (!selectedSport) return undefined
    const slug = selectedSport.slug
    if (!slug || typeof slug !== "string") return undefined
    try {
      return getBenchmarkConfig(slug)
    } catch {
      return undefined
    }
  }, [selectedSport])

  // Check if this sport should skip benchmarks
  const shouldSkip = !benchmarkConfig || isBenchmarkSkipped(benchmarkConfig)

  // Get the matching benchmark definition - safely
  const benchmarkDef = useMemo(() => {
    if (!benchmarkConfig || isBenchmarkSkipped(benchmarkConfig)) return undefined
    if (!benchmarks || !Array.isArray(benchmarks)) return undefined
    const config = benchmarkConfig as BenchmarkConfig
    const slug = config.benchmarkSlug
    if (!slug || typeof slug !== "string") return undefined
    return benchmarks.find((b) => b && b.slug === slug)
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

    try {
      const config = benchmarkConfig as BenchmarkConfig
      const value = parseBenchmarkInput(
        rawInput,
        config.inputType,
        safeString(selectedSport?.slug, "")
      )

      if (value === null) {
        setParseError(`Invalid format. Example: ${safeString(config.placeholder, "")}`)
        store.setField("initialBenchmark", undefined)
      } else {
        setParseError(null)
        store.setField("initialBenchmark", {
          benchmarkId: safeString(benchmarkDef?.id, ""),
          disciplineSlug: safeString(config.benchmarkSlug, ""),
          rawInput,
          value,
          unit: safeString(config.unit, ""),
        })
      }
    } catch (err) {
      console.error("Benchmark parse error:", err)
      setParseError("Invalid input format")
    }
  }, [rawInput, benchmarkConfig, benchmarkDef, selectedSport, store])

  // Handle skip
  useEffect(() => {
    if (skipBenchmark || shouldSkip) {
      store.setField("initialBenchmark", undefined)
    }
  }, [skipBenchmark, shouldSkip, store])

  // No sport selected
  if (!selectedSport) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a sport first</p>
      </div>
    )
  }

  // Sport should skip benchmarks
  if (shouldSkip) {
    let skipMessage = "Your Fitness Score will rank you as you log activities."
    if (benchmarkConfig && isBenchmarkSkipped(benchmarkConfig)) {
      skipMessage = safeString(benchmarkConfig.message, skipMessage)
    }
    return <NoBenchmarkUI message={skipMessage} />
  }

  // Get config safely
  const config = benchmarkConfig as BenchmarkConfig

  // Get fairness badge safely
  const fairnessKey = safeString(config.fairnessBadge, "STANDARD")
  const fairnessBadge = FAIRNESS_BADGES[fairnessKey] || FAIRNESS_BADGES["STANDARD"]

  // If somehow still no badge, show skip UI
  if (!fairnessBadge) {
    return <NoBenchmarkUI />
  }

  // Safely get all display values
  const configLabel = safeString(config.label, "Benchmark")
  const sportLabel = safeString(selectedSport.label, "Selected sport")
  const badgeLabel = safeString(fairnessBadge.label, "Standard")
  const badgeColor = safeString(fairnessBadge.color, "bg-green-100 text-green-800")
  const placeholder = safeString(config.placeholder, "")
  const helpText = safeString(config.helpText, "")
  const requiresVerification = Boolean(config.requiresVerification)
  const sensorRequired = Boolean(config.sensorRequired)

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

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{configLabel}</h3>
              <p className="text-sm text-gray-500">{sportLabel}</p>
            </div>
            <Badge className={cn("flex items-center gap-1", badgeColor)}>
              <FairnessBadgeIcon type={fairnessKey} />
              {badgeLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={placeholder}
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
            {helpText && !parseError && (
              <p className="text-sm text-gray-500">{helpText}</p>
            )}
          </div>
        </div>

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
            {requiresVerification && (
              <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                <Shield className="w-3 h-3 mr-1" /> Country/Global: Verify to appear
              </Badge>
            )}
          </div>
        </div>

        {sensorRequired && (
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

export function Step3Benchmark(props: Step3BenchmarkProps) {
  return (
    <Step3ErrorBoundary>
      <Step3BenchmarkInner {...props} />
    </Step3ErrorBoundary>
  )
}
