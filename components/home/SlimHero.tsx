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
    <div className="relative w-full">
      {/* Zone A: The Vibe - Slim Hero Image (220px) */}
      <div className="h-[180px] sm:h-[200px] md:h-[220px] w-full relative overflow-hidden">
        <Image
          src={imageSrc}
          alt={`${primarySport} background`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: '50% 30%' }}
          onError={handleImageError}
        />
        {/* Gradient overlay - bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Photo credit */}
        {imageCredit?.name && (
          <div className="absolute bottom-2 right-4 text-[9px] text-white/40">
            Photo:{' '}
            {imageCredit.url ? (
              <a
                href={imageCredit.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                {imageCredit.name}
              </a>
            ) : (
              imageCredit.name
            )}
          </div>
        )}
      </div>

      {/* Zone B: The Bridge - Avatar & Identity */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 relative -mt-16 mb-6">
        <div className="flex items-end gap-4 md:gap-6">
          {/* Avatar - Large with ring */}
          <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-white shadow-2xl ring-4 ring-white/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl md:text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Identity text */}
          <div className="pb-2 md:pb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg tracking-tight">
              {name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/80 drop-shadow-md mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {location}
              </span>
              <span className="text-white/50">•</span>
              <span className="font-medium text-amber-300 capitalize">{primarySport}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlimHero;
