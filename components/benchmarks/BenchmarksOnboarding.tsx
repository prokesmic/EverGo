"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertUserPb } from "@/app/actions/benchmarks"
import { formatBenchmarkValue, formatTime, parseTime } from "@/lib/benchmarks/validity"
import { Trophy, Clock, Zap, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { BenchmarkMeasurementType } from "@prisma/client"

interface BenchmarkDef {
  id: string
  name: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  rankWeight: number
}

interface UserPb {
  id: string
  value: number
  achievedAt: Date
  isLegacy: boolean
}

interface BenchmarkWithPb extends BenchmarkDef {
  userPb: UserPb | null
}

interface Props {
  sport: { id: string; name: string }
  benchmarks: BenchmarkWithPb[]
}

export function BenchmarksOnboarding({ sport, benchmarks }: Props) {
  const [pending, startTransition] = React.useTransition()
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set())
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSave = (benchmarkId: string) => {
    const valueInput = document.getElementById(`val-${benchmarkId}`) as HTMLInputElement
    const dateInput = document.getElementById(`date-${benchmarkId}`) as HTMLInputElement

    if (!valueInput?.value || !dateInput?.value) {
      setErrors((prev) => ({ ...prev, [benchmarkId]: "Please enter both value and date" }))
      return
    }

    const benchmark = benchmarks.find((b) => b.id === benchmarkId)
    if (!benchmark) return

    // Parse value based on measurement type
    let numericValue: number
    if (benchmark.measurementType === "TIME") {
      // Try to parse as mm:ss or hh:mm:ss first
      const parsed = parseTime(valueInput.value)
      if (parsed !== null) {
        numericValue = parsed
      } else {
        // Fallback to raw seconds
        numericValue = Number(valueInput.value)
      }
    } else {
      numericValue = Number(valueInput.value)
    }

    if (isNaN(numericValue) || numericValue <= 0) {
      setErrors((prev) => ({ ...prev, [benchmarkId]: "Please enter a valid positive number" }))
      return
    }

    setErrors((prev) => ({ ...prev, [benchmarkId]: "" }))

    startTransition(async () => {
      try {
        await upsertUserPb({
          benchmarkId,
          value: numericValue,
          achievedAtISO: dateInput.value,
        })
        setSavedIds((prev) => new Set(prev).add(benchmarkId))
      } catch {
        setErrors((prev) => ({ ...prev, [benchmarkId]: "Failed to save. Please try again." }))
      }
    })
  }

  const getPlaceholder = (measurementType: BenchmarkMeasurementType) => {
    switch (measurementType) {
      case "TIME":
        return "mm:ss or seconds"
      case "DISTANCE":
        return "meters"
      case "SPEED":
        return "km/h"
      case "POWER":
        return "watts"
      case "WEIGHT_REPS":
        return "kg"
      case "SCORE":
      case "COUNT":
        return "number"
      case "GRADE_LEVEL":
        return "level (1-10)"
      default:
        return "value"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 mb-4">
          <Trophy className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Set Your Personal Bests</h1>
        <p className="text-slate-500 mt-2">
          Enter your best results for {sport.name}. These help seed your initial rankings.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Bests older than 24 months won't affect rankings (still saved as legacy).
        </p>
      </div>

      <div className="space-y-4">
        {benchmarks.map((benchmark) => {
          const hasPb = benchmark.userPb !== null || savedIds.has(benchmark.id)
          const error = errors[benchmark.id]

          return (
            <Card key={benchmark.id} className="p-5 rounded-2xl shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{benchmark.name}</span>
                    {hasPb && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        Saved
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    {benchmark.measurementType === "TIME" && <Clock className="w-3.5 h-3.5" />}
                    <span>
                      {benchmark.measurementType} • {benchmark.unit}
                    </span>
                    {!benchmark.higherIsBetter && (
                      <span className="text-xs text-slate-400">(lower is better)</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Input
                    defaultValue={
                      benchmark.userPb
                        ? benchmark.measurementType === "TIME"
                          ? formatTime(benchmark.userPb.value)
                          : benchmark.userPb.value.toString()
                        : ""
                    }
                    placeholder={getPlaceholder(benchmark.measurementType)}
                    id={`val-${benchmark.id}`}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    defaultValue={
                      benchmark.userPb
                        ? new Date(benchmark.userPb.achievedAt).toISOString().slice(0, 10)
                        : ""
                    }
                    id={`date-${benchmark.id}`}
                    className="w-full"
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <Button
                  onClick={() => handleSave(benchmark.id)}
                  disabled={pending}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {pending ? "Saving..." : "Save"}
                </Button>
              </div>

              {error && (
                <div className="mt-2 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}

              {benchmark.userPb?.isLegacy && (
                <div className="mt-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  This PB is older than 24 months and won't affect your ranking seed (saved as
                  legacy).
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
        <Link href="/home">
          <Button variant="outline" className="w-full sm:w-auto">
            Skip for now
          </Button>
        </Link>
        <Link href="/activity/create">
          <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
            <Zap className="w-4 h-4 mr-2" />
            Log Your First Activity
          </Button>
        </Link>
      </div>
    </div>
  )
}
