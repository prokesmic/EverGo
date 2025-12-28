import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  right?: React.ReactNode
  className?: string
  backLink?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  right,
  className,
  backLink,
}: PageHeaderProps) {
  return (
    <div data-testid="page-header" className={cn("mb-6", className)}>
      {backLink && <div className="mb-4">{backLink}</div>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {right && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {right}
          </div>
        )}
      </div>
    </div>
  )
}
