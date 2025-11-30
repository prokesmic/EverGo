import { prisma } from "@/lib/db"
import { CreateActivityForm } from "@/components/activity/create-activity-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CreateActivityPage() {
    const sports = await prisma.sport.findMany({
        include: {
            disciplines: true,
        },
        orderBy: {
            name: "asc",
        },
    })

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Log Activity</CardTitle>
                    <CardDescription>
                        Record your latest workout manually.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateActivityForm sports={sports} />
                </CardContent>
            </Card>
        </div>
    )
}
