import { Skeleton } from '@/components/ui/skeleton'

/**
 * V6 Hero Banner Skeleton
 *
 * Loading placeholder for the hero banner
 */
export function HeroBannerSkeleton() {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Cover skeleton */}
      <Skeleton className="h-48 md:h-56 w-full" />

      {/* Content overlay skeleton */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-end gap-4">
            <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
            <div className="pb-1 space-y-2">
              <Skeleton className="h-6 w-32 bg-white/20" />
              <Skeleton className="h-4 w-24 bg-white/20" />
            </div>
          </div>
          <Skeleton className="w-28 h-20 rounded-xl bg-white/20" />
        </div>

        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
          <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
          <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-5 w-24 bg-white/20" />
          <Skeleton className="h-5 w-24 bg-white/20" />
          <Skeleton className="h-5 w-32 bg-white/20" />
        </div>
      </div>
    </div>
  )
}
