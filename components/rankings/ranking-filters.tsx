"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Sport } from "@prisma/client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface RankingFiltersProps {
    sports: Sport[]
}

export function RankingFilters({ sports }: RankingFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSportId = searchParams.get("sportId") || "all"
    const currentPeriod = searchParams.get("period") || "weekly"

    const handleSportChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value === "all") {
            params.delete("sportId")
        } else {
            params.set("sportId", value)
        }
        router.push(`/rankings?${params.toString()}`)
    }

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("period", value)
        router.push(`/rankings?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-[200px]">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">Sport</Label>
                <Select value={currentSportId} onValueChange={handleSportChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Sport" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {sports.map((sport) => (
                            <SelectItem key={sport.id} value={sport.id}>
                                {sport.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full sm:w-[200px]">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">Period</Label>
                <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weekly">This Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="yearly">This Year</SelectItem>
                        <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
