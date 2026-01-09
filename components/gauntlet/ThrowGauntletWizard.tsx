"use client"

/**
 * V6 Throw Gauntlet Wizard
 *
 * Step-by-step wizard to challenge an opponent
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Swords,
  Clock,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ThrowGauntletWizardProps {
  userId: string
  preselectedOpponentId?: string
}

type Step = "search" | "configure" | "confirm"

interface Opponent {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  city: string | null
  country: string | null
}

const DURATION_OPTIONS = [
  { value: "ONE_DAY", label: "1 Day", description: "Quick sprint" },
  { value: "THREE_DAYS", label: "3 Days", description: "Weekend battle" },
  { value: "ONE_WEEK", label: "1 Week", description: "Classic showdown" },
]

export function ThrowGauntletWizard({
  userId,
  preselectedOpponentId,
}: ThrowGauntletWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(preselectedOpponentId ? "configure" : "search")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Opponent[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null)
  const [duration, setDuration] = useState("ONE_WEEK")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search for opponents
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=users`)
      if (res.ok) {
        const data = await res.json()
        // Filter out self
        setSearchResults(
          (data.users || []).filter((u: Opponent) => u.id !== userId)
        )
      }
    } catch {
      // Ignore errors
    } finally {
      setIsSearching(false)
    }
  }

  // Select opponent and move to configure
  const handleSelectOpponent = (opponent: Opponent) => {
    setSelectedOpponent(opponent)
    setStep("configure")
  }

  // Submit the gauntlet
  const handleSubmit = async () => {
    if (!selectedOpponent) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/gauntlet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentId: selectedOpponent.id,
          duration,
          message: message.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create gauntlet")
      }

      const data = await res.json()
      router.push(`/gauntlets/${data.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Progress Steps */}
      <div className="flex items-center border-b border-slate-100 px-6 py-4">
        <StepIndicator
          number={1}
          label="Find Opponent"
          isActive={step === "search"}
          isComplete={step !== "search"}
        />
        <div className="flex-1 h-0.5 bg-slate-200 mx-3" />
        <StepIndicator
          number={2}
          label="Configure"
          isActive={step === "configure"}
          isComplete={step === "confirm"}
        />
        <div className="flex-1 h-0.5 bg-slate-200 mx-3" />
        <StepIndicator
          number={3}
          label="Confirm"
          isActive={step === "confirm"}
          isComplete={false}
        />
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* Step 1: Search */}
        {step === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or username..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((opponent) => (
                  <button
                    key={opponent.id}
                    onClick={() => handleSelectOpponent(opponent)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={opponent.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        {(opponent.displayName ?? opponent.username ?? "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {opponent.displayName ?? opponent.username}
                      </div>
                      {opponent.city && (
                        <div className="text-sm text-slate-500">
                          {opponent.city}, {opponent.country}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No athletes found matching "{searchQuery}"
              </div>
            )}

            {!isSearching && searchQuery.length < 2 && (
              <div className="text-center py-8 text-slate-500">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === "configure" && selectedOpponent && (
          <div className="space-y-6">
            {/* Selected Opponent */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarImage src={selectedOpponent.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(selectedOpponent.displayName ?? selectedOpponent.username ?? "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  {selectedOpponent.displayName ?? selectedOpponent.username}
                </div>
                <div className="text-sm text-slate-500">Your opponent</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep("search")}>
                Change
              </Button>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="inline w-4 h-4 mr-1" />
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDuration(option.value)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-colors",
                      duration === option.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-slate-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message (optional)
              </label>
              <Textarea
                placeholder="Add a challenge message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <div className="text-xs text-slate-500 mt-1 text-right">
                {message.length}/200
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <div className="font-medium text-violet-900">How Gauntlets Work</div>
                  <p className="text-sm text-violet-700 mt-1">
                    Both athletes accumulate Power from activities during the competition
                    period. The athlete with more Power at the end wins!
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("search")}>
                Back
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setStep("confirm")}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && selectedOpponent && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Swords className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Challenge {selectedOpponent.displayName ?? selectedOpponent.username}?
              </h3>
              <p className="text-slate-500 mt-1">
                {DURATION_OPTIONS.find((o) => o.value === duration)?.label} gauntlet
              </p>
            </div>

            {/* Details */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Opponent</span>
                <span className="font-medium">
                  {selectedOpponent.displayName ?? selectedOpponent.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration</span>
                <span className="font-medium">
                  {DURATION_OPTIONS.find((o) => o.value === duration)?.label}
                </span>
              </div>
              {message && (
                <div>
                  <span className="text-slate-600 block mb-1">Message</span>
                  <span className="text-slate-900">{message}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("configure")}>
                Back
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4 mr-2" />
                    Throw Gauntlet
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({
  number,
  label,
  isActive,
  isComplete,
}: {
  number: number
  label: string
  isActive: boolean
  isComplete: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
          isComplete && "bg-emerald-500 text-white",
          isActive && "bg-emerald-100 text-emerald-700 border-2 border-emerald-500",
          !isComplete && !isActive && "bg-slate-100 text-slate-400"
        )}
      >
        {isComplete ? <Check className="w-4 h-4" /> : number}
      </div>
      <span
        className={cn(
          "text-sm font-medium hidden sm:inline",
          isActive ? "text-slate-900" : "text-slate-500"
        )}
      >
        {label}
      </span>
    </div>
  )
}
