"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock, Flame, TrendingUp, Trophy, Zap, Calendar, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  summary: {
    totalActivities: number
    totalDistance: number
    totalTime: number
    totalCalories: number
  }
  personalRecords: {
    longestDistance: number
    longestDuration: number
    fastestPace: number
  }
  sportBreakdown: Array<{
    sport: string
    count: number
    distance: number
    time: number
  }>
  thisMonth: {
    count: number
    distance: number
    time: number
  }
  lastMonth: {
    count: number
    distance: number
    time: number
  }
  recentActivities: Array<{
    date: string
    sport: string
    distance: number
    duration: number
    pace: number
  }>
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const formatDuration = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.floor((hours % 1) * 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }

  const formatPace = (pace: number) => {
    if (pace === 0) return "N/A"
    const m = Math.floor(pace / 60)
    const s = Math.floor(pace % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // Calculate month-over-month changes
  const distanceChange =
    data.lastMonth.distance > 0
      ? ((data.thisMonth.distance - data.lastMonth.distance) / data.lastMonth.distance) * 100
      : 0
  const activitiesChange =
    data.lastMonth.count > 0
      ? ((data.thisMonth.count - data.lastMonth.count) / data.lastMonth.count) * 100
      : 0

  // Get top sport
  const topSport = data.sportBreakdown.sort((a, b) => b.count - a.count)[0]

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-primary" />
              Total Distance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-brand-primary">
              {data.summary.totalDistance.toFixed(1)}
              <span className="text-lg font-normal text-text-muted ml-1">km</span>
            </div>
            {distanceChange !== 0 && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${distanceChange > 0 ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp className={`w-4 h-4 ${distanceChange < 0 && "rotate-180"}`} />
                {Math.abs(distanceChange).toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              Total Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-purple-700">
              {data.summary.totalTime.toFixed(0)}
              <span className="text-lg font-normal text-text-muted ml-1">hrs</span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              {formatDuration(data.summary.totalTime)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-600" />
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-orange-600">
              {(data.summary.totalCalories / 1000).toFixed(1)}
              <span className="text-lg font-normal text-text-muted ml-1">k</span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              {data.summary.totalCalories.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-700">{data.summary.totalActivities}</div>
            {activitiesChange !== 0 && (
              <p className={`text-sm mt-2 flex items-center gap-1 ${activitiesChange > 0 ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp className={`w-4 h-4 ${activitiesChange < 0 && "rotate-180"}`} />
                {Math.abs(activitiesChange).toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="text-sm text-text-muted mb-2">Longest Distance</div>
              <div className="text-3xl font-black text-yellow-900">
                {data.personalRecords.longestDistance.toFixed(2)} km
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="text-sm text-text-muted mb-2">Longest Duration</div>
              <div className="text-3xl font-black text-yellow-900">
                {formatDuration(data.personalRecords.longestDuration)}
              </div>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <div className="text-sm text-text-muted mb-2">Fastest Pace</div>
              <div className="text-3xl font-black text-yellow-900">
                {formatPace(data.personalRecords.fastestPace)} /km
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Month vs Last Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-primary" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Activities</span>
              <span className="text-2xl font-bold text-text-primary">{data.thisMonth.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Distance</span>
              <span className="text-2xl font-bold text-text-primary">
                {data.thisMonth.distance.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Time</span>
              <span className="text-2xl font-bold text-text-primary">
                {formatDuration(data.thisMonth.time)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-5 h-5" />
              Last Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Activities</span>
              <span className="text-2xl font-bold text-text-primary">{data.lastMonth.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Distance</span>
              <span className="text-2xl font-bold text-text-primary">
                {data.lastMonth.distance.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Time</span>
              <span className="text-2xl font-bold text-text-primary">
                {formatDuration(data.lastMonth.time)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sport Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            Sport Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topSport && (
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-muted">Your top sport</span>
                <Badge variant="outline" className="bg-brand-primary text-white border-brand-primary">
                  #{1}
                </Badge>
              </div>
              <div className="text-3xl font-black text-brand-primary mb-1">{topSport.sport}</div>
              <div className="text-sm text-text-muted">
                {topSport.count} activities · {topSport.distance.toFixed(1)} km
              </div>
            </div>
          )}

          <div className="space-y-4">
            {data.sportBreakdown
              .sort((a, b) => b.count - a.count)
              .map((sport, index) => {
                const percentage =
                  (sport.count / data.summary.totalActivities) * 100

                return (
                  <div key={sport.sport}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-text-primary">
                          {sport.sport}
                        </span>
                        <span className="text-sm text-text-muted">
                          {sport.count} {sport.count === 1 ? "activity" : "activities"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                      <span>{sport.distance.toFixed(1)} km</span>
                      <span>·</span>
                      <span>{formatDuration(sport.time)}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Frequency Heatmap (simplified) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {data.recentActivities.slice(0, 28).map((activity, index) => {
              const hasActivity = activity.distance > 0
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer hover:scale-110 ${
                    hasActivity
                      ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-md"
                      : "bg-surface-secondary text-text-muted"
                  }`}
                  title={
                    hasActivity
                      ? `${activity.sport}: ${activity.distance.toFixed(1)}km`
                      : "Rest day"
                  }
                >
                  {hasActivity ? activity.distance.toFixed(0) : "—"}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-text-muted mt-4 text-center">
            Last 28 days · Numbers show distance in km
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
