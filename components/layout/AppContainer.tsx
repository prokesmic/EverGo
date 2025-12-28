import * as React from "react"
import { cn } from "@/lib/utils"

interface AppContainerProps {
  children: React.ReactNode
  className?: string
  size?: "default" | "narrow" | "wide"
}

const sizeClasses = {
  narrow: "max-w-[900px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1400px]",
}

export function AppContainer({
  children,
  className,
  size = "default",
}: AppContainerProps) {
  return (
    <div
      data-testid="app-container"
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}
