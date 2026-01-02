/**
 * v4.2 Backfill Script: Personal Bests from Activities
 *
 * This script scans existing activities and creates/updates UserBenchmarkBest
 * records based on activity performance data. It uses the BackfillState model
 * for checkpointing to allow resumption after interruptions.
 *
 * Usage:
 *   npx tsx scripts/backfill-personal-bests.ts [--resume] [--batch-size=100] [--dry-run]
 */

import { PrismaClient, BackfillJobType, BackfillStatus, BenchmarkSource } from '@prisma/client';
import { meetsVerificationTier, type RankingScope } from '@/lib/scoring/strategies';

const prisma = new PrismaClient();

// =============================================================================
// CONFIGURATION
// =============================================================================

interface BackfillConfig {
  batchSize: number;
  dryRun: boolean;
  resume: boolean;
  verbose: boolean;
}

const DEFAULT_CONFIG: BackfillConfig = {
  batchSize: 100,
  dryRun: false,
  resume: false,
  verbose: true,
};

// =============================================================================
// MAIN BACKFILL LOGIC
// =============================================================================

interface BackfillCursor {
  lastUserId?: string;
  lastActivityId?: string;
  page?: number;
}

async function getOrCreateBackfillState() {
  let state = await prisma.backfillState.findUnique({
    where: { jobType: BackfillJobType.PERSONAL_BESTS },
  });

  if (!state) {
    state = await prisma.backfillState.create({
      data: {
        jobType: BackfillJobType.PERSONAL_BESTS,
        status: BackfillStatus.PENDING,
        batchSize: DEFAULT_CONFIG.batchSize,
      },
    });
  }

  return state;
}

async function updateBackfillProgress(
  processedItems: number,
  cursor: BackfillCursor,
  status?: BackfillStatus
) {
  await prisma.backfillState.update({
    where: { jobType: BackfillJobType.PERSONAL_BESTS },
    data: {
      processedItems,
      cursor: cursor as any,
      lastHeartbeat: new Date(),
      ...(status && { status }),
    },
  });
}

async function mapActivitySourceToBenchmarkSource(
  activitySource: string
): Promise<BenchmarkSource> {
  switch (activitySource) {
    case 'STRAVA':
      return BenchmarkSource.IMPORT_STRAVA;
    case 'GARMIN':
      return BenchmarkSource.IMPORT_GARMIN;
    case 'APPLE_HEALTH':
      return BenchmarkSource.IMPORT_APPLE_HEALTH;
    case 'GOOGLE_FIT':
      return BenchmarkSource.IMPORT_GOOGLE_FIT;
    case 'MANUAL':
    default:
      return BenchmarkSource.MANUAL;
  }
}

async function processUserActivities(
  userId: string,
  config: BackfillConfig
): Promise<{ processed: number; created: number; updated: number }> {
  let processed = 0;
  let created = 0;
  let updated = 0;

  // Get all disciplines that have benchmarks
  const benchmarks = await prisma.benchmarkDefinition.findMany({
    where: { isActive: true },
    include: { sport: true },
  });

  if (benchmarks.length === 0) {
    return { processed, created, updated };
  }

  // Get user's activities with relevant benchmark results
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      isHidden: false,
    },
    include: {
      benchmarkResults: {
        include: { benchmark: true },
      },
      discipline: {
        include: { sport: true },
      },
    },
    orderBy: { activityDate: 'desc' },
  });

  // Group best values by benchmark
  const bestByBenchmark = new Map<
    string,
    {
      value: number;
      achievedAt: Date;
      source: BenchmarkSource;
      activityId: string;
      benchmark: typeof benchmarks[0];
    }
  >();

  for (const activity of activities) {
    processed++;

    for (const result of activity.benchmarkResults) {
      const existingBest = bestByBenchmark.get(result.benchmarkId);
      const source = await mapActivitySourceToBenchmarkSource(activity.source);

      const isBetter =
        !existingBest ||
        (result.benchmark.higherIsBetter
          ? result.value > existingBest.value
          : result.value < existingBest.value);

      if (isBetter) {
        bestByBenchmark.set(result.benchmarkId, {
          value: result.value,
          achievedAt: activity.activityDate,
          source,
          activityId: activity.id,
          benchmark: result.benchmark as typeof benchmarks[0],
        });
      }
    }
  }

  // Upsert UserBenchmarkBest for each benchmark with data
  for (const [benchmarkId, best] of bestByBenchmark) {
    // Get discipline for this benchmark to compute eligibility
    const discipline = await prisma.discipline.findFirst({
      where: { primaryBenchmarkId: benchmarkId },
    });

    // Compute eligibility flags
    const isEligibleGlobal = discipline
      ? meetsVerificationTier(best.source, discipline.minTierGlobal)
      : true;
    const isEligibleCountry = discipline
      ? meetsVerificationTier(best.source, discipline.minTierCountry)
      : true;
    const isEligibleCity = discipline
      ? meetsVerificationTier(best.source, discipline.minTierCity)
      : true;
    const isEligibleTeam = discipline
      ? meetsVerificationTier(best.source, discipline.minTierTeam)
      : true;

    if (config.dryRun) {
      if (config.verbose) {
        console.log(
          `  [DRY RUN] Would upsert UserBenchmarkBest for user=${userId}, benchmark=${benchmarkId}, value=${best.value}`
        );
      }
      created++;
      continue;
    }

    const existing = await prisma.userBenchmarkBest.findUnique({
      where: {
        userId_benchmarkId: { userId, benchmarkId },
      },
    });

    if (existing) {
      // Only update if new value is better
      const isBetter = best.benchmark.higherIsBetter
        ? best.value > existing.value
        : best.value < existing.value;

      if (isBetter) {
        await prisma.userBenchmarkBest.update({
          where: { id: existing.id },
          data: {
            value: best.value,
            achievedAt: best.achievedAt,
            source: best.source,
            externalActivityId: best.activityId,
            isEligibleGlobal,
            isEligibleCountry,
            isEligibleCity,
            isEligibleTeam,
            isLegacy: false,
          },
        });
        updated++;
      }
    } else {
      await prisma.userBenchmarkBest.create({
        data: {
          userId,
          benchmarkId,
          value: best.value,
          achievedAt: best.achievedAt,
          source: best.source,
          externalActivityId: best.activityId,
          isEligibleGlobal,
          isEligibleCountry,
          isEligibleCity,
          isEligibleTeam,
          isLegacy: false,
        },
      });
      created++;
    }
  }

  return { processed, created, updated };
}

async function runBackfill(config: BackfillConfig) {
  console.log('Starting Personal Bests backfill...');
  console.log(`Config: batchSize=${config.batchSize}, dryRun=${config.dryRun}, resume=${config.resume}`);

  const state = await getOrCreateBackfillState();

  // Check if resuming
  let cursor: BackfillCursor = {};
  if (config.resume && state.cursor) {
    cursor = state.cursor as BackfillCursor;
    console.log(`Resuming from cursor: ${JSON.stringify(cursor)}`);
  }

  // Mark as running
  await prisma.backfillState.update({
    where: { jobType: BackfillJobType.PERSONAL_BESTS },
    data: {
      status: BackfillStatus.RUNNING,
      startedAt: state.startedAt ?? new Date(),
      lastHeartbeat: new Date(),
    },
  });

  let totalProcessed = state.processedItems || 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let page = cursor.page || 0;

  try {
    // Get total user count for progress
    const totalUsers = await prisma.user.count();
    console.log(`Total users to process: ${totalUsers}`);

    // Process users in batches
    while (true) {
      const users = await prisma.user.findMany({
        skip: page * config.batchSize,
        take: config.batchSize,
        orderBy: { id: 'asc' },
        select: { id: true, displayName: true },
        ...(cursor.lastUserId && page === 0
          ? { where: { id: { gt: cursor.lastUserId } } }
          : {}),
      });

      if (users.length === 0) {
        break;
      }

      console.log(`Processing batch ${page + 1}, users ${users.length}...`);

      for (const user of users) {
        if (config.verbose) {
          console.log(`  Processing user: ${user.displayName} (${user.id})`);
        }

        const result = await processUserActivities(user.id, config);
        totalProcessed += result.processed;
        totalCreated += result.created;
        totalUpdated += result.updated;

        // Update checkpoint
        await updateBackfillProgress(totalProcessed, {
          lastUserId: user.id,
          page,
        });
      }

      page++;
      console.log(`  Batch complete. Activities: ${totalProcessed}, Created: ${totalCreated}, Updated: ${totalUpdated}`);
    }

    // Mark as completed
    await prisma.backfillState.update({
      where: { jobType: BackfillJobType.PERSONAL_BESTS },
      data: {
        status: BackfillStatus.COMPLETED,
        completedAt: new Date(),
        processedItems: totalProcessed,
      },
    });

    console.log('\n=== Backfill Complete ===');
    console.log(`Total activities processed: ${totalProcessed}`);
    console.log(`Personal bests created: ${totalCreated}`);
    console.log(`Personal bests updated: ${totalUpdated}`);
  } catch (error) {
    console.error('Backfill error:', error);

    await prisma.backfillState.update({
      where: { jobType: BackfillJobType.PERSONAL_BESTS },
      data: {
        status: BackfillStatus.FAILED,
        lastError: error instanceof Error ? error.message : String(error),
        cursor: { lastUserId: cursor.lastUserId, page } as any,
      },
    });

    throw error;
  }
}

// =============================================================================
// CLI ENTRY POINT
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const config: BackfillConfig = { ...DEFAULT_CONFIG };

  for (const arg of args) {
    if (arg === '--resume') {
      config.resume = true;
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--quiet' || arg === '-q') {
      config.verbose = false;
    } else if (arg.startsWith('--batch-size=')) {
      config.batchSize = parseInt(arg.split('=')[1], 10);
    }
  }

  try {
    await runBackfill(config);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
