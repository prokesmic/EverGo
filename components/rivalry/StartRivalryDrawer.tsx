"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Swords, Trophy, Clock, Users, Search, X, ChevronRight } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { createRivalry } from "@/app/actions/rivalry"
import { RivalryMode, RivalryMetric } from "@prisma/client"

interface SuggestedRival {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  sportIndex?: number
  mutualFollows?: boolean
}

interface Sport {
  id: string
  name: string
  slug: string
  icon: string
}

interface StartRivalryDrawerProps {
  children: React.ReactNode
  preselectedOpponent?: SuggestedRival
  sports?: Sport[]
}

export function StartRivalryDrawer({
  children,
  preselectedOpponent,
  sports = [],
}: StartRivalryDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"opponent" | "sport" | "rules">(
    preselectedOpponent ? "sport" : "opponent"
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOpponent, setSelectedOpponent] = useState<SuggestedRival | null>(
    preselectedOpponent || null
  )
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null)
  const [mode, setMode] = useState<RivalryMode>(RivalryMode.VOLUME)
  const [metric, setMetric] = useState<RivalryMetric>(RivalryMetric.DISTANCE)
  const [windowDays, setWindowDays] = useState(7)

  // Suggestions (would come from API)
  const [suggestedRivals, setSuggestedRivals] = useState<SuggestedRival[]>([])
  const [searchResults, setSearchResults] = useState<SuggestedRival[]>([])

  // Fetch suggested rivals on mount
  useEffect(() => {
    if (open && step === "opponent") {
      fetchSuggestedRivals()
    }
  }, [open, step])

  // Search users
  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  async function fetchSuggestedRivals() {
    try {
      const res = await fetch("/api/rivalries/suggested")
      if (res.ok) {
        const data = await res.json()
        setSuggestedRivals(data.rivals || [])
      }
    } catch (e) {
      console.error("Failed to fetch suggested rivals:", e)
    }
  }

  async function searchUsers(query: string) {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.users || [])
      }
    } catch (e) {
      console.error("Failed to search users:", e)
    }
  }

  function handleSelectOpponent(rival: SuggestedRival) {
    setSelectedOpponent(rival)
    setStep("sport")
  }

  function handleSelectSport(sport: Sport) {
    setSelectedSport(sport)
    // Set default metric based on sport category
    if (["running", "cycling", "swimming"].includes(sport.slug)) {
      setMetric(RivalryMetric.DISTANCE)
      setMode(RivalryMode.VOLUME)
    } else if (["strength", "crossfit"].includes(sport.slug)) {
      setMetric(RivalryMetric.SESSIONS)
      setMode(RivalryMode.VOLUME)
    }
    setStep("rules")
  }

  async function handleSubmit() {
    if (!selectedOpponent || !selectedSport) return

    setLoading(true)
    setError(null)

    const result = await createRivalry({
      opponentUserId: selectedOpponent.id,
      sportSlug: selectedSport.slug,
      mode,
      metric,
      windowDays,
    })

    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.push("/rivalries")
    } else {
      setError(result.error || "Failed to create rivalry")
    }
  }

  function renderOpponentStep() {
    const displayRivals = searchQuery ? searchResults : suggestedRivals

    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a rival..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {!searchQuery && suggestedRivals.length > 0 && (
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Suggested Rivals
          </div>
        )}

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {displayRivals.map((rival) => (
            <button
              key={rival.id}
              onClick={() => handleSelectOpponent(rival)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition group"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={rival.avatarUrl || undefined} />
                <AvatarFallback>
                  {rival.displayName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{rival.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  @{rival.username}
                  {rival.sportIndex && ` - SI ${rival.sportIndex}`}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition" />
            </button>
          ))}

          {displayRivals.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No users found for "{searchQuery}"
            </div>
          )}

          {displayRivals.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Search for a friend to challenge
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderSportStep() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedOpponent?.avatarUrl || undefined} />
            <AvatarFallback>
              {selectedOpponent?.displayName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium text-sm">{selectedOpponent?.displayName}</div>
            <div className="text-xs text-muted-foreground">
              Your opponent
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedOpponent(null)
              setStep("opponent")
            }}
          >
            Change
          </Button>
        </div>

        <div className="text-sm font-medium">Choose a sport</div>

        <div className="grid grid-cols-2 gap-2">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSelectSport(sport)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border transition",
                selectedSport?.id === sport.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-orange-300"
              )}
            >
              <span className="text-xl">{sport.icon}</span>
              <span className="text-sm font-medium">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  function renderRulesStep() {
    return (
      <div className="space-y-5">
        {/* Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={selectedOpponent?.avatarUrl || undefined} />
            <AvatarFallback>
              {selectedOpponent?.displayName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium text-sm">
              {selectedOpponent?.displayName} - {selectedSport?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {windowDays} day challenge
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Competition Type</Label>
          <RadioGroup
            value={mode}
            onValueChange={(val) => setMode(val as RivalryMode)}
            className="grid grid-cols-2 gap-2"
          >
            <label
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition",
                mode === RivalryMode.VOLUME
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-orange-300"
              )}
            >
              <RadioGroupItem value={RivalryMode.VOLUME} className="mt-1" />
              <div>
                <div className="font-medium text-sm flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  Volume
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sum up total distance, time, or sessions
                </div>
              </div>
            </label>
            <label
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition",
                mode === RivalryMode.BENCHMARK
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-orange-300"
              )}
            >
              <RadioGroupItem value={RivalryMode.BENCHMARK} className="mt-1" />
              <div>
                <div className="font-medium text-sm flex items-center gap-1.5">
                  <Swords className="h-3.5 w-3.5" />
                  Benchmark
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Best single performance wins
                </div>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Metric Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Metric to Track</Label>
          <RadioGroup
            value={metric}
            onValueChange={(val) => setMetric(val as RivalryMetric)}
            className="grid grid-cols-3 gap-2"
          >
            {[
              { value: RivalryMetric.DISTANCE, label: "Distance", icon: "km" },
              { value: RivalryMetric.DURATION, label: "Time", icon: "h" },
              { value: RivalryMetric.SESSIONS, label: "Sessions", icon: "#" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border cursor-pointer transition",
                  metric === opt.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300"
                )}
              >
                <RadioGroupItem value={opt.value} className="sr-only" />
                <span className="text-lg font-bold text-orange-600">{opt.icon}</span>
                <span className="text-xs font-medium mt-1">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Duration</Label>
          <RadioGroup
            value={String(windowDays)}
            onValueChange={(val) => setWindowDays(Number(val))}
            className="flex gap-2"
          >
            {[7, 14, 30].map((days) => (
              <label
                key={days}
                className={cn(
                  "flex-1 flex items-center justify-center p-2.5 rounded-xl border cursor-pointer transition",
                  windowDays === days
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300"
                )}
              >
                <RadioGroupItem value={String(days)} className="sr-only" />
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-sm font-medium">{days} days</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-orange-500" />
              Start a Rivalry
            </DrawerTitle>
            <DrawerDescription>
              {step === "opponent" && "Choose someone to challenge"}
              {step === "sport" && "Pick a sport to compete in"}
              {step === "rules" && "Set the competition rules"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            {step === "opponent" && renderOpponentStep()}
            {step === "sport" && renderSportStep()}
            {step === "rules" && renderRulesStep()}
          </div>

          <DrawerFooter>
            {step === "rules" && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                {loading ? "Sending Challenge..." : "Send Challenge"}
              </Button>
            )}
            {step !== "opponent" && (
              <Button
                variant="outline"
                onClick={() =>
                  setStep(step === "rules" ? "sport" : "opponent")
                }
              >
                Back
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
