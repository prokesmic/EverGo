/**
 * ProfileBody - Athlete-Centric Profile Content
 *
 * Who you are: Activity history, personal records, teams, rivalries.
 * This is the main content area for the profile page (below the hero).
 */

import { type ComponentProps } from "react"
import { ActivityFeedV2 } from "@/components/profile/ActivityFeedV2"
import { ProfileSideRail } from "@/components/profile/ProfileSideRail"
import { ProfileTabs } from "@/components/profile/ProfileTabs"
import { ProfileRivalries } from "@/components/profile/ProfileRivalries"

// Extract types from child components for type safety
type ActivityFeedProps = ComponentProps<typeof ActivityFeedV2>
type ProfileSideRailProps = ComponentProps<typeof ProfileSideRail>
type ProfileRivalriesProps = ComponentProps<typeof ProfileRivalries>

export type ProfileBodyProps = {
  userId: string
  username: string | null
  isCurrentUser: boolean

  // Activity data - use actual component prop types
  activities: ActivityFeedProps["activities"]

  // Athlete stats - use actual component prop types
  personalRecords: ProfileSideRailProps["personalRecords"]
  teams: ProfileSideRailProps["teams"]
  rivalries: ProfileRivalriesProps["rivalries"]
}

export function ProfileBody({
  userId,
  username,
  isCurrentUser,
  activities,
  personalRecords,
  teams,
  rivalries,
}: ProfileBodyProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Main Column: Activity Feed with Tabs (8 cols) */}
        <div className="lg:col-span-8">
          <ProfileTabs
            defaultTab="activities"
            rivalryCount={rivalries.length}
            activitiesContent={
              <ActivityFeedV2 activities={activities} showUserOnCards={false} />
            }
            rivalriesContent={
              <ProfileRivalries
                rivalries={rivalries}
                isCurrentUser={isCurrentUser}
                userId={userId}
              />
            }
          />
        </div>

        {/* Sidebar (4 cols) - Athlete Identity */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <ProfileSideRail
              personalRecords={personalRecords}
              teams={teams}
              userId={userId}
              username={username}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
