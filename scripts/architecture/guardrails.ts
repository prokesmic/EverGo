import { existsSync, readFileSync } from "fs"
import { join } from "path"

const root = process.cwd()

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8")
}

function run() {
  assert(existsSync(join(root, "proxy.ts")), "Expected proxy.ts to exist")
  assert(!existsSync(join(root, "middleware.ts")), "middleware.ts should be removed in Next.js 16+")

  const jobsQueue = read("lib/jobs/queue.ts")
  assert(
    jobsQueue.includes("PROCESS_DOMAIN_EVENT"),
    "Job queue must support PROCESS_DOMAIN_EVENT for outbox processing"
  )

  const searchRoute = read("app/api/search/route.ts")
  assert(
    searchRoute.includes('from "@/lib/domains/search/service"'),
    "Search route should use domain search service abstraction"
  )

  const feedRoute = read("app/api/feed/route.ts")
  assert(
    feedRoute.includes('from "@/lib/domains/feed/read-model"'),
    "Feed route should use read-model projection layer"
  )

  const activitiesRoute = read("app/api/activities/route.ts")
  assert(
    activitiesRoute.includes('from "@/lib/domains/activity/service"'),
    "Activities route should use activity domain service"
  )

  console.log("Architecture guardrails passed.")
}

run()
