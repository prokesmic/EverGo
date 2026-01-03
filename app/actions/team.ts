'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for team creation
const CreateTeamSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(60, "Name must be less than 60 characters"),
  sportId: z.string().min(1, "Sport is required"),
  city: z.string().max(60).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
})

export type CreateTeamInput = z.infer<typeof CreateTeamSchema>

export type CreateTeamResult =
  | { ok: true; teamSlug: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

export async function createTeam(input: unknown): Promise<CreateTeamResult> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in to create a team." }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    return { ok: false, message: "User not found." }
  }

  // Validate input
  const parsed = CreateTeamSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path?.[0] ?? "form")
      fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Please fix the form errors.", fieldErrors }
  }

  const { name, sportId, city, country, description, isPublic } = parsed.data

  try {
    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const team = await prisma.team.create({
      data: {
        name,
        slug,
        description: description || null,
        sportId,
        city: city || null,
        country: country || null,
        isPublic,
        memberCount: 1,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      select: { slug: true },
    })

    revalidatePath("/teams")
    revalidatePath("/home")

    return { ok: true, teamSlug: team.slug }
  } catch (e: unknown) {
    console.error("[createTeam] Failed:", e)

    // Handle unique constraint violation
    if (typeof e === "object" && e !== null && "code" in e && e.code === "P2002") {
      return { ok: false, message: "A team with this name already exists. Try another name." }
    }

    return { ok: false, message: "Failed to create team. Please try again." }
  }
}

export async function joinTeam(teamId: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return { success: false, error: "User not found" }
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId: user.id
            }
        }
    })

    if (existingMember) {
        return { success: false, error: "Already a member" }
    }

    try {
        await prisma.teamMember.create({
            data: {
                teamId,
                userId: user.id,
                role: "MEMBER",
                joinedAt: new Date()
            }
        })

        revalidatePath("/teams")
        revalidatePath("/home")
        revalidatePath(`/profile/${user.username}`)

        return { success: true }
    } catch (error) {
        console.error("Error joining team:", error)
        return { success: false, error: "Failed to join team" }
    }
}
