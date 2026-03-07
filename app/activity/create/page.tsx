import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateActivityForm } from "@/components/activity/create-activity-form"

export const dynamic = "force-dynamic"

export default async function CreateActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/activity/create")
  }

  const sports = await prisma.sport.findMany({
    where: { isDeprecated: false },
    include: {
      disciplines: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <main className="min-h-screen bg-bg-page px-4 py-6 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Log Activity</CardTitle>
            <CardDescription>
              Add your workout manually or upload a GPX file to auto-fill key fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateActivityForm sports={sports} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
