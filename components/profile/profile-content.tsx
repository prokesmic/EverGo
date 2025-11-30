"use client"

import { useState } from "react"
import { User, Sport, Activity, Discipline, PersonalRecord } from "@prisma/client"
import { SportTabs } from "./sport-tabs"
import { ActivityFeed } from "./activity-feed"
import { PersonalRecords } from "./personal-records"

type ProfileData = User & {
    sports: { sport: Sport }[]
    activities: (Activity & {
        user: User
        discipline: Discipline & {
            sport: Sport
        }
    })[]
    personalRecords: (PersonalRecord & {
        discipline: Discipline & {
            sport: Sport
        }
    })[]
}

interface ProfileContentProps {
    profile: ProfileData
}

export function ProfileContent({ profile }: ProfileContentProps) {
    const [selectedSportId, setSelectedSportId] = useState<string | null>(null)

    // Extract unique sports from user activities or explicit user sports
    // For now, let's use all available sports from activities + userSports
    const sports = Array.from(
        new Map(
            [
                ...profile.sports.map((s) => s.sport),
                ...profile.activities.map((a) => a.discipline.sport),
            ].map((s) => [s.id, s])
        ).values()
    )

    const filteredActivities = selectedSportId
        ? profile.activities.filter((a) => a.discipline.sportId === selectedSportId)
        : profile.activities

    const filteredRecords = selectedSportId
        ? profile.personalRecords.filter((r) => r.discipline.sportId === selectedSportId)
        : profile.personalRecords

    return (
        <>
            <SportTabs
                sports={sports}
                selectedSportId={selectedSportId}
                onSelectSport={setSelectedSportId}
            />

            <div className="container max-w-4xl py-6 px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Feed */}
                    <div className="md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">Activities</h2>
                        <ActivityFeed activities={filteredActivities} />
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <PersonalRecords records={filteredRecords} />

                        {/* Additional stats widgets can go here */}
                    </div>
                </div>
            </div>
        </>
    )
}
