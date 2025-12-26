"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface FrostedCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    padding?: "none" | "sm" | "md" | "lg"
}

export function FrostedCard({
    children,
    className,
    padding = "md",
    ...props
}: FrostedCardProps) {
    const paddingClasses = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
    }

    return (
        <div
            className={cn(
                "bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50",
                paddingClasses[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

interface FrostedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
}

export function FrostedSection({
    title,
    description,
    icon,
    children,
    className,
    ...props
}: FrostedSectionProps) {
    return (
        <div
            className={cn(
                "bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-sm",
                className
            )}
            {...props}
        >
            {(title || icon) && (
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <div>
                        {title && (
                            <h3 className="font-semibold text-slate-800">{title}</h3>
                        )}
                        {description && (
                            <p className="text-sm text-slate-500">{description}</p>
                        )}
                    </div>
                </div>
            )}
            {children}
        </div>
    )
}

interface GradientHeaderProps {
    icon?: React.ReactNode
    title: string
    description?: string
    className?: string
}

export function GradientHeader({
    icon,
    title,
    description,
    className
}: GradientHeaderProps) {
    return (
        <div className={cn("mb-8", className)}>
            <div className="flex items-center gap-3 mb-2">
                {icon && (
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                        {icon}
                    </div>
                )}
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            </div>
            {description && (
                <p className="text-slate-500 text-lg">{description}</p>
            )}
        </div>
    )
}
