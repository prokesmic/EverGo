#!/usr/bin/env ts-node
/**
 * noMockScan.ts - Scans the codebase for mock/demo data that shouldn't be in production
 *
 * This script is meant to run as part of CI/CD to prevent hardcoded mock data
 * from making it to staging or production environments.
 *
 * Usage:
 *   npx ts-node scripts/noMockScan.ts
 *   npm run check:nomock
 */

import fs from "fs"
import path from "path"

const ROOT = process.cwd()

// Directories to scan
const SCAN_DIRS = ["app", "components", "lib"]

// Directories to skip
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  ".git",
  "e2e",
  "mike",
  "__tests__",
  "test",
  "tests",
  "scripts", // Don't scan this script itself
])

// File extensions to scan
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"])

// Patterns that indicate mock/demo data
// These should NOT appear in production code (outside of test files)
const DENY_PATTERNS = [
  // Mock/Demo data keywords
  "demoEvents",
  "demoTeams",
  "demoUsers",
  "mockFriends",
  "mockRival",
  "mockTeamA",
  "mockTeamB",
  "mockUser",
  "mockData",

  // Common fake names that indicate hardcoded demo content
  // (Only flag if they appear in component/lib files, not landing pages)
  // Note: These are checked more carefully to avoid false positives

  // Hardcoded sample content markers
  "Prague Marathon", // If hardcoded in component
  "Team Training", // If hardcoded in component
  "Sunday Ride", // If hardcoded in component
]

// Patterns that are allowed in certain contexts
const ALLOWED_CONTEXTS: Record<string, string[]> = {
  // Landing page mockups are allowed
  "landing/": ["mockup", "Mockup", "ProfileMockup", "ActivityMockup", "RankingMockup", "CommunityMockup"],
  // Seed files can have demo data when gated
  "seed": ["seedUser", "seedCompetitors", "demo@evergo.app"],
}

interface ScanResult {
  file: string
  line: number
  pattern: string
  context: string
}

function shouldSkipFile(filePath: string): boolean {
  // Check if file is in an allowed context for all patterns
  for (const [pathMatch] of Object.entries(ALLOWED_CONTEXTS)) {
    if (filePath.includes(pathMatch)) {
      return false // Still scan, but with context awareness
    }
  }
  return false
}

function isPatternAllowedInFile(pattern: string, filePath: string): boolean {
  for (const [pathMatch, allowedPatterns] of Object.entries(ALLOWED_CONTEXTS)) {
    if (filePath.includes(pathMatch) && allowedPatterns.includes(pattern)) {
      return true
    }
  }
  return false
}

function walk(dir: string, files: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dir)

    for (const entry of entries) {
      const fullPath = path.join(dir, entry)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (SKIP_DIRS.has(entry)) continue
        walk(fullPath, files)
      } else {
        const ext = path.extname(entry)
        if (EXTENSIONS.has(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }

  return files
}

function scanFile(filePath: string): ScanResult[] {
  const results: ScanResult[] = []
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  const relativePath = path.relative(ROOT, filePath)

  for (const pattern of DENY_PATTERNS) {
    // Skip if this pattern is allowed in this file's context
    if (isPatternAllowedInFile(pattern, relativePath)) {
      continue
    }

    lines.forEach((line, index) => {
      if (line.includes(pattern)) {
        // Check if it's in a comment (basic check)
        const trimmed = line.trim()
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
          return // Skip comments
        }

        results.push({
          file: relativePath,
          line: index + 1,
          pattern,
          context: line.trim().substring(0, 80),
        })
      }
    })
  }

  return results
}

function main() {
  console.log("Scanning for mock/demo data patterns...\n")

  const allFiles: string[] = []

  for (const dir of SCAN_DIRS) {
    const fullDir = path.join(ROOT, dir)
    if (fs.existsSync(fullDir)) {
      walk(fullDir, allFiles)
    }
  }

  console.log(`Scanning ${allFiles.length} files...\n`)

  const allResults: ScanResult[] = []

  for (const file of allFiles) {
    const results = scanFile(file)
    allResults.push(...results)
  }

  if (allResults.length === 0) {
    console.log("No mock/demo data patterns found!")
    process.exit(0)
  }

  console.log(`Found ${allResults.length} potential mock/demo data pattern(s):\n`)

  // Group by file
  const byFile = new Map<string, ScanResult[]>()
  for (const result of allResults) {
    if (!byFile.has(result.file)) {
      byFile.set(result.file, [])
    }
    byFile.get(result.file)!.push(result)
  }

  for (const [file, results] of byFile) {
    console.log(`\n${file}:`)
    for (const result of results) {
      console.log(`  Line ${result.line}: "${result.pattern}"`)
      console.log(`    ${result.context}`)
    }
  }

  console.log("\n---")
  console.log("If these are false positives, consider:")
  console.log("1. Renaming the variable/constant to something more specific")
  console.log("2. Adding the file path to ALLOWED_CONTEXTS in this script")
  console.log("3. Moving the mock data to a gated section (if ALLOW_DEMO_DATA && IS_LOCAL)")
  console.log("---\n")

  // Exit with error code for CI
  process.exit(1)
}

main()
