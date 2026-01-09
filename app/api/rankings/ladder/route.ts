import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/rankings/ladder
 *
 * Get live ladder data for ranking display
 * Returns entries around the current user's position
 *
 * Query params:
 * - scope: 'global' | 'country' | 'city'
 * - scopeValue: for country/city scope
 * - range: number of entries above/below user (default 3)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const scope = (searchParams.get('scope') as 'global' | 'country' | 'city') || 'global'
  const scopeValue = searchParams.get('scopeValue')
  const range = parseInt(searchParams.get('range') || '3', 10)

  try {
    // Get user with stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        stats: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause based on scope
    const whereClause: any = {}

    if (scope === 'country') {
      whereClause.country = scopeValue || user.country
    } else if (scope === 'city') {
      whereClause.city = scopeValue || user.city
    }

    // Get total count in scope
    const totalInScope = await prisma.userStats.count({
      where: whereClause,
    })

    // Get user's rank in this scope
    const userScore = user.stats?.sportIndex ?? 0
    const usersAbove = await prisma.userStats.count({
      where: {
        ...whereClause,
        sportIndex: { gt: userScore },
      },
    })

    const userRank = usersAbove + 1

    // Get entries around user's rank
    const startRank = Math.max(1, userRank - range)
    const skip = startRank - 1
    const take = range * 2 + 1

    const statsEntries = await prisma.userStats.findMany({
      where: whereClause,
      orderBy: { sportIndex: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Transform to ladder entries
    const entries = statsEntries.map((stat, index) => ({
      userId: stat.userId,
      username: stat.user.username,
      displayName: stat.user.displayName,
      avatarUrl: stat.user.avatarUrl,
      score: stat.sportIndex,
      rank: startRank + index,
      isCurrentUser: stat.userId === session.user.id,
    }))

    return NextResponse.json({
      scope,
      scopeValue: scope === 'global' ? null : (scopeValue || (scope === 'country' ? user.country : user.city)),
      userRank,
      totalInScope,
      entries,
    })
  } catch (error) {
    console.error('Error fetching ladder:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ladder' },
      { status: 500 }
    )
  }
}
