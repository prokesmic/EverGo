"use client"

/**
 * BentoCard - Premium glassmorphism card component
 *
 * Part of Project Aurora UI Overhaul
 * Variants: glass, solid, gradient
 */

import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"
import { forwardRef } from "react"

export type BentoVariant = "glass" | "solid" | "gradient"

export interface BentoCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: BentoVariant
  /** Gradient classes (e.g., "from-blue-600 to-blue-800") - only used with variant="gradient" */
  gradient?: string
  /** Disable hover animation */
  noHover?: boolean
  /** Glass blur intensity */
  blur?: "sm" | "md" | "lg" | "xl"
}

const variantStyles: Record<BentoVariant, string> = {
  glass: "bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-white/10",
  solid: "bg-card border border-border",
  gradient: "border-0",
}

const blurStyles = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
}

export const BentoCard = forwardRef<HTMLDivElement, BentoCardProps>(
  (
    {
      children,
      className,
      variant = "glass",
      gradient,
      noHover = false,
      blur = "md",
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "rounded-2xl p-4 md:p-5 shadow-xl overflow-hidden relative",
      variant === "glass" && blurStyles[blur],
      variant === "gradient" && `bg-gradient-to-br ${gradient}`,
      variantStyles[variant]
    )

    return (
      <motion.div
        ref={ref}
        className={cn(baseStyles, className)}
        whileHover={noHover ? undefined : { scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

BentoCard.displayName = "BentoCard"

/**
 * BentoGrid - Layout container for Bento cards
 */
export interface BentoGridProps {
  children: React.ReactNode
  className?: string
  /** Number of columns on desktop (default: 4) */
  cols?: 2 | 3 | 4 | 5
}

const colStyles = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
}

export function BentoGrid({ children, className, cols = 4 }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        colStyles[cols],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * BentoLabel - Uppercase tracking label for metrics
 */
export function BentoLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * BentoValue - Large mono value display
 */
export function BentoValue({
  children,
  className,
  size = "lg",
}: {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const sizeStyles = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
  }

  return (
    <div
      className={cn(
        "font-mono font-bold tracking-tight",
        sizeStyles[size],
        className
      )}
    >
      {children}
    </div>
  )
}
