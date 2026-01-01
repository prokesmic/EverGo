'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Globe,
  MapPin,
  Building2,
  Users,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type RankScope = 'global' | 'country' | 'city' | 'team';

export type RankCard = {
  scope: RankScope;
  rank: number | null;          // null => missing data / not eligible
  total?: number | null;        // e.g. 11
  label?: string | null;        // e.g. team name, city name
  delta?: number | null;        // rank movement (+ means moved up, - moved down)
  ctaHref?: string;             // where to send them to resolve missing data
  ctaLabel?: string;            // benefit-framed CTA text
};

export type LensOption = {
  id: string;                   // unique key
  label: string;                // e.g. "Basketball · 3v3", "Fitness Score", "Sport Index"
  sportSlug?: string | null;
  disciplineSlug?: string | null;
  kind: 'sport_index' | 'fitness_score' | 'sport_discipline';
};

export type PerformanceRibbonProps = {
  sportIndex: { value: number; delta?: number | null };
  fitnessScore?: { value: number; delta?: number | null } | null;

  lensOptions: LensOption[];
  initialLensId?: string;

  // Ranks should reflect the CURRENT lens
  ranksByLens: Record<string, RankCard[]>;

  // Link targets
  rankingsHrefBase?: string;      // default "/rankings"
  settingsLocationHref?: string;  // default "/settings/profile?focus=location"
  settingsTeamHref?: string;      // default "/teams"
};

function Trend({ delta }: { delta?: number | null }) {
  if (!delta || delta === 0) return null;
  const up = delta > 0;
  return (
    <span
      className={cn(
        'ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
        up ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
      )}
      aria-label={up ? 'Improved' : 'Declined'}
    >
      {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {Math.abs(delta)}
    </span>
  );
}

function scopeMeta(scope: RankScope) {
  switch (scope) {
    case 'global':
      return { icon: Globe, label: 'Global' };
    case 'country':
      return { icon: MapPin, label: 'Country' };
    case 'city':
      return { icon: Building2, label: 'City' };
    case 'team':
      return { icon: Users, label: 'Team' };
  }
}

function rankHref(rankingsHrefBase: string, scope: RankScope, lensId: string) {
  const params = new URLSearchParams();
  params.set('scope', scope);
  params.set('lens', lensId);
  return `${rankingsHrefBase}?${params.toString()}`;
}

function RankPill({
  lensId,
  rankingsHrefBase,
  card,
}: {
  lensId: string;
  rankingsHrefBase: string;
  card: RankCard;
}) {
  const { icon: Icon, label } = scopeMeta(card.scope);
  const href = rankHref(rankingsHrefBase, card.scope, lensId);

  const isEmpty = card.rank == null;

  return (
    <div
      className={cn(
        'group relative flex h-14 min-w-[140px] items-center justify-between rounded-xl border px-3',
        'border-white/10 bg-white/5 backdrop-blur-md',
        'hover:bg-white/10 hover:border-white/15 transition',
        'shrink-0'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/6 border border-white/10">
          <Icon className="h-4 w-4 text-white/80" />
        </div>

        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-wide text-white/60">{label}</div>

          {!isEmpty ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-white">#{card.rank}</span>
              {card.total ? <span className="text-[10px] text-white/45">/{card.total}</span> : null}
              <Trend delta={card.delta} />
            </div>
          ) : (
            <div className="text-xs font-medium text-amber-300">
              {card.ctaLabel ?? 'Unlock'}
            </div>
          )}
        </div>
      </div>

      {/* Click overlay */}
      {!isEmpty ? (
        <Link href={href} className="absolute inset-0 rounded-xl" aria-label={`Open ${label} rankings`} />
      ) : card.ctaHref ? (
        <Link href={card.ctaHref} className="absolute inset-0 rounded-xl" aria-label={`Resolve ${label} ranking`} />
      ) : null}
    </div>
  );
}

export function PerformanceRibbon({
  sportIndex,
  fitnessScore,
  lensOptions,
  initialLensId,
  ranksByLens,
  rankingsHrefBase = '/rankings',
  settingsLocationHref = '/settings/profile?focus=location',
  settingsTeamHref = '/teams',
}: PerformanceRibbonProps) {
  const defaultLens = initialLensId ?? lensOptions?.[0]?.id;
  const [lensId, setLensId] = React.useState<string>(defaultLens);

  React.useEffect(() => {
    if (!lensId && defaultLens) setLensId(defaultLens);
  }, [defaultLens, lensId]);

  const currentLens = lensOptions.find((l) => l.id === lensId);
  const cardsRaw = ranksByLens[lensId] ?? [];

  // Ensure we always render all 4 scopes, filling missing with smart CTAs.
  const byScope = new Map<RankScope, RankCard>();
  for (const c of cardsRaw) byScope.set(c.scope, c);

  const cards: RankCard[] = (['global', 'country', 'city', 'team'] as RankScope[]).map((scope) => {
    const c = byScope.get(scope);
    if (c) return c;

    // fallback smart empty states
    if (scope === 'country') {
      return {
        scope,
        rank: null,
        ctaHref: settingsLocationHref,
        ctaLabel: 'Unlock country rank',
      };
    }
    if (scope === 'city') {
      return {
        scope,
        rank: null,
        ctaHref: settingsLocationHref,
        ctaLabel: 'Find local rivals',
      };
    }
    if (scope === 'team') {
      return {
        scope,
        rank: null,
        ctaHref: settingsTeamHref,
        ctaLabel: 'Join a team',
      };
    }
    return { scope, rank: null, ctaHref: rankingsHrefBase, ctaLabel: 'See rankings' };
  });

  const indexLabel =
    currentLens?.kind === 'fitness_score'
      ? 'Fitness Score'
      : currentLens?.kind === 'sport_index'
      ? 'Sport Index'
      : 'Sport Lens';

  const leftValue =
    currentLens?.kind === 'fitness_score'
      ? (fitnessScore?.value ?? 0)
      : sportIndex.value;

  const leftDelta =
    currentLens?.kind === 'fitness_score'
      ? (fitnessScore?.delta ?? null)
      : (sportIndex.delta ?? null);

  return (
    <section className="relative -mt-6 md:-mt-8 z-10" data-testid="performance-ribbon">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div
          className={cn(
            'rounded-2xl border border-white/10 bg-neutral-950/70 backdrop-blur-xl',
            'shadow-[0_18px_60px_-30px_rgba(0,0,0,0.6)]',
            'px-3 py-3 md:px-4 md:py-3'
          )}
        >
          {/* Row 1: Index + lens selector */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Index block */}
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/6 border border-white/10">
                {currentLens?.kind === 'fitness_score' ? (
                  <Sparkles className="h-5 w-5 text-white/80" />
                ) : (
                  <Trophy className="h-5 w-5 text-white/80" />
                )}
              </div>

              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-wide text-white/60">
                  {indexLabel}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-white">{leftValue}</span>
                  {leftDelta ? (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        leftDelta > 0 ? 'text-emerald-300' : 'text-rose-300'
                      )}
                    >
                      {leftDelta > 0 ? `+${leftDelta}` : `${leftDelta}`} this week
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Lens select */}
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="hidden sm:block text-xs text-white/55">Lens</label>
              <div className="relative">
                <select
                  value={lensId}
                  onChange={(e) => setLensId(e.target.value)}
                  className={cn(
                    'h-9 rounded-xl border border-white/10 bg-white/5 px-3 pr-8 text-sm text-white',
                    'focus:outline-none focus:ring-2 focus:ring-orange-500/40',
                    'appearance-none cursor-pointer'
                  )}
                  aria-label="Select ranking lens"
                >
                  {lensOptions.map((l) => (
                    <option key={l.id} value={l.id} className="bg-neutral-900">
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              </div>

              <Link
                href={rankHref(rankingsHrefBase, 'global', lensId)}
                className="hidden sm:inline-flex h-9 items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/75 hover:text-white hover:bg-white/10 transition"
              >
                Full rankings
              </Link>
            </div>
          </div>

          {/* Row 2: Rank pills (horizontal scroll on mobile, wrap on desktop) */}
          <div className="mt-3">
            <div
              className={cn(
                'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1',
                'sm:overflow-x-visible sm:flex-wrap sm:pb-0',
                'snap-x snap-mandatory scrollbar-hide'
              )}
            >
              {cards.map((c) => (
                <div key={c.scope} className="snap-start">
                  <RankPill lensId={lensId} rankingsHrefBase={rankingsHrefBase} card={c} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile-only full rankings link */}
          <div className="mt-2 sm:hidden text-center">
            <Link
              href={rankHref(rankingsHrefBase, 'global', lensId)}
              className="inline-flex text-sm text-white/70 hover:text-white transition"
            >
              Full rankings →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PerformanceRibbon;
