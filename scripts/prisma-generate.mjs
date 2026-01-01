import { spawnSync } from "node:child_process";

// Prisma generate does NOT connect to DB, it only needs a syntactically valid URL.
// This prevents CI/local installs from failing when DATABASE_URL isn't present.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db?schema=public";
}

const res = spawnSync("npx", ["prisma", "generate"], { stdio: "inherit", shell: true });
process.exit(res.status ?? 0);
