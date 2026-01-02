'use client';

import { cn } from '@/lib/utils';
import {
  Scale,
  Mountain,
  Map,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Edit3,
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// TYPES (matching Prisma enums)
// =============================================================================

export type FairnessBadge = 'STANDARD' | 'NORMALIZED' | 'SEGMENT' | 'RATING';
export type VerificationBadge = 'VERIFIED' | 'MIXED' | 'MANUAL';

// =============================================================================
// FAIRNESS BADGE
// =============================================================================

const FAIRNESS_CONFIG: Record<
  FairnessBadge,
  {
    icon: LucideIcon;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  STANDARD: {
    icon: Scale,
    label: 'Standard',
    description: 'Comparable benchmark - everyone does the same thing',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  NORMALIZED: {
    icon: Mountain,
    label: 'Normalized',
    description: 'Conditions vary - we normalize for fair comparison',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  SEGMENT: {
    icon: Map,
    label: 'Segment',
    description: 'Comparable only on same segment or course',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  RATING: {
    icon: Trophy,
    label: 'Rating',
    description: 'Based on match results and ELO rating',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export function FairnessBadgeChip({
  badge,
  size = 'sm',
  showLabel = true,
}: {
  badge: FairnessBadge;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}) {
  const config = FAIRNESS_CONFIG[badge];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'h-4 px-1.5 text-[9px] gap-0.5',
    sm: 'h-5 px-2 text-[10px] gap-1',
    md: 'h-6 px-2.5 text-xs gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      title={config.description}
      className={cn(
        'inline-flex items-center rounded-full font-medium cursor-help',
        sizeClasses[size],
        config.bgColor,
        config.color
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// =============================================================================
// VERIFICATION BADGE
// =============================================================================

const VERIFICATION_CONFIG: Record<
  VerificationBadge,
  {
    icon: LucideIcon;
    label: string;
    description: string;
    color: string;
    bgColor: string;
  }
> = {
  VERIFIED: {
    icon: CheckCircle2,
    label: 'Verified',
    description: 'Only sensor or imported entries appear in leaderboards',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  MIXED: {
    icon: AlertCircle,
    label: 'Mixed',
    description: 'Verified entries recommended - manual entries may be limited',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  MANUAL: {
    icon: Edit3,
    label: 'Manual',
    description: 'Personal tracking only - no global leaderboards',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
  },
};

export function VerificationBadgeChip({
  badge,
  size = 'sm',
  showLabel = true,
}: {
  badge: VerificationBadge;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
}) {
  const config = VERIFICATION_CONFIG[badge];
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'h-4 px-1.5 text-[9px] gap-0.5',
    sm: 'h-5 px-2 text-[10px] gap-1',
    md: 'h-6 px-2.5 text-xs gap-1.5',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <span
      title={config.description}
      className={cn(
        'inline-flex items-center rounded-full font-medium cursor-help',
        sizeClasses[size],
        config.bgColor,
        config.color
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

// =============================================================================
// COMBINED BADGE ROW
// =============================================================================

export function RankingBadges({
  fairness,
  verification,
  size = 'sm',
  showLabels = true,
  className,
}: {
  fairness: FairnessBadge;
  verification: VerificationBadge;
  size?: 'xs' | 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <FairnessBadgeChip badge={fairness} size={size} showLabel={showLabels} />
      <VerificationBadgeChip
        badge={verification}
        size={size}
        showLabel={showLabels}
      />
    </div>
  );
}

// =============================================================================
// USER ENTRY VERIFICATION INDICATOR
// =============================================================================

export function EntryVerificationIndicator({
  isVerified,
  source,
  size = 'sm',
}: {
  isVerified: boolean;
  source?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const sourceLabel = source
    ? source.replace('IMPORT_', '').replace('_', ' ')
    : 'Manual';

  const title = isVerified ? `Verified via ${sourceLabel}` : 'Manual entry';

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center cursor-help',
        isVerified ? 'text-emerald-600' : 'text-slate-400'
      )}
    >
      {isVerified ? (
        <CheckCircle2 className={iconSizes[size]} />
      ) : (
        <Edit3 className={iconSizes[size]} />
      )}
    </span>
  );
}

export default RankingBadges;
