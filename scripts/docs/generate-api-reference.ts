#!/usr/bin/env tsx
/**
 * Generate API Reference
 *
 * Scans /app/api directory and generates a Markdown table of endpoints.
 * Detects HTTP methods from route.ts exports.
 *
 * Usage: npx tsx scripts/docs/generate-api-reference.ts
 */

import * as fs from "fs"
import * as path from "path"

const ROOT = path.resolve(__dirname, "../..")
const API_DIR = path.join(ROOT, "app/api")

interface RouteInfo {
  path: string
  methods: string[]
  category: string
}

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

function findRouteFiles(dir: string, basePath = ""): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) return files

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...findRouteFiles(entryPath, `${basePath}/${entry.name}`))
    } else if (entry.name === "route.ts") {
      files.push(entryPath)
    }
  }

  return files
}

function extractMethods(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8")
  const methods: string[] = []

  for (const method of HTTP_METHODS) {
    // Match export async function GET/POST/etc
    const pattern = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\b`)
    if (pattern.test(content)) {
      methods.push(method)
    }
  }

  return methods
}

function routePathFromFile(filePath: string): string {
  const relative = path.relative(API_DIR, filePath)
  const routePath = "/" + relative.replace(/\/route\.ts$/, "").replace(/\\/g, "/")
  return "/api" + routePath
}

function extractCategory(routePath: string): string {
  const parts = routePath.split("/").filter(Boolean)
  // /api/auth/... -> auth
  // /api/cron/... -> cron
  return parts[1] ?? "other"
}

function main() {
  const routeFiles = findRouteFiles(API_DIR)
  const routes: RouteInfo[] = []

  for (const file of routeFiles) {
    const routePath = routePathFromFile(file)
    const methods = extractMethods(file)
    const category = extractCategory(routePath)

    routes.push({ path: routePath, methods, category })
  }

  // Sort by path
  routes.sort((a, b) => a.path.localeCompare(b.path))

  // Group by category
  const byCategory = new Map<string, RouteInfo[]>()
  for (const route of routes) {
    const existing = byCategory.get(route.category) ?? []
    existing.push(route)
    byCategory.set(route.category, existing)
  }

  console.log("<!-- AUTO:API_ROUTES_START -->")
  console.log("")
  console.log(`**Total API Routes: ${routes.length}**`)
  console.log("")

  for (const [category, categoryRoutes] of byCategory) {
    console.log(`### ${category}`)
    console.log("")
    console.log("| Endpoint | Methods |")
    console.log("|----------|---------|")

    for (const route of categoryRoutes) {
      const methodStr = route.methods.join(", ") || "?"
      console.log(`| \`${route.path}\` | ${methodStr} |`)
    }

    console.log("")
  }

  console.log("<!-- AUTO:API_ROUTES_END -->")
}

main()
