"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Sparkles, Users } from "lucide-react"

interface HomeFeedTabsProps {
  highlightsContent: ReactNode
  followingContent: ReactNode
  className?: string
}

type TabId = "highlights" | "following"

const tabs: { id: TabId; label: string; icon: typeof Sparkles }[] = [
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "following", label: "Following", icon: Users },
]

export function HomeFeedTabs({
  highlightsContent,
  followingContent,
  className,
}: HomeFeedTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("highlights")

  return (
    <div className={cn("", className)} data-testid="home-feed-tabs">
      {/* Tab Buttons */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
              data-testid={`feed-tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "highlights" && highlightsContent}
        {activeTab === "following" && followingContent}
      </div>
    </div>
  )
}
