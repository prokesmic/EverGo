/**
 * Jobs Module
 *
 * Background job queue system for EverGo.
 * Uses Prisma-based queue (can upgrade to Redis later).
 */

export {
  // Types
  type JobType,
  type JobPayload,
  type EnqueueOptions,
  type JobResult,
  // Enqueue functions
  enqueueJob,
  enqueueJobs,
  // Processing
  processJobs,
  // Utilities
  getQueueStatus,
  retryJob,
  cancelJob,
} from "./queue"
