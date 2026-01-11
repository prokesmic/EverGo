#!/usr/bin/env tsx
/**
 * Generate Routes Inventory
 *
 * Scans /app directory for page.tsx files and generates route inventory.
 * Outputs both JSON (for verification) and Markdown (for docs).
 *
 * Usage: npx tsx scripts/docs/generate-routes.ts
 */

import * as fs from "fs"
import * as path from "path"

const ROOT = path.resolve(__dirname, "../..")
const APP_DIR = path.join(ROOT, "app")
const OUTPUT_DIR = path.join(ROOT, "docs/generated")

interface RouteInfo {
  path: string
  hasLayout: boolean
  hasLoading: boolean
  hasError: boolean
  isDynamic: boolean
  isApi: boolean
  category: string
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

function findPageFiles(dir: string, basePath = ""): RouteInfo[] {
  const routes: RouteInfo[] = []

  if (!fs.existsSync(dir)) return routes

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)
    const routePath = `${basePath}/${entry.name}`

    if (entry.isDirectory()) {
      // Skip api routes (handled by generate-api-reference)
      if (entry.name === "api") continue

      // Check if this directory has a page.tsx
      const hasPage = fs.existsSync(path.join(entryPath, "page.tsx"))
      const hasLayout = fs.existsSync(path.join(entryPath, "layout.tsx"))
      const hasLoading = fs.existsSync(path.join(entryPath, "loading.tsx"))
      const hasError = fs.existsSync(path.join(entryPath, "error.tsx"))
      const isDynamic = entry.name.startsWith("[") && entry.name.endsWith("]")

      if (hasPage) {
        // Convert [param] to :param for readability
        const cleanPath = routePath
          .replace(/\[([^\]]+)\]/g, ":$1")
          .replace(/^\//, "/")

        routes.push({
          path: cleanPath || "/",
          hasLayout,
          hasLoading,
          hasError,
          isDynamic,
          isApi: false,
          category: extractCategory(cleanPath),
        })
      }

      // Recurse into subdirectories
      routes.push(...findPageFiles(entryPath, routePath))
    }
  }

  return routes
}

function extractCategory(routePath: string): string {
  const parts = routePath.split("/").filter(Boolean)
  if (parts.length === 0) return "core"

  const first = parts[0].replace(/^:/, "")

  const categoryMap: Record<string, string> = {
    home: "core",
    profile: "social",
    activity: "activities",
    calendar: "activities",
    challenges: "gamification",
    gauntlets: "competition",
    gauntlet: "competition",
    seasons: "competition",
    season: "competition",
    rivalries: "competition",
    rankings: "rankings",
    leaderboard: "rankings",
    teams: "teams",
    team: "teams",
    notifications: "social",
    settings: "settings",
    feed: "social",
    training: "training",
    onboarding: "onboarding",
    login: "auth",
    register: "auth",
    offline: "core",
    analytics: "insights",
    u: "social",
    athlete: "social",
  }

  return categoryMap[first] ?? "other"
}

function generateJson(routes: RouteInfo[]): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalRoutes: routes.length,
      routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    },
    null,
    2
  )
}

function generateMarkdown(routes: RouteInfo[]): string {
  const sorted = routes.sort((a, b) => a.path.localeCompare(b.path))

  // Group by category
  const byCategory = new Map<string, RouteInfo[]>()
  for (const route of sorted) {
    const existing = byCategory.get(route.category) ?? []
    existing.push(route)
    byCategory.set(route.category, existing)
  }

  let md = `# App Routes\n\n`
  md += `> Auto-generated on ${new Date().toISOString()}\n\n`
  md += `**Total Pages: ${routes.length}**\n\n`

  const categoryOrder = [
    "core",
    "auth",
    "onboarding",
    "activities",
    "competition",
    "rankings",
    "social",
    "teams",
    "gamification",
    "training",
    "settings",
    "insights",
    "other",
  ]

  for (const category of categoryOrder) {
    const categoryRoutes = byCategory.get(category)
    if (!categoryRoutes || categoryRoutes.length === 0) continue

    md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`
    md += `| Route | Dynamic | Layout | Loading | Error |\n`
    md += `|-------|---------|--------|---------|-------|\n`

    for (const route of categoryRoutes) {
      const dynamic = route.isDynamic ? "Yes" : "-"
      const layout = route.hasLayout ? "Yes" : "-"
      const loading = route.hasLoading ? "Yes" : "-"
      const error = route.hasError ? "Yes" : "-"
      md += `| \`${route.path}\` | ${dynamic} | ${layout} | ${loading} | ${error} |\n`
    }

    md += "\n"
  }

  return md
}

function main() {
  ensureOutputDir()

  // Check if app directory has a root page
  const hasRootPage = fs.existsSync(path.join(APP_DIR, "page.tsx"))
  const routes: RouteInfo[] = []

  if (hasRootPage) {
    routes.push({
      path: "/",
      hasLayout: fs.existsSync(path.join(APP_DIR, "layout.tsx")),
      hasLoading: fs.existsSync(path.join(APP_DIR, "loading.tsx")),
      hasError: fs.existsSync(path.join(APP_DIR, "error.tsx")),
      isDynamic: false,
      isApi: false,
      category: "core",
    })
  }

  routes.push(...findPageFiles(APP_DIR))

  // Write JSON
  const jsonPath = path.join(OUTPUT_DIR, "routes.json")
  fs.writeFileSync(jsonPath, generateJson(routes))
  console.log(`Written: ${jsonPath}`)

  // Write Markdown
  const mdPath = path.join(OUTPUT_DIR, "routes.md")
  fs.writeFileSync(mdPath, generateMarkdown(routes))
  console.log(`Written: ${mdPath}`)

  // Output for AUTO block injection
  console.log("\n<!-- AUTO:ROUTES_START -->")
  console.log("")
  console.log(`**Total App Routes: ${routes.length}**`)
  console.log("")
  console.log("| Route | Category | Dynamic |")
  console.log("|-------|----------|---------|")

  for (const route of routes.sort((a, b) => a.path.localeCompare(b.path))) {
    console.log(`| \`${route.path}\` | ${route.category} | ${route.isDynamic ? "Yes" : "-"} |`)
  }

  console.log("")
  console.log("<!-- AUTO:ROUTES_END -->")
}

main()
