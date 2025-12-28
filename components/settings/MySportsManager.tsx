"use client"

import { useState, useCallback } from "react"
import { MySport, MySportsData } from "@/lib/mySports"
import { SportItem } from "@/lib/sports"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  reorderSports,
  pauseSport,
  unpauseSport,
  setPrimarySport,
  removeSport,
  updateSkillLevel,
} from "@/app/actions/sports"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GripVertical,
  MoreVertical,
  Star,
  Pause,
  Play,
  Trash2,
  Plus,
  Crown,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddSportDialog } from "./AddSportDialog"
import { toast } from "sonner"
import { SportGlyph } from "@/components/sports/SportGlyph"

type Props = {
  initialData: MySportsData
  allSports: SportItem[]
  isPro: boolean
}

const FREE_TIER_LIMIT = 3

const SKILL_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
]

function SortableSportCard({
  sport,
  isPrimary,
  onSetPrimary,
  onPause,
  onRemove,
  onUpdateSkill,
}: {
  sport: MySport
  isPrimary: boolean
  onSetPrimary: () => void
  onPause: () => void
  onRemove: () => void
  onUpdateSkill: (level: string | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sport.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`active-sport-${sport.sportName.toLowerCase().replace(/\s+/g, "-")}`}
      className={cn(
        "flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl transition-all",
        isDragging && "opacity-50 shadow-lg",
        isPrimary && "ring-2 ring-orange-500"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <SportGlyph
        sport={{ name: sport.sportName, category: sport.sportCategory, icon: sport.sportIcon }}
        size="lg"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">
            {sport.sportName}
          </span>
          {isPrimary && (
            <Crown className="w-4 h-4 text-orange-500 shrink-0" />
          )}
        </div>
        {sport.skillLevel && (
          <span className="text-xs text-slate-500">{sport.skillLevel}</span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isPrimary && (
            <DropdownMenuItem onClick={onSetPrimary}>
              <Star className="w-4 h-4 mr-2" />
              Set as Primary
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {SKILL_LEVELS.map((level) => (
            <DropdownMenuItem
              key={level.value}
              onClick={() => onUpdateSkill(level.value)}
              className={cn(
                sport.skillLevel === level.value && "bg-orange-50"
              )}
            >
              {level.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onPause}>
            <Pause className="w-4 h-4 mr-2" />
            Pause Sport
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onRemove}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function PausedSportCard({
  sport,
  onUnpause,
  onRemove,
  canUnpause,
}: {
  sport: MySport
  onUnpause: () => void
  onRemove: () => void
  canUnpause: boolean
}) {
  return (
    <div
      data-testid={`paused-sport-${sport.sportName.toLowerCase().replace(/\s+/g, "-")}`}
      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl opacity-60"
    >
      <SportGlyph
        sport={{ name: sport.sportName, category: sport.sportCategory, icon: sport.sportIcon }}
        size="lg"
        className="opacity-70"
      />

      <div className="flex-1 min-w-0">
        <span className="font-medium text-slate-700 truncate block">
          {sport.sportName}
        </span>
        <span className="block text-xs text-slate-400">Paused</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onUnpause}
          disabled={!canUnpause}
          title={canUnpause ? "Resume sport" : "Upgrade to Pro to add more sports"}
        >
          {canUnpause ? (
            <Play className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4 text-slate-400" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export function MySportsManager({ initialData, allSports, isPro }: Props) {
  const [active, setActive] = useState<MySport[]>(initialData.active)
  const [paused, setPaused] = useState<MySport[]>(initialData.paused)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const canAddMore = isPro || active.length < FREE_TIER_LIMIT
  const primarySportId = active.find((s) => s.priority === 0)?.sportId || null

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active: activeItem, over } = event

      if (over && activeItem.id !== over.id) {
        const oldIndex = active.findIndex((s) => s.id === activeItem.id)
        const newIndex = active.findIndex((s) => s.id === over.id)
        const newOrder = arrayMove(active, oldIndex, newIndex)

        // Update local state optimistically
        setActive(newOrder)

        // Update priorities in newOrder
        const updatedSports = newOrder.map((sport, index) => ({
          ...sport,
          priority: index,
        }))
        setActive(updatedSports)

        // Persist to server
        const result = await reorderSports(updatedSports.map((s) => s.id))
        if (!result.success) {
          toast.error(result.error || "Failed to reorder sports")
          // Revert on error
          setActive(active)
        }
      }
    },
    [active]
  )

  const handleSetPrimary = async (userSportId: string) => {
    setIsLoading(true)
    const result = await setPrimarySport(userSportId)
    if (result.success) {
      // Find the sport and move it to the front
      const sportIndex = active.findIndex((s) => s.id === userSportId)
      if (sportIndex > -1) {
        const newOrder = [...active]
        const [sport] = newOrder.splice(sportIndex, 1)
        newOrder.unshift({ ...sport, priority: 0 })
        // Update priorities
        setActive(newOrder.map((s, i) => ({ ...s, priority: i })))
      }
      toast.success("Primary sport updated")
    } else {
      toast.error(result.error || "Failed to set primary sport")
    }
    setIsLoading(false)
  }

  const handlePause = async (userSportId: string) => {
    setIsLoading(true)
    const result = await pauseSport(userSportId)
    if (result.success) {
      const sport = active.find((s) => s.id === userSportId)
      if (sport) {
        setActive(active.filter((s) => s.id !== userSportId))
        setPaused([...paused, { ...sport, status: "PAUSED", priority: null }])
      }
      toast.success("Sport paused")
    } else {
      toast.error(result.error || "Failed to pause sport")
    }
    setIsLoading(false)
  }

  const handleUnpause = async (userSportId: string) => {
    if (!isPro && active.length >= FREE_TIER_LIMIT) {
      toast.error("Upgrade to Pro to add more active sports")
      return
    }

    setIsLoading(true)
    const result = await unpauseSport(userSportId)
    if (result.success) {
      const sport = paused.find((s) => s.id === userSportId)
      if (sport) {
        setPaused(paused.filter((s) => s.id !== userSportId))
        setActive([
          ...active,
          { ...sport, status: "ACTIVE", priority: active.length },
        ])
      }
      toast.success("Sport resumed")
    } else {
      toast.error(result.error || "Failed to resume sport")
    }
    setIsLoading(false)
  }

  const handleRemove = async (userSportId: string, fromPaused = false) => {
    setIsLoading(true)
    const result = await removeSport(userSportId)
    if (result.success) {
      if (fromPaused) {
        setPaused(paused.filter((s) => s.id !== userSportId))
      } else {
        setActive(active.filter((s) => s.id !== userSportId))
      }
      toast.success("Sport removed")
    } else {
      toast.error(result.error || "Failed to remove sport")
    }
    setIsLoading(false)
  }

  const handleUpdateSkill = async (
    userSportId: string,
    skillLevel: string | null
  ) => {
    const result = await updateSkillLevel(userSportId, skillLevel)
    if (result.success) {
      setActive(
        active.map((s) =>
          s.id === userSportId ? { ...s, skillLevel } : s
        )
      )
      toast.success("Skill level updated")
    } else {
      toast.error(result.error || "Failed to update skill level")
    }
  }

  const handleSportAdded = (newSport: MySport) => {
    setActive([...active, newSport])
    setIsAddDialogOpen(false)
  }

  // Get available sports (those not already added)
  const addedSportIds = new Set([
    ...active.map((s) => s.sportId),
    ...paused.map((s) => s.sportId),
  ])
  const availableSports = allSports.filter((s) => !addedSportIds.has(s.id))

  return (
    <div className="space-y-6">
      {/* Active Sports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Active Sports ({active.length}
            {!isPro && `/${FREE_TIER_LIMIT}`})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!canAddMore || isLoading}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Sport
          </Button>
        </div>

        {!isPro && active.length >= FREE_TIER_LIMIT && (
          <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
            You&apos;ve reached the free tier limit. Upgrade to Pro for unlimited
            sports.
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={active.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {active.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No active sports. Add your first sport to get started.
                </div>
              ) : (
                active.map((sport) => (
                  <SortableSportCard
                    key={sport.id}
                    sport={sport}
                    isPrimary={sport.priority === 0}
                    onSetPrimary={() => handleSetPrimary(sport.id)}
                    onPause={() => handlePause(sport.id)}
                    onRemove={() => handleRemove(sport.id)}
                    onUpdateSkill={(level) => handleUpdateSkill(sport.id, level)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        <p className="mt-2 text-xs text-slate-500">
          Drag to reorder. The first sport is your Primary.
        </p>
      </div>

      {/* Paused Sports */}
      {paused.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
            Paused Sports ({paused.length})
          </h3>
          <div className="space-y-2">
            {paused.map((sport) => (
              <PausedSportCard
                key={sport.id}
                sport={sport}
                onUnpause={() => handleUnpause(sport.id)}
                onRemove={() => handleRemove(sport.id, true)}
                canUnpause={canAddMore}
              />
            ))}
          </div>
        </div>
      )}

      <AddSportDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        availableSports={availableSports}
        onSportAdded={handleSportAdded}
        isPro={isPro}
        canAdd={canAddMore}
        activeSports={active}
      />
    </div>
  )
}
