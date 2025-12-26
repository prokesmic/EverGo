"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Zap } from "lucide-react"

const rpeLabels: Record<number, { label: string; color: string }> = {
    1: { label: "Very Light", color: "from-green-400 to-green-500" },
    2: { label: "Light", color: "from-green-400 to-green-500" },
    3: { label: "Moderate", color: "from-lime-400 to-lime-500" },
    4: { label: "Moderate", color: "from-lime-400 to-lime-500" },
    5: { label: "Somewhat Hard", color: "from-yellow-400 to-yellow-500" },
    6: { label: "Somewhat Hard", color: "from-yellow-400 to-yellow-500" },
    7: { label: "Hard", color: "from-orange-400 to-orange-500" },
    8: { label: "Very Hard", color: "from-orange-400 to-red-500" },
    9: { label: "Max Effort", color: "from-red-500 to-red-600" },
    10: { label: "All Out!", color: "from-red-600 to-rose-700" },
}

interface RpeSliderProps {
    value: number
    onChange: (value: number) => void
    showLabel?: boolean
    className?: string
}

export function RpeSlider({
    value,
    onChange,
    showLabel = true,
    className
}: RpeSliderProps) {
    const rpeInfo = rpeLabels[value] || rpeLabels[5]

    return (
        <div className={cn("bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-slate-800">Effort Level (RPE)</span>
                </div>
                {showLabel && (
                    <div className={cn(
                        "px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r",
                        rpeInfo.color
                    )}>
                        {value} - {rpeInfo.label}
                    </div>
                )}
            </div>

            <div className="relative pt-2 pb-6">
                <div className="relative h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-slate-300 transition-all pointer-events-none"
                        style={{ left: `calc(${((value - 1) / 9) * 100}% - 12px)` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <span key={n}>{n}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

interface IntensitySliderProps {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    label?: string
    unit?: string
    className?: string
}

export function IntensitySlider({
    value,
    onChange,
    min = 1,
    max = 10,
    label = "Intensity",
    unit,
    className
}: IntensitySliderProps) {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-bold text-slate-900">
                    {value}{unit}
                </span>
            </div>
            <div className="relative h-2 rounded-full bg-slate-200">
                <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${percentage}%` }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    )
}
