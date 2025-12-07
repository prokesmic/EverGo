import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ChallengeCreationForm } from "@/components/challenges/challenge-creation-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CreateChallengePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-text-primary mb-2">
            Create a Challenge
          </h1>
          <p className="text-text-muted text-lg">
            Challenge your friends and community to reach new goals
          </p>
        </div>

        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle>Challenge Details</CardTitle>
            <CardDescription>
              Set up a challenge for distance, duration, or activity count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChallengeCreationForm sports={sports} userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
