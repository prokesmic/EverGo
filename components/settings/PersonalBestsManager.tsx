"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BenchmarkMeasurementType } from "@prisma/client"
import {
  Trophy,
  Crown,
  Star,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { upsertUserPb, deleteUserPb } from "@/app/actions/benchmarks"
import { formatBenchmarkValue, computePbStatus } from "@/lib/benchmarks/validity"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type UserPb = {
  benchmarkId: string
  value: number
  achievedAt: Date
  source: string
  verificationStatus: string
  isLegacy: boolean
}

type BenchmarkWithPb = {
  id: string
  sportId: string
  slug: string
  name: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  rankWeight: number
  validityMonths: number
  decayAfterMonths: number
  userPb: UserPb | null
}

type SportBenchmarkGroup = {
  sport: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  isPrimary: boolean
  priority: number | null
  primaryBenchmarks: BenchmarkWithPb[]
  secondaryBenchmarks: BenchmarkWithPb[]
}

interface PersonalBestsManagerProps {
  initialData: SportBenchmarkGroup[]
}

export function PersonalBestsManager({ initialData }: PersonalBestsManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeSportIndex, setActiveSportIndex] = useState(0)
  const [editingBenchmarkId, setEditingBenchmarkId] = useState<string | null>(null)
  const [deletingBenchmarkId, setDeletingBenchmarkId] = useState<string | null>(null)
  const [showSecondary, setShowSecondary] = useState(false)

  // Edit form state
  const [editValue, setEditValue] = useState("")
  const [editHours, setEditHours] = useState("")
  const [editMinutes, setEditMinutes] = useState("")
  const [editSeconds, setEditSeconds] = useState("")
  const [editDate, setEditDate] = useState("")

  const activeSport = initialData[activeSportIndex]

  const startEdit = (benchmark: BenchmarkWithPb) => {
    setEditingBenchmarkId(benchmark.id)

    if (benchmark.userPb) {
      // Populate with existing values
      if (benchmark.measurementType === "TIME") {
        const totalSeconds = benchmark.userPb.value
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = Math.floor(totalSeconds % 60)
        setEditHours(hours > 0 ? hours.toString() : "")
        setEditMinutes(minutes.toString())
        setEditSeconds(seconds.toString())
      } else if (benchmark.measurementType === "DISTANCE" && benchmark.unit === "km") {
        setEditValue((benchmark.userPb.value / 1000).toString())
      } else {
        setEditValue(benchmark.userPb.value.toString())
      }
      setEditDate(new Date(benchmark.userPb.achievedAt).toISOString().split("T")[0])
    } else {
      // Clear for new entry
      setEditValue("")
      setEditHours("")
      setEditMinutes("")
      setEditSeconds("")
      setEditDate(new Date().toISOString().split("T")[0])
    }
  }

  const cancelEdit = () => {
    setEditingBenchmarkId(null)
    setEditValue("")
    setEditHours("")
    setEditMinutes("")
    setEditSeconds("")
    setEditDate("")
  }

  const getNumericValue = (benchmark: BenchmarkWithPb): number => {
    if (benchmark.measurementType === "TIME") {
      const hours = parseInt(editHours || "0") || 0
      const minutes = parseInt(editMinutes || "0") || 0
      const seconds = parseInt(editSeconds || "0") || 0
      return hours * 3600 + minutes * 60 + seconds
    }

    const rawValue = parseFloat(editValue || "0")
    if (benchmark.measurementType === "DISTANCE" && benchmark.unit === "km") {
      return rawValue * 1000
    }
    return rawValue
  }

  const handleSave = async (benchmark: BenchmarkWithPb) => {
    const numericValue = getNumericValue(benchmark)

    if (numericValue <= 0) {
      toast.error("Please enter a valid value")
      return
    }

    if (!editDate) {
      toast.error("Please select a date")
      return
    }

    startTransition(async () => {
      try {
        await upsertUserPb({
          benchmarkId: benchmark.id,
          value: numericValue,
          achievedAtISO: new Date(editDate).toISOString(),
        })
        toast.success("Personal best saved!")
        cancelEdit()
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Failed to save personal best")
      }
    })
  }

  const handleDelete = async () => {
    if (!deletingBenchmarkId) return

    startTransition(async () => {
      try {
        await deleteUserPb(deletingBenchmarkId)
        toast.success("Personal best deleted")
        setDeletingBenchmarkId(null)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Failed to delete personal best")
      }
    })
  }

  const renderBenchmarkCard = (benchmark: BenchmarkWithPb, isPrimary: boolean) => {
    const isEditing = editingBenchmarkId === benchmark.id
    const hasPb = !!benchmark.userPb

    // Calculate status for existing PBs
    let status: { statusLabel: "current" | "decaying" | "legacy"; weight: number } | null = null
    if (benchmark.userPb) {
      status = computePbStatus({
        achievedAt: new Date(benchmark.userPb.achievedAt),
        validityMonths: benchmark.validityMonths,
        decayAfterMonths: benchmark.decayAfterMonths,
      })
    }

    return (
      <div
        key={benchmark.id}
        className={cn(
          "p-4 rounded-xl border transition-all",
          hasPb
            ? status?.statusLabel === "legacy"
              ? "bg-amber-50/50 border-amber-200"
              : status?.statusLabel === "decaying"
                ? "bg-yellow-50/50 border-yellow-200"
                : "bg-green-50/50 border-green-200"
            : "bg-slate-50 border-slate-200",
          isEditing && "ring-2 ring-orange-500"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{benchmark.name}</span>
              {isPrimary && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  Primary
                </span>
              )}
              {status?.statusLabel === "legacy" && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  Legacy
                </span>
              )}
              {status?.statusLabel === "decaying" && (
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  Aging
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {benchmark.measurementType === "TIME" ? "Time" : benchmark.unit}
              {" · "}
              {benchmark.higherIsBetter ? "Higher is better" : "Lower is better"}
            </p>
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(benchmark)}
                className="h-8 w-8 p-0"
              >
                {hasPb ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
              {hasPb && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingBenchmarkId(benchmark.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Display current value when not editing */}
        {!isEditing && hasPb && benchmark.userPb && (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-lg font-bold text-slate-900">
                {formatBenchmarkValue(
                  benchmark.userPb.value,
                  benchmark.measurementType,
                  benchmark.unit
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {new Date(benchmark.userPb.achievedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Empty state when not editing and no PB */}
        {!isEditing && !hasPb && (
          <div className="mt-3">
            <button
              onClick={() => startEdit(benchmark)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              + Add your personal best
            </button>
          </div>
        )}

        {/* Edit form */}
        {isEditing && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
            {/* Value input */}
            {benchmark.measurementType === "TIME" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Time</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="99"
                      value={editHours}
                      onChange={(e) => setEditHours(e.target.value)}
                      className="text-center"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Hours</span>
                  </div>
                  <span className="text-lg font-bold text-slate-400">:</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="00"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(e.target.value)}
                      className="text-center"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Min</span>
                  </div>
                  <span className="text-lg font-bold text-slate-400">:</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="00"
                      min="0"
                      max="59"
                      value={editSeconds}
                      onChange={(e) => setEditSeconds(e.target.value)}
                      className="text-center"
                    />
                    <span className="text-xs text-slate-500 mt-1 block text-center">Sec</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Value</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step={benchmark.measurementType === "DISTANCE" ? "0.01" : "1"}
                    placeholder="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-slate-500 min-w-[50px]">{benchmark.unit}</span>
                </div>
              </div>
            )}

            {/* Date input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Achieved
              </label>
              <Input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              {editDate && (() => {
                const achievedDate = new Date(editDate)
                const now = new Date()
                const monthsDiff =
                  (now.getFullYear() - achievedDate.getFullYear()) * 12 +
                  (now.getMonth() - achievedDate.getMonth())
                if (monthsDiff > 24) {
                  return (
                    <div className="flex items-start gap-2 text-amber-600 text-xs p-2 bg-amber-50 rounded-lg">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        This PB is over 2 years old and will be marked as &quot;Legacy&quot;.
                      </span>
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleSave(benchmark)}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isPending}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sport Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
        {initialData.map((sportGroup, index) => (
          <button
            key={sportGroup.sport.id}
            onClick={() => {
              setActiveSportIndex(index)
              setEditingBenchmarkId(null)
              setShowSecondary(false)
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm whitespace-nowrap transition-all",
              activeSportIndex === index
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
            )}
          >
            {sportGroup.isPrimary && <Crown className="h-4 w-4" />}
            {sportGroup.sport.name}
          </button>
        ))}
      </div>

      {activeSport && (
        <>
          {/* Primary Benchmarks Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-orange-500" />
              <h2 className="font-semibold text-slate-900">Primary Benchmarks</h2>
              <span className="text-xs text-slate-500">
                (Top {activeSport.primaryBenchmarks.length} for ranking)
              </span>
            </div>

            <div className="grid gap-3">
              {activeSport.primaryBenchmarks.map((benchmark) =>
                renderBenchmarkCard(benchmark, true)
              )}
            </div>
          </div>

          {/* Secondary Benchmarks Section */}
          {activeSport.secondaryBenchmarks.length > 0 && (
            <div>
              <button
                onClick={() => setShowSecondary(!showSecondary)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    showSecondary && "rotate-180"
                  )}
                />
                <h2 className="font-semibold">
                  Secondary Benchmarks ({activeSport.secondaryBenchmarks.length})
                </h2>
              </button>

              {showSecondary && (
                <div className="grid gap-3 mt-4 animate-in slide-in-from-top-2">
                  {activeSport.secondaryBenchmarks.map((benchmark) =>
                    renderBenchmarkCard(benchmark, false)
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingBenchmarkId}
        onOpenChange={(open: boolean) => !open && setDeletingBenchmarkId(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Personal Best?</DialogTitle>
            <DialogDescription>
              This will permanently remove this personal best from your records. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingBenchmarkId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
