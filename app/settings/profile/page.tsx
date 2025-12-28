import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProfileSettings } from "@/components/settings/profile-settings"

export const dynamic = 'force-dynamic'

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
      dateOfBirth: true,
      gender: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">
          Update your profile information and photos
        </p>
      </div>

      <div className="p-6">
        <ProfileSettings user={user} />
      </div>
    </div>
  )
}
