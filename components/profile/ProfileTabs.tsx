"use client"

/**
 * V6 Profile Tabs Component
 *
 * Tab navigation for profile sections
 */

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Activity, Swords } from "lucide-react"

interface ProfileTabsProps {
  defaultTab?: "activities" | "rivalries"
  activitiesContent: React.ReactNode
  rivalriesContent: React.ReactNode
  rivalryCount: number
}

export function ProfileTabs({
  defaultTab = "activities",
  activitiesContent,
  rivalriesContent,
  rivalryCount,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"activities" | "rivalries">(defaultTab)

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("activities")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "activities"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Activity className="w-4 h-4" />
          Activities
        </button>
        <button
          onClick={() => setActiveTab("rivalries")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "rivalries"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <Swords className="w-4 h-4" />
          Rivalries
          {rivalryCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-violet-100 text-violet-700">
              {rivalryCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "activities" && activitiesContent}
        {activeTab === "rivalries" && rivalriesContent}
      </div>
    </div>
  )
}
