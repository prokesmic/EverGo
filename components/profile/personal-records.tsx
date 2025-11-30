import { PersonalRecord, Discipline, Sport } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

type PersonalRecordWithRelations = PersonalRecord & {
    discipline: Discipline & {
        sport: Sport
    }
}

interface PersonalRecordsProps {
    records: PersonalRecordWithRelations[]
}

export function PersonalRecords({ records }: PersonalRecordsProps) {
    if (records.length === 0) {
        return null
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-ranking-gold" />
                    Personal Records
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {records.map((record) => (
                        <div key={record.id} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                            <div>
                                <p className="font-medium text-sm">{record.discipline.name}</p>
                                <p className="text-xs text-muted-foreground">{record.recordType}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">
                                    {record.value} {record.unit}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(record.achievedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
