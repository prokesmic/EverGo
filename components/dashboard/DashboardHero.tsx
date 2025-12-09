import React from "react";
import Link from "next/link";

interface DashboardHeroProps {
  name: string;
  location: string;
  primarySport: string;
  avatarUrl?: string;
  weeklyDistanceKm: number;
  weeklyTimeMinutes: number;
  weeklyCalories: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export function DashboardHero({
  name,
  location,
  primarySport,
  avatarUrl,
  weeklyDistanceKm,
  weeklyTimeMinutes,
  weeklyCalories,
  streakDays,
  weeklyGoal,
  weeklyProgress,
}: DashboardHeroProps) {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")} h` : `0:${m.toString().padStart(2, "0")} h`;
  };

  const initials = name.substring(0, 2).toUpperCase();
  const sessionsLeft = Math.max(0, weeklyGoal - weeklyProgress);

  return (
    <section className="relative overflow-hidden rounded-3xl h-[220px] md:h-[260px] lg:h-[300px] shadow-2xl">
      {/* Background sports image + gradient overlays */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Athletes running on a track"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
        <div className="absolute inset-x-0 bottom-0 h-24 md:h-24 lg:h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      </div>

      {/* Foreground content */}
      <div className="relative h-full px-6 md:px-10 py-4 flex flex-col justify-between text-white">
        {/* Profile row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-slate-900/80 border border-white/15 flex items-center justify-center text-xl font-semibold shadow-lg overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300/80 mb-1">
                Welcome back
              </p>
              <h1 className="text-2xl md:text-[26px] font-semibold tracking-tight mb-1">
                {name}, ready for your next record run?
              </h1>
              <p className="text-xs md:text-sm text-slate-200/80">
                {location} ·{" "}
                <span className="font-medium text-emerald-300 capitalize">{primarySport}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300/80">
                Streak
              </p>
              <p className="text-lg font-semibold flex items-center justify-end gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/90 text-xs shadow-md">
                  🔥
                </span>
                {streakDays} days
              </p>
            </div>
            <Link
              href="/activity/create"
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-sm font-semibold shadow-lg transition-colors"
            >
              Log Activity
            </Link>
          </div>
        </div>

        {/* Stats strip anchored near bottom of hero */}
        <div className="mt-3 grid grid-cols-3 md:grid-cols-4 gap-3 max-w-xl text-xs md:text-sm">
          <div className="rounded-2xl bg-slate-900/70 border border-white/10 px-3 py-2 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              This week
            </p>
            <p className="mt-1 text-lg font-semibold">{weeklyDistanceKm.toFixed(1)} km</p>
            <p className="text-[11px] text-slate-300/80">Distance</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/10 px-3 py-2 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Time
            </p>
            <p className="mt-1 text-lg font-semibold">{formatTime(weeklyTimeMinutes)}</p>
            <p className="text-[11px] text-slate-300/80">Logged</p>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/10 px-3 py-2 backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Calories
            </p>
            <p className="mt-1 text-lg font-semibold">{weeklyCalories.toLocaleString()} kcal</p>
            <p className="text-[11px] text-slate-300/80">Burned</p>
          </div>
          <div className="hidden md:block rounded-2xl bg-emerald-500/90 px-3 py-2 text-slate-950 font-semibold text-sm shadow-lg">
            <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-950/80">
              Goal
            </p>
            <p className="mt-1">{sessionsLeft} of {weeklyGoal} sessions left</p>
          </div>
        </div>
      </div>
    </section>
  );
}
