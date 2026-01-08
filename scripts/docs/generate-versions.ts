#!/usr/bin/env tsx
/**
 * Generate Versions Table
 *
 * Reads package.json and outputs a Markdown table of key dependencies.
 * Used to keep EVERGO7.md in sync with actual versions.
 *
 * Usage: npx tsx scripts/docs/generate-versions.ts
 */

import * as fs from "fs"
import * as path from "path"

const ROOT = path.resolve(__dirname, "../..")

interface PackageJson {
  name: string
  version: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

// Key packages to document
const KEY_PACKAGES = [
  // Core
  "next",
  "react",
  "react-dom",
  "typescript",
  // Database
  "prisma",
  "@prisma/client",
  // Auth
  "next-auth",
  // UI
  "tailwindcss",
  "framer-motion",
  "lucide-react",
  "zod",
  "zustand",
  // Testing
  "@playwright/test",
  // Integrations
  "@supabase/supabase-js",
]

function main() {
  const pkgPath = path.join(ROOT, "package.json")
  const pkg: PackageJson = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

  console.log("<!-- AUTO:VERSIONS_START -->")
  console.log("")
  console.log("| Package | Version |")
  console.log("|---------|---------|")

  for (const name of KEY_PACKAGES) {
    const version = allDeps[name] ?? "not installed"
    console.log(`| ${name} | ${version} |`)
  }

  console.log("")
  console.log("<!-- AUTO:VERSIONS_END -->")
}

main()
