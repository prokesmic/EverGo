"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AppContainer } from "./AppContainer"

interface PageShellProps {
  children: React.ReactNode
  className?: string
  fullBleed?: boolean
  size?: "default" | "narrow" | "wide"
  noPadding?: boolean
}

export function PageShell({
  children,
  className,
  fullBleed = false,
  size = "default",
  noPadding = false,
}: PageShellProps) {
  if (fullBleed) {
    return (
      <div data-testid="page-shell" className={cn("w-full", className)}>
        {children}
      </div>
    )
  }

  return (
    <AppContainer
      size={size}
      className={cn(!noPadding && "py-6 sm:py-8", className)}
    >
      <div data-testid="page-shell">{children}</div>
    </AppContainer>
  )
}
