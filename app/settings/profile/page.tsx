import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileEditForm } from "@/components/settings/ProfileEditForm"

export const dynamic = "force-dynamic"

export default async function SettingsProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  // Fetch user data and all available sports in parallel
  const [user, sports] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        city: true,
        country: true,
        primarySportId: true,
      },
    }),
    prisma.sport.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h1>
        <ProfileEditForm
          initialData={{
            displayName: user.displayName ?? "",
            username: user.username ?? "",
            bio: user.bio ?? "",
            city: user.city ?? "",
            country: user.country ?? "",
            avatarUrl: user.avatarUrl ?? "",
            coverPhotoUrl: user.coverPhotoUrl ?? "",
            primarySportId: user.primarySportId ?? "",
          }}
          sports={sports}
        />
      </div>
    </main>
  )
}
