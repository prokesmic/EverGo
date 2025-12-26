"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

type ColorVariant = "emerald" | "blue" | "orange" | "purple" | "pink" | "cyan" | "amber" | "slate"

const colorVariants: Record<ColorVariant, { bg: string; icon: string; label: string }> = {
    emerald: {
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
        icon: "text-emerald-600",
        label: "text-emerald-700"
    },
    blue: {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
        icon: "text-blue-600",
        label: "text-blue-700"
    },
    orange: {
        bg: "bg-gradient-to-br from-orange-50 to-red-50 border-orange-100",
        icon: "text-orange-600",
        label: "text-orange-700"
    },
    purple: {
        bg: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100",
        icon: "text-purple-600",
        label: "text-purple-700"
    },
    pink: {
        bg: "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100",
        icon: "text-pink-600",
        label: "text-pink-700"
    },
    cyan: {
        bg: "bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-100",
        icon: "text-cyan-600",
        label: "text-cyan-700"
    },
    amber: {
        bg: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100",
        icon: "text-amber-600",
        label: "text-amber-700"
    },
    slate: {
        bg: "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200",
        icon: "text-slate-600",
        label: "text-slate-700"
    }
}

interface BigStatProps {
    icon: LucideIcon
    label: string
    value: string | number
    unit?: string
    color?: ColorVariant
    trend?: { value: number; label?: string }
    size?: "sm" | "md" | "lg"
    className?: string
    children?: React.ReactNode
}

export function BigStat({
    icon: Icon,
    label,
    value,
    unit,
    color = "slate",
    trend,
    size = "md",
    className,
    children
}: BigStatProps) {
    const colors = colorVariants[color]

    const sizeClasses = {
        sm: { container: "p-4", value: "text-2xl", icon: "w-4 h-4", label: "text-xs" },
        md: { container: "p-5", value: "text-3xl", icon: "w-4 h-4", label: "text-xs" },
        lg: { container: "p-6", value: "text-4xl", icon: "w-5 h-5", label: "text-sm" }
    }

    const sizes = sizeClasses[size]

    return (
        <div className={cn(
            "rounded-2xl border",
            colors.bg,
            sizes.container,
            className
        )}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={cn(sizes.icon, colors.icon)} />
                    <span className={cn("font-medium uppercase tracking-wide", sizes.label, colors.label)}>
                        {label}
                    </span>
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        trend.value >= 0 ? "text-emerald-600" : "text-red-500"
                    )}>
                        {trend.value >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
                    </div>
                )}
            </div>

            {children ? (
                children
            ) : (
                <div className="flex items-baseline gap-1">
                    <span className={cn("font-bold text-slate-900", sizes.value)}>
                        {value}
                    </span>
                    {unit && (
                        <span className="text-lg font-medium text-slate-400">
                            {unit}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

interface BigStatInputProps {
    icon: LucideIcon
    label: string
    value: string
    onChange: (value: string) => void
    unit?: string
    placeholder?: string
    color?: ColorVariant
    type?: "text" | "number"
    step?: string
    className?: string
}

export function BigStatInput({
    icon: Icon,
    label,
    value,
    onChange,
    unit,
    placeholder = "0",
    color = "slate",
    type = "number",
    step,
    className
}: BigStatInputProps) {
    const colors = colorVariants[color]

    return (
        <div className={cn("rounded-2xl border p-5", colors.bg, className)}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", colors.icon)} />
                <span className={cn("text-xs font-medium uppercase tracking-wide", colors.label)}>
                    {label}
                </span>
            </div>
            <div className="flex items-baseline gap-1">
                <input
                    type={type}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="text-3xl font-bold w-full h-auto p-0 border-0 bg-transparent text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0"
                />
                {unit && (
                    <span className="text-lg font-medium text-slate-400 shrink-0">
                        {unit}
                    </span>
                )}
            </div>
        </div>
    )
}
