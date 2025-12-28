"use client"

import { useState } from "react"
import { MySport } from "@/lib/mySports"
import { SportItem } from "@/lib/sports"
import { addSport, swapSport } from "@/app/actions/sports"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { ArrowLeftRight, Plus } from "lucide-react"
import { toast } from "sonner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { SportGlyph } from "@/components/sports/SportGlyph"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableSports: SportItem[]
  onSportAdded: (sport: MySport) => void
  isPro: boolean
  canAdd: boolean
  activeSports: MySport[]
}

const FREE_TIER_LIMIT = 3

export function AddSportDialog({
  open,
  onOpenChange,
  availableSports,
  onSportAdded,
  isPro,
  canAdd,
  activeSports,
}: Props) {
  const [selectedSport, setSelectedSport] = useState<SportItem | null>(null)
  const [sportToSwap, setSportToSwap] = useState<MySport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"select" | "swap">("select")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSelectSport = (sport: SportItem) => {
    setSelectedSport(sport)
    if (canAdd) {
      handleAddSport(sport)
    } else {
      // Show swap UI for free tier at limit
      setStep("swap")
    }
  }

  const handleAddSport = async (sport: SportItem) => {
    setIsLoading(true)
    const result = await addSport(sport.id)
    if (result.success && result.data) {
      const newSport: MySport = {
        id: result.data.userSportId,
        sportId: sport.id,
        sportName: sport.name,
        sportIcon: sport.icon,
        sportCategory: sport.category,
        status: "ACTIVE",
        priority: activeSports.length,
        skillLevel: null,
        startedAt: null,
      }
      onSportAdded(newSport)
      toast.success(`${sport.name} added to your sports`)
      handleClose()
    } else {
      toast.error(result.error || "Failed to add sport")
    }
    setIsLoading(false)
  }

  const handleSwap = async () => {
    if (!selectedSport || !sportToSwap) return

    setIsLoading(true)
    const result = await swapSport(sportToSwap.id, selectedSport.id)
    if (result.success && result.data) {
      const newSport: MySport = {
        id: result.data.userSportId,
        sportId: selectedSport.id,
        sportName: selectedSport.name,
        sportIcon: selectedSport.icon,
        sportCategory: selectedSport.category,
        status: "ACTIVE",
        priority: sportToSwap.priority,
        skillLevel: null,
        startedAt: null,
      }
      onSportAdded(newSport)
      toast.success(`Swapped ${sportToSwap.sportName} with ${selectedSport.name}`)
      handleClose()
    } else {
      toast.error(result.error || "Failed to swap sports")
    }
    setIsLoading(false)
  }

  const handleClose = () => {
    setSelectedSport(null)
    setSportToSwap(null)
    setStep("select")
    onOpenChange(false)
  }

  const content = (
    <div className="space-y-4">
      {step === "select" ? (
        <>
          {!canAdd && !isPro && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              You&apos;ve reached the free limit ({FREE_TIER_LIMIT} sports). Select a
              sport to swap with an existing one, or upgrade to Pro.
            </div>
          )}

          <Command className="rounded-xl border shadow-sm">
            <CommandInput placeholder="Search sports..." className="h-11" />
            <CommandList className="max-h-[360px] overflow-auto">
              <CommandEmpty>No sports found.</CommandEmpty>
              <CommandGroup>
                {availableSports.map((sport) => (
                  <CommandItem
                    key={sport.id}
                    value={sport.name}
                    onSelect={() => handleSelectSport(sport)}
                    disabled={isLoading}
                    data-testid={`sport-item-${sport.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className={cn(
                      "h-11 px-3 rounded-xl flex items-center gap-3",
                      "cursor-pointer select-none",
                      "aria-selected:bg-emerald-50 aria-selected:text-foreground",
                      "data-[disabled=true]:opacity-50"
                    )}
                  >
                    <SportGlyph sport={{ name: sport.name, category: sport.category, icon: sport.icon }} />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{sport.name}</div>
                    </div>

                    {canAdd ? (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Add
                      </div>
                    ) : (
                      <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {availableSports.length === 0 && (
            <p className="text-center text-slate-500 py-4">
              You&apos;ve added all available sports!
            </p>
          )}
        </>
      ) : (
        <>
          <div className="text-center mb-4">
            <p className="text-sm text-slate-600">
              Select a sport to replace with{" "}
              <strong>{selectedSport?.name}</strong>
            </p>
          </div>

          <div className="space-y-2">
            {activeSports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSportToSwap(sport)}
                disabled={isLoading}
                data-testid={`swap-sport-${sport.sportName.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "w-full flex items-center gap-3 p-3 border rounded-xl transition-all",
                  sportToSwap?.id === sport.id
                    ? "border-orange-500 bg-orange-50 ring-1 ring-orange-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <SportGlyph
                  sport={{ name: sport.sportName, category: sport.sportCategory, icon: sport.sportIcon }}
                  size="lg"
                />
                <div className="min-w-0 flex-1 text-left">
                  <span className="font-medium truncate block">{sport.sportName}</span>
                </div>
                {sport.priority === 0 && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full shrink-0">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setStep("select")}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSwap}
              disabled={!sportToSwap || isLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Swap
            </Button>
          </div>
        </>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {step === "select" ? "Add a Sport" : "Select Sport to Replace"}
            </DialogTitle>
            <DialogDescription>
              {step === "select"
                ? "Choose a sport to add to your active sports."
                : "Pick which sport you want to swap out."}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {step === "select" ? "Add a Sport" : "Select Sport to Replace"}
          </DrawerTitle>
          <DrawerDescription>
            {step === "select"
              ? "Choose a sport to add to your active sports."
              : "Pick which sport you want to swap out."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
