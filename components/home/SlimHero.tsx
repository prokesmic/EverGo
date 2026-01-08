'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useMemo } from 'react';

// 5 stunning default hero images for new users (randomly selected)
const DEFAULT_HERO_IMAGES = [
  // Epic mountain trail runner at golden hour
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80',
  // Swimmer in crystal blue water - dynamic action shot
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80',
  // Cyclist silhouette against dramatic sunset sky
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80',
  // Runner on misty mountain trail - atmospheric
  'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1920&q=80',
  // Athlete stretching at sunrise - inspirational
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1920&q=80',
];

// Category-specific fallback images
const CATEGORY_FALLBACKS: Record<string, string> = {
  endurance: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80',
  strength: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
  water: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80',
  winter: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80',
  team: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80',
  racket: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80',
  combat: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80',
  outdoor: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80',
  mindbody: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80',
};

// Get a random default hero image
function getRandomDefaultHero(): string {
  const index = Math.floor(Math.random() * DEFAULT_HERO_IMAGES.length);
  return DEFAULT_HERO_IMAGES[index];
}

// Sport type for non-primary sports
export interface HeroSport {
  name: string;
  icon: string;
}

interface SlimHeroProps {
  name: string;
  avatarUrl?: string;
  /** @deprecated Use city + country instead */
  location?: string;
  city?: string;
  country?: string;
  primarySport: string;
  /** Non-primary active sports to display as icon pills */
  otherSports?: HeroSport[];
  imageUrl?: string;
  imageCategory?: string;
  imageCredit?: {
    name: string;
    url?: string;
  };
}

export function SlimHero({
  name,
  avatarUrl,
  location,
  city,
  country,
  primarySport,
  otherSports,
  imageUrl,
  imageCategory,
  imageCredit,
}: SlimHeroProps) {
  const initials = name.substring(0, 2).toUpperCase();

  // Get a random default hero image (memoized to stay consistent during session)
  const randomDefaultHero = useMemo(() => getRandomDefaultHero(), []);

  // Primary and fallback images
  const primaryImage = imageUrl ?? randomDefaultHero;
  const fallbackImage = imageCategory
    ? (CATEGORY_FALLBACKS[imageCategory] ?? randomDefaultHero)
    : randomDefaultHero;

  const [imageSrc, setImageSrc] = useState(primaryImage);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackImage);
    }
  };

  // Build location display: "City, Country" or fallback to legacy location
  const locationDisplay = useMemo(() => {
    if (city && country) {
      return { city, country };
    }
    if (city) {
      return { city, country: null };
    }
    if (country) {
      return { city: null, country };
    }
    // Fallback to legacy location prop
    if (location) {
      return { city: location, country: null };
    }
    return { city: null, country: null };
  }, [city, country, location]);

  // Filter out empty sports and limit to 4 for display
  const displayOtherSports = useMemo(() => {
    if (!otherSports) return [];
    return otherSports.filter(s => s.name && s.icon).slice(0, 4);
  }, [otherSports]);

  return (
    <div className="w-full">
      {/* Hero Banner with Identity Inside (Cinema Effect) */}
      <div className="relative h-[240px] sm:h-[260px] md:h-[280px] w-full group overflow-hidden">
        {/* Background Image with subtle hover zoom */}
        <Image
          src={imageSrc}
          alt={`${primarySport} background`}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ objectPosition: '50% 30%' }}
          onError={handleImageError}
        />

        {/* The Gradient Scrim - Crucial for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Identity Block - Inside the banner */}
        <div className="absolute bottom-5 md:bottom-6 left-0 w-full px-4 md:px-6">
          <div className="max-w-6xl mx-auto flex items-end gap-4 md:gap-5">
            {/* Avatar with gradient glow ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full blur-sm opacity-75" />
              <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-white/20 relative z-10 shadow-2xl">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl md:text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Text - White, legible, compact */}
            <div className="mb-1 min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-md truncate">
                {name}
              </h1>

              {/* Location: City, Country */}
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium mt-1 flex-wrap">
                {(locationDisplay.city || locationDisplay.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {locationDisplay.city}
                      {locationDisplay.city && locationDisplay.country && ', '}
                      {locationDisplay.country}
                    </span>
                  </span>
                )}
                {(locationDisplay.city || locationDisplay.country) && <span className="text-white/30">•</span>}
                <span className="text-amber-400 capitalize font-semibold">{primarySport}</span>
              </div>

              {/* Other Sports - Beautiful icon pills */}
              {displayOtherSports.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-white/40 text-xs mr-1">Also:</span>
                  <div className="flex items-center gap-1">
                    {displayOtherSports.map((sport, index) => (
                      <div
                        key={sport.name}
                        className="group/sport relative flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:border-white/20 transition-all duration-200"
                        title={sport.name}
                      >
                        <span className="text-sm">{sport.icon}</span>
                        <span className="text-xs text-white/70 group-hover/sport:text-white/90 transition-colors hidden sm:inline capitalize">
                          {sport.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo credit - subtle, top right */}
        {imageCredit?.name && (
          <div className="absolute top-3 right-4 text-[9px] text-white/30">
            Photo:{' '}
            {imageCredit.url ? (
              <a
                href={imageCredit.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white/50 transition-colors"
              >
                {imageCredit.name}
              </a>
            ) : (
              imageCredit.name
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SlimHero;
