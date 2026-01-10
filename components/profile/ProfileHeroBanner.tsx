// components/profile/ProfileHeroBanner.tsx
import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProfileHeroBannerProps = {
  isOwnProfile: boolean
  onEditHref?: string

  // Data
  displayName: string
  handleOrEmail: string
  locationLabel?: string | null
  joinedLabel?: string | null
  bio?: string | null
  primarySportLabel?: string | null

  avatarUrl?: string | null
  bannerUrl?: string | null

  counts: {
    activities: number
    followers: number
    following: number
  }
}

// Using a guaranteed-to-work Unsplash image as default
// This URL is already allowlisted in next.config.ts
const DEFAULT_BANNER = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80"

export function ProfileHeroBanner(props: ProfileHeroBannerProps) {
  const {
    isOwnProfile,
    onEditHref = "/settings/profile",
    displayName,
    handleOrEmail,
    locationLabel,
    joinedLabel,
    bio,
    primarySportLabel,
    avatarUrl,
    bannerUrl,
    counts,
  } = props

  // ALWAYS use a real image, never a gradient fallback
  const heroSrc = bannerUrl && bannerUrl.trim().length > 0 ? bannerUrl : DEFAULT_BANNER

  return (
    <section
      data-testid="profile-hero"
      className="relative w-full overflow-hidden rounded-2xl"
    >
      {/* HERO HEIGHT MUST MATCH SCREENSHOT #1 */}
      <div className="relative h-[280px] w-full">
        {/* Background image - ALWAYS shows a photo */}
        <Image
          data-testid="profile-hero-image"
          src={heroSrc}
          alt="Profile banner"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Dark gradient overlay for readability - left to right fade */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

        {/* Edit Profile button in hero (top-right) */}
        {isOwnProfile && (
          <div className="absolute right-4 top-4 z-20">
            <Link href={onEditHref}>
              <Button
                data-testid="profile-edit-btn"
                type="button"
                variant="secondary"
                className="bg-white/20 text-white border border-white/25 hover:bg-white/30 backdrop-blur"
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Left overlay panel - dark glassmorphism card */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div
            className={cn(
              "ml-4 md:ml-6 w-[calc(100%-2rem)] max-w-[380px] rounded-2xl border border-white/15 bg-black/35",
              "backdrop-blur-md px-5 py-5 text-white"
            )}
          >
            {/* Avatar + Info Row */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-lg">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-orange-500 text-xl md:text-2xl font-bold">
                    {displayName?.slice(0, 2)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Name + Meta */}
              <div className="min-w-0 flex-1">
                <div className="text-xl md:text-2xl font-semibold leading-tight truncate">
                  {displayName}
                </div>
                <div className="truncate text-sm text-white/80">{handleOrEmail}</div>

                {/* Location & Joined */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/80">
                  {locationLabel && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {locationLabel}
                    </span>
                  )}
                  {joinedLabel && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {joinedLabel}
                    </span>
                  )}
                </div>

                {/* Bio */}
                {bio && (
                  <div className="mt-2 text-sm text-white/90 line-clamp-2">{bio}</div>
                )}

                {/* Primary Sport Chip */}
                {primarySportLabel && (
                  <div className="mt-3 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-medium">
                    <span className="mr-1">🏆</span> {primarySportLabel}
                  </div>
                )}
              </div>
            </div>

            {/* Counts row INSIDE hero, like screenshot #1 */}
            <div className="mt-4 pt-4 border-t border-white/15 flex items-end justify-between">
              <Count label="ACTIVITIES" value={counts.activities} />
              <Count label="FOLLOWERS" value={counts.followers} />
              <Count label="FOLLOWING" value={counts.following} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] tracking-wide text-white/70">{label}</div>
    </div>
  )
}
