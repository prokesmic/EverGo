"use client"

import { Trophy, Activity, Users } from "lucide-react"
import Link from "next/link"

export function AuroraHero() {
  return (
    <section className="hero-gradient">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
        {/* LEFT */}
        <div className="space-y-8">
          <p className="eg-chip">
            <span className="eg-live-dot" />
            The global network for sports
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950">
            Your sport.
            <br />
            Your tribe.
            <br />
            <span className="text-gradient">
              Your rankings.
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-xl">
            EverGo unites all your sports in one place. Track every session,
            climb real-time global leaderboards, and find rivals who push you
            further.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <Link
              href="/register"
              className="eg-btn-primary"
            >
              Get Started Free
            </Link>
            <Link
              href="/#features"
              className="eg-btn-secondary"
            >
              See Features
            </Link>
          </div>

          <div className="eg-info-strip pt-2">
            <div>
              <div className="font-semibold text-slate-900">
                50K+ athletes
              </div>
              <div className="text-slate-500">training with EverGo</div>
            </div>
            <div className="divider" />
            <div>
              <div className="font-semibold text-slate-900 eg-number">
                4.9 ★
              </div>
              <div className="text-slate-500">12K+ verified reviews</div>
            </div>
          </div>
        </div>

        {/* RIGHT – demo card */}
        <div className="relative">
          <div className="absolute -top-6 -right-4 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 shadow-sm border border-emerald-200">
            Live rankings
          </div>
          <div className="eg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="eg-widget-title">
                  Sport Index
                </p>
                <p className="eg-widget-value">
                  742
                </p>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  ▲ +38 this week
                </p>
              </div>
              <div className="eg-icon-box-sky">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Global rank</span>
                <span className="eg-number font-semibold text-slate-900">
                  #2,148
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>City rank (Prague)</span>
                <span className="eg-number font-semibold text-slate-900">
                  #23
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Streak</span>
                <span className="eg-number font-semibold text-emerald-600">
                  14 days
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-sky-500" />
                5 sports tracked
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-emerald-500" />
                12 active rivals
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
