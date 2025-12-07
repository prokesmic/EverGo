"use client"

import { useState, useRef, useCallback, ReactNode } from "react"
import { Loader2, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
  disabled?: boolean
}

const PULL_THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return

    const container = containerRef.current
    if (!container || container.scrollTop > 0) return

    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }, [disabled, isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return

    const container = containerRef.current
    if (!container || container.scrollTop > 0) {
      setPullDistance(0)
      return
    }

    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4
      const distance = Math.min(diff * resistance, MAX_PULL)
      setPullDistance(distance)

      // Prevent default scroll behavior when pulling down
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }, [isPulling, disabled, isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(PULL_THRESHOLD)

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled])

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const rotation = progress * 180

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          "pointer-events-none"
        )}
        style={{
          height: pullDistance,
          top: 0,
        }}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-all",
            isRefreshing && "animate-pulse"
          )}
          style={{
            transform: `scale(${0.5 + progress * 0.5})`,
            opacity: progress,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
          ) : (
            <ArrowDown
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                pullDistance >= PULL_THRESHOLD ? "text-brand-blue" : "text-text-muted"
              )}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  )
}
