import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileSettings } from "@/components/settings/profile-settings"

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
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
      birthDate: true,
      gender: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-muted mt-2">
          Update your profile information and photos
        </p>
      </div>

      <ProfileSettings user={user} />
    </div>
  )
}
