"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BenchmarkMeasurementType } from "@prisma/client"
import { Trophy } from "lucide-react"
import { parseTime } from "@/lib/benchmarks/validity"

export type BenchmarkDef = {
  id: string
  name: string
  slug: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  targetJson?: unknown
}

export type AchievementDraft = {
  benchmarkId: string
  value: number
  source: "USER_ENTERED"
  meta?: Record<string, unknown>
}

/**
 * Epley formula for 1RM estimate
 */
function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg
  return weightKg * (1 + reps / 30)
}

/**
 * Determines if a benchmark requires manual input
 * (i.e., cannot be auto-derived from activity metrics)
 */
function requiresManualInput(measurementType: BenchmarkMeasurementType): boolean {
  return [
    "SCORE",
    "COUNT",
    "GRADE_LEVEL",
    "RESULT",
    "WEIGHT_REPS",
    "POWER",
  ].includes(measurementType)
}

interface AchievementsSectionProps {
  benchmarks: BenchmarkDef[]
  onChange: (results: AchievementDraft[]) => void
}

export function AchievementsSection({
  benchmarks,
  onChange,
}: AchievementsSectionProps) {
  const [rows, setRows] = React.useState<Record<string, Record<string, string>>>({})

  // Filter to only show benchmarks that need manual input
  const manualBenchmarks = React.useMemo(
    () => benchmarks.filter((b) => requiresManualInput(b.measurementType)),
    [benchmarks]
  )

  // Update parent whenever rows change
  React.useEffect(() => {
    const drafts: AchievementDraft[] = []

    for (const b of benchmarks) {
      const r = rows[b.id]
      if (!r) continue

      // TIME - parse mm:ss or raw seconds
      if (b.measurementType === "TIME") {
        const parsed = parseTime(r.value ?? "")
        if (parsed !== null) {
          drafts.push({ benchmarkId: b.id, value: parsed, source: "USER_ENTERED" })
        } else {
          const sec = Number(r.value)
          if (!isNaN(sec) && sec > 0) {
            drafts.push({ benchmarkId: b.id, value: sec, source: "USER_ENTERED" })
          }
        }
      }

      // Numeric types
      if (
        ["DISTANCE", "SPEED", "POWER", "SCORE", "COUNT", "GRADE_LEVEL"].includes(
          b.measurementType
        )
      ) {
        const v = Number(r.value)
        if (!isNaN(v) && r.value !== "" && v > 0) {
          drafts.push({
            benchmarkId: b.id,
            value: v,
            source: "USER_ENTERED",
            meta: r.meta ? JSON.parse(r.meta) : undefined,
          })
        }
      }

      // RESULT - win/draw/loss mapped to 1/0.5/0
      if (b.measurementType === "RESULT" && r.value) {
        const val =
          r.value === "win" ? 1 : r.value === "draw" ? 0.5 : r.value === "loss" ? 0 : null
        if (val !== null) {
          drafts.push({
            benchmarkId: b.id,
            value: val,
            source: "USER_ENTERED",
            meta: { result: r.value },
          })
        }
      }

      // WEIGHT_REPS - compute 1RM from weight and reps
      if (b.measurementType === "WEIGHT_REPS") {
        const w = Number(r.weightKg)
        const reps = Number(r.reps)
        if (!isNaN(w) && !isNaN(reps) && w > 0 && reps > 0) {
          const oneRM = epley1RM(w, reps)
          drafts.push({
            benchmarkId: b.id,
            value: oneRM,
            source: "USER_ENTERED",
            meta: { weightKg: w, reps, estimatedOneRM: oneRM },
          })
        }
      }
    }

    onChange(drafts)
  }, [rows, benchmarks, onChange])

  // Don't render if no manual benchmarks for this sport
  if (manualBenchmarks.length === 0) {
    return null
  }

  const updateRow = (benchmarkId: string, field: string, value: string) => {
    setRows((prev) => ({
      ...prev,
      [benchmarkId]: {
        ...(prev[benchmarkId] ?? {}),
        [field]: value,
      },
    }))
  }

  const getPlaceholder = (measurementType: BenchmarkMeasurementType, unit: string) => {
    switch (measurementType) {
      case "TIME":
        return "mm:ss or seconds"
      case "DISTANCE":
        return `meters`
      case "SPEED":
        return `km/h`
      case "POWER":
        return `watts`
      case "WEIGHT_REPS":
        return "kg"
      case "SCORE":
        return "points"
      case "COUNT":
        return unit === "reps" ? "reps" : "count"
      case "GRADE_LEVEL":
        return "level (1-10)"
      default:
        return "value"
    }
  }

  return (
    <Card className="p-5 rounded-2xl shadow-sm border bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-orange-500" />
        <span className="font-semibold text-slate-900">Achievements</span>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Add stats that can&apos;t be derived automatically (match results, grades, 1RM,
        etc.)
      </p>

      <div className="space-y-4">
        {manualBenchmarks.map((b) => (
          <div key={b.id} className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">{b.name}</Label>

            {b.measurementType === "WEIGHT_REPS" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    placeholder="Weight (kg)"
                    type="number"
                    min={0}
                    step="0.5"
                    onChange={(e) => updateRow(b.id, "weightKg", e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Reps"
                    type="number"
                    min={1}
                    onChange={(e) => updateRow(b.id, "reps", e.target.value)}
                  />
                </div>
              </div>
            ) : b.measurementType === "RESULT" ? (
              <Select onValueChange={(v) => updateRow(b.id, "value", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            ) : b.measurementType === "GRADE_LEVEL" ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder={getPlaceholder(b.measurementType, b.unit)}
                  type="number"
                  min={1}
                  max={20}
                  onChange={(e) => updateRow(b.id, "value", e.target.value)}
                />
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  {b.unit}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder={getPlaceholder(b.measurementType, b.unit)}
                  type={b.measurementType === "TIME" ? "text" : "number"}
                  min={0}
                  step={b.measurementType === "POWER" ? 1 : 0.1}
                  onChange={(e) => updateRow(b.id, "value", e.target.value)}
                />
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  {b.unit}
                </span>
              </div>
            )}

            {!b.higherIsBetter && (
              <p className="text-xs text-slate-400">(lower is better)</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
