"use client"

import { useState } from "react"
import { MySport } from "@/lib/mySports"
import { SportItem } from "@/lib/sports"
import { addSport, swapSport } from "@/app/actions/sports"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { ChevronDown, Plus, ArrowLeftRight, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Discipline = {
  id: string
  name: string
}

type Props = {
  activeSports: MySport[]
  allSports: SportItem[]
  selectedSportId: string | null
  selectedDisciplineId: string | null
  onSelect: (sportId: string, disciplineId: string | null) => void
  disciplines: Discipline[]
  onDisciplinesLoad: (sportId: string) => Promise<Discipline[]>
  isPro: boolean
}

const FREE_TIER_LIMIT = 3

export function SportQuickPicker({
  activeSports,
  allSports,
  selectedSportId,
  selectedDisciplineId,
  onSelect,
  disciplines,
  onDisciplinesLoad,
  isPro,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSwapDialog, setShowSwapDialog] = useState(false)
  const [sportToAdd, setSportToAdd] = useState<SportItem | null>(null)
  const [sportToSwap, setSportToSwap] = useState<MySport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedSport = activeSports.find((s) => s.sportId === selectedSportId)
  const selectedDiscipline = disciplines.find(
    (d) => d.id === selectedDisciplineId
  )

  const canAddMore = isPro || activeSports.length < FREE_TIER_LIMIT

  // Sports not in user's active list
  const addedSportIds = new Set(activeSports.map((s) => s.sportId))
  const availableSports = allSports.filter((s) => !addedSportIds.has(s.id))

  const handleSelectActiveSport = async (sport: MySport) => {
    const newDisciplines = await onDisciplinesLoad(sport.sportId)
    onSelect(sport.sportId, newDisciplines[0]?.id || null)
    setIsOpen(false)
  }

  const handleSelectNewSport = (sport: SportItem) => {
    setSportToAdd(sport)
    if (canAddMore) {
      handleAddAndSelect(sport)
    } else {
      setShowAddDialog(false)
      setShowSwapDialog(true)
    }
  }

  const handleAddAndSelect = async (sport: SportItem) => {
    setIsLoading(true)
    const result = await addSport(sport.id)
    if (result.success) {
      const newDisciplines = await onDisciplinesLoad(sport.id)
      onSelect(sport.id, newDisciplines[0]?.id || null)
      toast.success(`${sport.name} added to your sports`)
      setShowAddDialog(false)
    } else {
      toast.error(result.error || "Failed to add sport")
    }
    setIsLoading(false)
  }

  const handleSwapAndSelect = async () => {
    if (!sportToAdd || !sportToSwap) return

    setIsLoading(true)
    const result = await swapSport(sportToSwap.id, sportToAdd.id)
    if (result.success) {
      const newDisciplines = await onDisciplinesLoad(sportToAdd.id)
      onSelect(sportToAdd.id, newDisciplines[0]?.id || null)
      toast.success(`Swapped ${sportToSwap.sportName} with ${sportToAdd.name}`)
      setShowSwapDialog(false)
    } else {
      toast.error(result.error || "Failed to swap sports")
    }
    setIsLoading(false)
  }

  const handleLogOnce = async (sport: SportItem) => {
    // Just select the sport for this activity without adding to user's sports
    const newDisciplines = await onDisciplinesLoad(sport.id)
    onSelect(sport.id, newDisciplines[0]?.id || null)
    setShowAddDialog(false)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Sport</label>

      {/* Quick pills for active sports */}
      <div className="flex flex-wrap gap-2 mb-2">
        {activeSports.slice(0, 5).map((sport, index) => (
          <button
            key={sport.id}
            onClick={() => handleSelectActiveSport(sport)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              selectedSportId === sport.sportId
                ? "bg-orange-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            <span className="text-lg">{sport.sportIcon}</span>
            {sport.sportName}
            {index === 0 && (
              <Crown className="w-3 h-3 text-yellow-400 -ml-1" />
            )}
          </button>
        ))}

        {/* More button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
              More
              <ChevronDown className="w-3 h-3" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Select Sport</DialogTitle>
              <DialogDescription>
                Choose from your sports or add a new one.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Active sports */}
              {activeSports.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Your Sports
                  </h4>
                  <div className="space-y-1">
                    {activeSports.map((sport, index) => (
                      <button
                        key={sport.id}
                        onClick={() => handleSelectActiveSport(sport)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                          selectedSportId === sport.sportId
                            ? "bg-orange-50 border border-orange-200"
                            : "hover:bg-slate-50"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                          {sport.sportIcon}
                        </div>
                        <span className="font-medium">{sport.sportName}</span>
                        {index === 0 && (
                          <Crown className="w-4 h-4 text-orange-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new sport button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setIsOpen(false)
                  setShowAddDialog(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Add Different Sport
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discipline selector if sport has disciplines */}
      {selectedSportId && disciplines.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {disciplines.map((discipline) => (
            <button
              key={discipline.id}
              onClick={() => onSelect(selectedSportId, discipline.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                selectedDisciplineId === discipline.id
                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {discipline.name}
            </button>
          ))}
        </div>
      )}

      {/* Display current selection */}
      {selectedSport && (
        <p className="text-sm text-slate-500">
          Logging as: <strong>{selectedSport.sportName}</strong>
          {selectedDiscipline && ` - ${selectedDiscipline.name}`}
        </p>
      )}

      {/* Add Sport Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Sport</DialogTitle>
            <DialogDescription>
              {canAddMore
                ? "Select a sport to add to your list."
                : "You've reached the free limit. Choose an action below."}
            </DialogDescription>
          </DialogHeader>

          <Command className="rounded-lg border">
            <CommandInput placeholder="Search sports..." />
            <CommandList>
              <CommandEmpty>No sports found.</CommandEmpty>
              <CommandGroup>
                {availableSports.map((sport) => (
                  <CommandItem
                    key={sport.id}
                    value={sport.name}
                    className="cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xl mr-3">
                      {sport.icon}
                    </div>
                    <span className="flex-1">{sport.name}</span>
                    <div className="flex gap-1">
                      {canAddMore ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => handleSelectNewSport(sport)}
                          disabled={isLoading}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleLogOnce(sport)}
                            disabled={isLoading}
                          >
                            Log Once
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => handleSelectNewSport(sport)}
                            disabled={isLoading}
                          >
                            <ArrowLeftRight className="w-3 h-3 mr-1" />
                            Swap
                          </Button>
                        </>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Swap Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Swap Sport</DialogTitle>
            <DialogDescription>
              Select which sport to replace with{" "}
              <strong>{sportToAdd?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {activeSports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSportToSwap(sport)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 border rounded-lg transition-colors",
                  sportToSwap?.id === sport.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                  {sport.sportIcon}
                </div>
                <span className="font-medium">{sport.sportName}</span>
                {sport.priority === 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-auto">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSwapDialog(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSwapAndSelect}
              disabled={!sportToSwap || isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Swap & Select
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
