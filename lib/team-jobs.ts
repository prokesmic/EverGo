import { prisma } from "@/lib/db"

/**
 * Updates aggregated stats for a specific team based on its members' stats.
 * Should be run periodically or after significant activity updates.
 */
export async function updateTeamStats(teamId: string) {
    try {
        const members = await prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: {
                    include: { stats: true }
                }
            }
        })

        // Calculate aggregates
        const totalDistance = members.reduce((sum: number, m: any) => sum + (m.user.stats?.totalDistance || 0), 0)
        const totalActivities = members.reduce((sum: number, m: any) => sum + (m.user.stats?.totalActivities || 0), 0)
        const avgSportIndex = members.length > 0
            ? members.reduce((sum: number, m: any) => sum + (m.user.stats?.sportIndex || 0), 0) / members.length
            : 0

        await prisma.team.update({
            where: { id: teamId },
            data: {
                memberCount: members.length,
                totalDistance,
                totalActivities,
                avgSportIndex
            }
        })

        console.log(`Updated stats for team ${teamId}`)
    } catch (error) {
        console.error(`Error updating stats for team ${teamId}:`, error)
    }
}

/**
 * Recalculates global rankings for all teams based on Average Sport Index.
 */
export async function calculateTeamRankings() {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { avgSportIndex: "desc" }
        })

        for (let i = 0; i < teams.length; i++) {
            await prisma.team.update({
                where: { id: teams[i].id },
                data: { globalRank: i + 1 }
            })
        }

        console.log(`Updated rankings for ${teams.length} teams`)
    } catch (error) {
        console.error("Error calculating team rankings:", error)
    }
}

/**
 * Updates stats for all teams.
 * Warning: Heavy operation if there are many teams.
 */
export async function updateAllTeamStats() {
    try {
        const teams = await prisma.team.findMany({ select: { id: true } })
        for (const team of teams) {
            await updateTeamStats(team.id)
        }
    } catch (error) {
        console.error("Error updating all team stats:", error)
    }
}
