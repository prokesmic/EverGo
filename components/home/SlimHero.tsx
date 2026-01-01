'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

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
  generic: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80',
};

interface SlimHeroProps {
  name: string;
  avatarUrl?: string;
  location: string;
  primarySport: string;
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
  primarySport,
  imageUrl,
  imageCategory,
  imageCredit,
}: SlimHeroProps) {
  const initials = name.substring(0, 2).toUpperCase();

  // Primary and fallback images
  const primaryImage = imageUrl ?? CATEGORY_FALLBACKS.generic;
  const fallbackImage = CATEGORY_FALLBACKS[imageCategory ?? 'generic'] ?? CATEGORY_FALLBACKS.generic;

  const [imageSrc, setImageSrc] = useState(primaryImage);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackImage);
    }
  };

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
              <div className="flex items-center gap-2 text-white/80 text-sm font-medium mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
                <span className="text-white/30">•</span>
                <span className="text-amber-400 capitalize">{primarySport}</span>
              </div>
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
