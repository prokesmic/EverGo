"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface FilterOption {
    id: string
    label: string
    icon?: React.ReactNode
}

interface FilterChipsProps {
    options: FilterOption[]
    value: string | string[]
    onChange: (value: string | string[]) => void
    multiple?: boolean
    allowClear?: boolean
    className?: string
    size?: "sm" | "md"
}

export function FilterChips({
    options,
    value,
    onChange,
    multiple = false,
    allowClear = true,
    className,
    size = "md"
}: FilterChipsProps) {
    const selectedValues = Array.isArray(value) ? value : [value].filter(Boolean)

    const handleClick = (optionId: string) => {
        if (multiple) {
            const newValues = selectedValues.includes(optionId)
                ? selectedValues.filter(v => v !== optionId)
                : [...selectedValues, optionId]
            onChange(newValues)
        } else {
            onChange(optionId === value ? "" : optionId)
        }
    }

    const handleClear = () => {
        onChange(multiple ? [] : "")
    }

    const hasSelection = selectedValues.length > 0

    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2"
    }

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {options.map((option) => {
                const isSelected = selectedValues.includes(option.id)
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleClick(option.id)}
                        className={cn(
                            "flex items-center rounded-full font-medium transition-all",
                            sizeClasses[size],
                            isSelected
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                )
            })}

            {allowClear && hasSelection && (
                <button
                    type="button"
                    onClick={handleClear}
                    className={cn(
                        "flex items-center rounded-full font-medium transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                        sizeClasses[size]
                    )}
                >
                    <X className="w-3 h-3" />
                    Clear
                </button>
            )}
        </div>
    )
}

interface ToggleChipsProps {
    options: { id: string; label: string; description?: string; icon?: React.ReactNode }[]
    value: string
    onChange: (value: string) => void
    className?: string
}

export function ToggleChips({
    options,
    value,
    onChange,
    className
}: ToggleChipsProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {options.map((option) => {
                const isSelected = value === option.id
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                            isSelected
                                ? "bg-indigo-50 border-2 border-indigo-500"
                                : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                        )}
                    >
                        {option.icon && (
                            <div className={cn(
                                "shrink-0",
                                isSelected ? "text-indigo-600" : "text-slate-400"
                            )}>
                                {option.icon}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className={cn(
                                "font-medium",
                                isSelected ? "text-indigo-900" : "text-slate-700"
                            )}>
                                {option.label}
                            </div>
                            {option.description && (
                                <div className="text-xs text-slate-500 truncate">
                                    {option.description}
                                </div>
                            )}
                        </div>
                        {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
