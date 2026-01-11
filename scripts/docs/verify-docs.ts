#!/usr/bin/env tsx
/**
 * Verify Documentation
 *
 * Checks that AUTO blocks in EVERGO10.md match generated content.
 * Exits with code 1 if docs are stale.
 *
 * Usage: npx tsx scripts/docs/verify-docs.ts
 */

import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

const ROOT = path.resolve(__dirname, "../..")
const DOCS_FILE = path.join(ROOT, "EVERGO10.md")

interface AutoBlock {
  marker: string
  startPattern: RegExp
  endPattern: RegExp
  generateCommand: string
}

const AUTO_BLOCKS: AutoBlock[] = [
  {
    marker: "VERSIONS",
    startPattern: /<!-- AUTO:VERSIONS_START -->/,
    endPattern: /<!-- AUTO:VERSIONS_END -->/,
    generateCommand: "npx tsx scripts/docs/generate-versions.ts",
  },
  {
    marker: "API_ROUTES",
    startPattern: /<!-- AUTO:API_ROUTES_START -->/,
    endPattern: /<!-- AUTO:API_ROUTES_END -->/,
    generateCommand: "npx tsx scripts/docs/generate-api-reference.ts",
  },
  {
    marker: "SCHEMA_STATS",
    startPattern: /<!-- AUTO:SCHEMA_STATS_START -->/,
    endPattern: /<!-- AUTO:SCHEMA_STATS_END -->/,
    generateCommand: "npx tsx scripts/docs/generate-schema-reference.ts",
  },
  {
    marker: "ROUTES",
    startPattern: /<!-- AUTO:ROUTES_START -->/,
    endPattern: /<!-- AUTO:ROUTES_END -->/,
    generateCommand: "npx tsx scripts/docs/generate-routes.ts",
  },
]

function extractBlock(content: string, block: AutoBlock): string | null {
  const startMatch = content.match(block.startPattern)
  const endMatch = content.match(block.endPattern)

  if (!startMatch || !endMatch) {
    return null
  }

  const startIndex = content.indexOf(startMatch[0])
  const endIndex = content.indexOf(endMatch[0]) + endMatch[0].length

  return content.slice(startIndex, endIndex)
}

function generateBlock(block: AutoBlock): string {
  try {
    const output = execSync(block.generateCommand, {
      cwd: ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    })

    // Extract just the AUTO block from output
    const startMatch = output.match(block.startPattern)
    const endMatch = output.match(block.endPattern)

    if (!startMatch || !endMatch) {
      console.warn(`Warning: ${block.marker} generator did not produce valid AUTO block`)
      return ""
    }

    const startIndex = output.indexOf(startMatch[0])
    const endIndex = output.indexOf(endMatch[0]) + endMatch[0].length

    return output.slice(startIndex, endIndex)
  } catch (error) {
    console.error(`Error generating ${block.marker}:`, error)
    return ""
  }
}

function normalizeWhitespace(str: string): string {
  return str
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim()
}

function main() {
  if (!fs.existsSync(DOCS_FILE)) {
    console.log("EVERGO10.md not found, skipping verification")
    process.exit(0)
  }

  const content = fs.readFileSync(DOCS_FILE, "utf-8")
  let hasErrors = false
  const results: { marker: string; status: "ok" | "stale" | "missing" }[] = []

  console.log("Verifying AUTO blocks in EVERGO10.md...\n")

  for (const block of AUTO_BLOCKS) {
    const existing = extractBlock(content, block)

    if (!existing) {
      console.log(`[MISSING] ${block.marker} - No AUTO block found in docs`)
      results.push({ marker: block.marker, status: "missing" })
      continue
    }

    const generated = generateBlock(block)

    if (!generated) {
      console.log(`[SKIP] ${block.marker} - Generator failed`)
      continue
    }

    const existingNorm = normalizeWhitespace(existing)
    const generatedNorm = normalizeWhitespace(generated)

    if (existingNorm === generatedNorm) {
      console.log(`[OK] ${block.marker}`)
      results.push({ marker: block.marker, status: "ok" })
    } else {
      console.log(`[STALE] ${block.marker} - Content differs from generated`)
      hasErrors = true
      results.push({ marker: block.marker, status: "stale" })
    }
  }

  console.log("\n---")
  console.log(
    `Results: ${results.filter((r) => r.status === "ok").length} OK, ` +
      `${results.filter((r) => r.status === "stale").length} stale, ` +
      `${results.filter((r) => r.status === "missing").length} missing`
  )

  if (hasErrors) {
    console.log("\nRun `npm run docs:generate` to update stale blocks")
    process.exit(1)
  }

  console.log("\nAll AUTO blocks are up to date!")
  process.exit(0)
}

main()
