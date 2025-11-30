"use client"

import { useEffect, useState } from "react"
import { Trophy, Timer, Medal, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

interface PersonalRecord {
    id: string
    recordType: string
    value: number
    unit: string
    achievedAt: string
    discipline: {
        name: string
        sport: {
            name: string
        }
    }
}

interface PersonalRecordsListProps {
    userId: string
}

export function PersonalRecordsList({ userId }: PersonalRecordsListProps) {
    const [records, setRecords] = useState<PersonalRecord[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/records`)
                if (res.ok) {
                    const data = await res.json()
                    setRecords(data)
                }
            } catch (error) {
                console.error("Failed to fetch records", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchRecords()
    }, [userId])

    if (isLoading) {
        return <div className="h-24 animate-pulse bg-gray-100 rounded-lg"></div>
    }

    if (records.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Personal Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">No personal records yet.</p>
                </CardContent>
            </Card>
        )
    }

    const formatValue = (value: number, unit: string) => {
        if (unit === "s") {
            const h = Math.floor(value / 3600)
            const m = Math.floor((value % 3600) / 60)
            const s = Math.round(value % 60)
            if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            return `${m}:${s.toString().padStart(2, '0')}`
        }
        return `${value} ${unit}`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Personal Records
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {records.map((record) => (
                        <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <Medal className="h-5 w-5 text-brand-blue" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {record.recordType.replace(/_/g, ' ')}
                                </div>
                                <div className="text-lg font-bold text-brand-blue">
                                    {formatValue(record.value, record.unit)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {format(new Date(record.achievedAt), 'MMM d, yyyy')} • {record.discipline.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
