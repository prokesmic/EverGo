"use client"

import { Swords, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_RIVALRIES } from "./demoRankingsData"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RivalriesWidgetCompact() {
  const rivalries = DEMO_RIVALRIES

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Swords className="h-4 w-4 text-orange-600" />
          </div>
          <span className="font-semibold text-gray-900">Active Rivalries</span>
        </div>
        <Link
          href="/rivalries"
          className="flex items-center text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          View all
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Link>
      </div>

      {/* Rivalries List */}
      <div className="divide-y divide-gray-100">
        {rivalries.map((rivalry) => (
          <div
            key={rivalry.id}
            className="px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Opponent Avatar */}
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-xs font-medium">
                  {rivalry.opponentName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    vs {rivalry.opponentName}
                  </p>
                  {rivalry.winning ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      <TrendingUp className="h-2.5 w-2.5" />
                      Ahead
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      <TrendingDown className="h-2.5 w-2.5" />
                      Behind
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {rivalry.sport} &middot; {rivalry.discipline}
                </p>
              </div>

              {/* Values Comparison */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={cn(
                      "font-semibold",
                      rivalry.winning ? "text-green-600" : "text-gray-600"
                    )}
                  >
                    {rivalry.yourValue}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span
                    className={cn(
                      "font-semibold",
                      !rivalry.winning ? "text-red-500" : "text-gray-600"
                    )}
                  >
                    {rivalry.theirValue}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">{rivalry.lastActivity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 border-t border-gray-100">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Swords className="h-4 w-4" />
          Start a Rivalry
        </Link>
      </div>
    </div>
  )
}
