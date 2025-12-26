"use client"

import * as React from "react"
import {
    Activity,
    Bike,
    Waves,
    Mountain,
    Dumbbell,
    Heart,
    Footprints,
    Wind,
    Snowflake,
    Zap,
    Target,
    type LucideIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sport icons mapping
const sportIcons: Record<string, LucideIcon> = {
    "running": Activity,
    "cycling": Bike,
    "swimming": Waves,
    "hiking": Mountain,
    "gym": Dumbbell,
    "walking": Footprints,
    "yoga": Wind,
    "skiing": Snowflake,
    "crossfit": Zap,
    "triathlon": Target,
    "default": Heart,
}

export function getSportIcon(sportName: string): LucideIcon {
    const key = sportName.toLowerCase()
    return sportIcons[key] || sportIcons.default
}

interface SportTile {
    id: string
    name: string
    icon?: LucideIcon
}

interface SportTilesProps {
    sports: SportTile[]
    value: string
    onChange: (value: string) => void
    maxVisible?: number
    size?: "sm" | "md" | "lg"
    className?: string
}

export function SportTiles({
    sports,
    value,
    onChange,
    maxVisible = 8,
    size = "md",
    className
}: SportTilesProps) {
    const visibleSports = sports.slice(0, maxVisible)

    const sizeClasses = {
        sm: "px-4 py-2 gap-1.5",
        md: "px-6 py-4 gap-2",
        lg: "px-8 py-5 gap-3"
    }

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8"
    }

    const textSizes = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    }

    return (
        <div className={cn("flex gap-3 overflow-x-auto pb-2 scrollbar-hide", className)}>
            {visibleSports.map((sport) => {
                const Icon = sport.icon || getSportIcon(sport.name)
                const isSelected = value === sport.id

                return (
                    <button
                        key={sport.id}
                        type="button"
                        onClick={() => onChange(sport.id)}
                        className={cn(
                            "flex flex-col items-center rounded-xl transition-all duration-200 shrink-0 border-2",
                            sizeClasses[size],
                            isSelected
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-105"
                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                        )}
                    >
                        <Icon className={iconSizes[size]} />
                        <span className={cn("font-semibold whitespace-nowrap", textSizes[size])}>
                            {sport.name}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

interface DisciplinePillsProps {
    disciplines: { id: string; name: string }[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function DisciplinePills({
    disciplines,
    value,
    onChange,
    className
}: DisciplinePillsProps) {
    if (!disciplines.length) return null

    return (
        <div className={cn("flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300", className)}>
            {disciplines.map((discipline) => {
                const isSelected = value === discipline.id
                return (
                    <button
                        key={discipline.id}
                        type="button"
                        onClick={() => onChange(discipline.id)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isSelected
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        {discipline.name}
                    </button>
                )
            })}
        </div>
    )
}
