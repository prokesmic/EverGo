"use client"

import { ReactNode } from "react"

interface PageSubheaderProps {
    title: string
    subtitle?: string
    actions?: ReactNode
    filters?: ReactNode
}

export function PageSubheader({ title, subtitle, actions, filters }: PageSubheaderProps) {
    return (
        <div className="page-subheader">
            <div className="page-toolbar">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-muted-foreground">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {filters && (
                        <div className="filter-bar mt-3">
                            {filters}
                        </div>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}
