'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Globe,
  MapPin,
  Building2,
  Users,
  Lock,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type RankScope = 'global' | 'country' | 'city' | 'team';

export type RankCardData = {
  scope: RankScope;
  rank: number | null;
  total?: number | null;
  label?: string | null;
  delta?: number | null;
  percentile?: number | null;
  ctaHref?: string;
  ctaLabel?: string;
};

export type AthleteRibbonProps = {
  sportIndex: number;
  sportIndexDelta?: number | null;
  sportIndexMax?: number;
  fitnessScore?: number | null;
  rankCards: RankCardData[];
  settingsLocationHref?: string;
  settingsTeamHref?: string;
  rankingsHref?: string;
};

// =============================================================================
// HELPERS
// =============================================================================

function scopeMeta(scope: RankScope) {
  switch (scope) {
    case 'global':
      return { icon: Globe, label: 'Global', color: 'text-blue-500' };
    case 'country':
      return { icon: MapPin, label: 'Country', color: 'text-emerald-500' };
    case 'city':
      return { icon: Building2, label: 'City', color: 'text-amber-500' };
    case 'team':
      return { icon: Users, label: 'Team', color: 'text-purple-500' };
  }
}

function getPercentileBadge(rank: number, total: number) {
  const percentile = ((total - rank + 1) / total) * 100;
  if (percentile >= 99) return { label: 'Top 1%', variant: 'gold' };
  if (percentile >= 95) return { label: 'Top 5%', variant: 'silver' };
  if (percentile >= 90) return { label: 'Top 10%', variant: 'bronze' };
  if (percentile >= 75) return { label: 'Top 25%', variant: 'default' };
  return null;
}

// =============================================================================
// SPORT INDEX CARD (The Anchor)
// =============================================================================

function SportIndexCard({
  value,
  delta,
  max = 1000,
}: {
  value: number;
  delta?: number | null;
  max?: number;
}) {
  return (
    <div className="flex-shrink-0 w-[200px] h-[110px] rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden group bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Aurora Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-orange-500/10 to-purple-600/10 group-hover:from-amber-400/20 group-hover:via-orange-500/20 group-hover:to-purple-600/20 transition-all duration-500" />

      {/* Decorative ring */}
      <div className="absolute -right-6 -bottom-10 w-28 h-28 border-[8px] border-amber-500/10 rounded-full group-hover:border-amber-500/20 transition-colors" />
      <div className="absolute -right-2 -bottom-6 w-20 h-20 border-[4px] border-orange-500/10 rounded-full group-hover:border-orange-500/20 transition-colors" />

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
            Sport Index
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">
            {value}
          </span>
          <span className="text-sm font-medium text-slate-400">/{max}</span>
        </div>

        {delta && delta !== 0 && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium mt-0.5',
            delta > 0 ? 'text-emerald-600' : 'text-rose-500'
          )}>
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{delta > 0 ? '+' : ''}{delta} this week</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// RANK CARD (The Orbit)
// =============================================================================

function RankCard({
  data,
  rankingsHref,
  settingsLocationHref,
  settingsTeamHref,
}: {
  data: RankCardData;
  rankingsHref: string;
  settingsLocationHref: string;
  settingsTeamHref: string;
}) {
  const { icon: Icon, label, color } = scopeMeta(data.scope);
  const isEmpty = data.rank == null;

  const badge = !isEmpty && data.total
    ? getPercentileBadge(data.rank!, data.total)
    : null;

  // Determine link
  let href = rankingsHref;
  let ctaText = 'View';

  if (isEmpty) {
    if (data.scope === 'country' || data.scope === 'city') {
      href = data.ctaHref || settingsLocationHref;
      ctaText = data.ctaLabel || (data.scope === 'city' ? 'Find rivals' : 'Unlock');
    } else if (data.scope === 'team') {
      href = data.ctaHref || settingsTeamHref;
      ctaText = data.ctaLabel || 'Join team';
    }
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex-shrink-0 w-[160px] h-[110px] rounded-2xl p-4 flex flex-col justify-between',
        'bg-white border border-slate-100 shadow-sm',
        'hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5',
        'transition-all duration-200 group'
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className={cn('p-1.5 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors', color)}>
          <Icon className="w-4 h-4" />
        </div>
        {badge && (
          <span className={cn(
            'text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide',
            badge.variant === 'gold' && 'bg-amber-100 text-amber-700',
            badge.variant === 'silver' && 'bg-slate-100 text-slate-600',
            badge.variant === 'bronze' && 'bg-orange-100 text-orange-700',
            badge.variant === 'default' && 'bg-slate-50 text-slate-500'
          )}>
            {badge.label}
          </span>
        )}
        {isEmpty && (
          <div className="p-1 rounded-full bg-slate-100">
            <Lock className="w-3 h-3 text-slate-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </span>

        {!isEmpty ? (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-800 tabular-nums font-mono">
              #{data.rank}
            </span>
            {data.total && (
              <span className="text-xs text-slate-400">of {data.total}</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-amber-600">
            <span className="text-sm font-semibold">{ctaText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        )}

        {!isEmpty && data.delta && data.delta !== 0 && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-medium',
            data.delta > 0 ? 'text-emerald-600' : 'text-rose-500'
          )}>
            {data.delta > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            <span>{Math.abs(data.delta)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AthleteRibbon({
  sportIndex,
  sportIndexDelta,
  sportIndexMax = 1000,
  rankCards,
  settingsLocationHref = '/settings/profile?focus=location',
  settingsTeamHref = '/teams',
  rankingsHref = '/rankings',
}: AthleteRibbonProps) {
  // Ensure all 4 scopes are represented
  const scopeOrder: RankScope[] = ['global', 'country', 'city', 'team'];
  const byScope = new Map<RankScope, RankCardData>();
  for (const c of rankCards) byScope.set(c.scope, c);

  const cards: RankCardData[] = scopeOrder.map((scope) => {
    return byScope.get(scope) || { scope, rank: null };
  });

  return (
    <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto py-4 px-4">
        {/* Scrollable container */}
        <div className="flex items-stretch gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
          {/* Sport Index - The Anchor */}
          <div className="snap-start">
            <SportIndexCard
              value={sportIndex}
              delta={sportIndexDelta}
              max={sportIndexMax}
            />
          </div>

          {/* Divider */}
          <div className="w-px bg-slate-200 self-stretch my-3 flex-shrink-0" />

          {/* Rank Cards - The Orbit */}
          {cards.map((card) => (
            <div key={card.scope} className="snap-start">
              <RankCard
                data={card}
                rankingsHref={rankingsHref}
                settingsLocationHref={settingsLocationHref}
                settingsTeamHref={settingsTeamHref}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AthleteRibbon;
