import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Pre-built skeleton components for common patterns
function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border-light p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

function ProfileHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-t-xl" />
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-16">
          <Skeleton className="h-32 w-32 rounded-xl border-4 border-white" />
          <div className="flex-1 space-y-2 mt-16">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton, ActivityCardSkeleton, LeaderboardSkeleton, ProfileHeaderSkeleton }
