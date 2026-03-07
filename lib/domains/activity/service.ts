import { prisma } from "@/lib/db"
import type { Prisma } from "@prisma/client"
import { calculatePower } from "@/lib/power"
import { parseGpsRoute } from "@/lib/activity/route"
import { buildRouteMetadata } from "@/lib/geo/geospatial"
import { buildDomainEvent, enqueueDomainEventTx } from "@/lib/events/publisher"

export interface CreateActivityInput {
  userId: string
  sportId: string
  disciplineId?: string | null
  title: string
  description?: string | null
  activityDate: Date
  durationSeconds?: number | null
  distanceMeters?: number | null
  elevationGain?: number | null
  caloriesBurned?: number | null
  avgHeartRate?: number | null
  visibility: "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE"
  photos?: string[]
  gpsRoute?: string | null
  startLocation?: string | null
  rpe?: number | null
  createPost?: boolean
}

export interface CreateActivityOutput {
  activityId: string
  postId: string | null
  power: number
}

export async function createActivityDomain(
  input: CreateActivityInput
): Promise<CreateActivityOutput> {
  const routePoints = parseGpsRoute(input.gpsRoute)
  const routeMetadata = buildRouteMetadata(routePoints)

  const resolvedDisciplineId = await resolveDisciplineId(input.sportId, input.disciplineId)
  if (!resolvedDisciplineId) {
    throw new Error("No discipline found for sport")
  }

  const safeDuration = input.durationSeconds ?? 0
  const safeRpe = input.rpe ?? 5
  const { power } = calculatePower(safeDuration, safeRpe, false)

  const event = buildDomainEvent({
    name: "activity.created",
    aggregateId: "pending",
    aggregateType: "activity",
    userId: input.userId,
    payload: {},
  })

  const result = await prisma.$transaction(async (tx) => {
    const activity = await tx.activity.create({
      data: {
        userId: input.userId,
        sportId: input.sportId,
        disciplineId: resolvedDisciplineId,
        title: input.title,
        description: input.description ?? null,
        activityDate: input.activityDate,
        durationSeconds: input.durationSeconds ?? null,
        distanceMeters: input.distanceMeters ?? null,
        elevationGain: input.elevationGain ?? null,
        caloriesBurned: input.caloriesBurned ?? null,
        avgHeartRate: input.avgHeartRate ?? null,
        visibility: input.visibility,
        primaryValue: input.distanceMeters || input.durationSeconds || 0,
        photos: JSON.stringify(input.photos ?? []),
        gpsRoute: input.gpsRoute ?? null,
        startLocation: input.startLocation ?? null,
        source: "MANUAL",
        power: power || null,
        powerPoints: Math.round(power),
        raw: routeMetadata.pointCount > 0
          ? ({
              routeMetadata,
            } as unknown as Prisma.InputJsonValue)
          : undefined,
      },
      select: {
        id: true,
      },
    })

    let postId: string | null = null
    if (input.createPost !== false) {
      const post = await tx.post.create({
        data: {
          userId: input.userId,
          postType: "ACTIVITY",
          activityId: activity.id,
          content: input.description ?? null,
          photos: JSON.stringify(input.photos ?? []),
          visibility: input.visibility,
        },
        select: { id: true },
      })
      postId = post.id
    }

    const domainEvent = {
      ...event,
      aggregateId: activity.id,
      payload: {
        activityId: activity.id,
        userId: input.userId,
        visibility: input.visibility,
        power,
      },
    }

    await enqueueDomainEventTx(tx, domainEvent)

    return { activityId: activity.id, postId }
  })

  return {
    activityId: result.activityId,
    postId: result.postId,
    power,
  }
}

async function resolveDisciplineId(
  sportId: string,
  disciplineId?: string | null
): Promise<string | null> {
  if (disciplineId) {
    const validDiscipline = await prisma.discipline.findFirst({
      where: { id: disciplineId, sportId },
      select: { id: true },
    })
    if (validDiscipline) return validDiscipline.id
  }

  const fallbackDiscipline = await prisma.discipline.findFirst({
    where: { sportId, isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true },
  })

  return fallbackDiscipline?.id ?? null
}
