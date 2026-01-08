#!/usr/bin/env tsx
/**
 * Generate Schema Reference
 *
 * Parses prisma/schema.prisma and generates statistics and model list.
 *
 * Usage: npx tsx scripts/docs/generate-schema-reference.ts
 */

import * as fs from "fs"
import * as path from "path"

const ROOT = path.resolve(__dirname, "../..")
const SCHEMA_PATH = path.join(ROOT, "prisma/schema.prisma")

interface ModelInfo {
  name: string
  fields: number
  relations: string[]
}

interface EnumInfo {
  name: string
  values: string[]
}

function parseSchema() {
  const content = fs.readFileSync(SCHEMA_PATH, "utf-8")
  const lines = content.split("\n")

  const models: ModelInfo[] = []
  const enums: EnumInfo[] = []

  let currentModel: ModelInfo | null = null
  let currentEnum: EnumInfo | null = null
  let inBlock = false
  let blockType: "model" | "enum" | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    // Start of model
    const modelMatch = trimmed.match(/^model\s+(\w+)\s*\{/)
    if (modelMatch) {
      currentModel = { name: modelMatch[1], fields: 0, relations: [] }
      inBlock = true
      blockType = "model"
      continue
    }

    // Start of enum
    const enumMatch = trimmed.match(/^enum\s+(\w+)\s*\{/)
    if (enumMatch) {
      currentEnum = { name: enumMatch[1], values: [] }
      inBlock = true
      blockType = "enum"
      continue
    }

    // End of block
    if (trimmed === "}" && inBlock) {
      if (blockType === "model" && currentModel) {
        models.push(currentModel)
        currentModel = null
      }
      if (blockType === "enum" && currentEnum) {
        enums.push(currentEnum)
        currentEnum = null
      }
      inBlock = false
      blockType = null
      continue
    }

    // Inside model - count fields
    if (blockType === "model" && currentModel && trimmed && !trimmed.startsWith("@@") && !trimmed.startsWith("//")) {
      currentModel.fields++

      // Check for relations
      const relationMatch = trimmed.match(/@relation\(.*?\)/)
      if (relationMatch) {
        const fieldName = trimmed.split(/\s+/)[0]
        currentModel.relations.push(fieldName)
      }
    }

    // Inside enum - collect values
    if (blockType === "enum" && currentEnum && trimmed && !trimmed.startsWith("//")) {
      currentEnum.values.push(trimmed.replace(/,?\s*$/, ""))
    }
  }

  return { models, enums }
}

function main() {
  const { models, enums } = parseSchema()

  console.log("<!-- AUTO:SCHEMA_STATS_START -->")
  console.log("")
  console.log("### Database Schema Statistics")
  console.log("")
  console.log(`| Metric | Count |`)
  console.log(`|--------|-------|`)
  console.log(`| Models | ${models.length} |`)
  console.log(`| Enums | ${enums.length} |`)
  console.log(`| Total Fields | ${models.reduce((sum, m) => sum + m.fields, 0)} |`)
  console.log("")
  console.log("### Models by Domain")
  console.log("")

  // Group models by prefix/category (heuristic)
  const categories: Record<string, string[]> = {
    "User & Auth": [],
    "Sports & Activities": [],
    "Rankings & Leaderboards": [],
    "Gamification": [],
    "Social": [],
    "Teams & Communities": [],
    "Integrations": [],
    "Training": [],
    "Other": [],
  }

  for (const model of models) {
    const name = model.name

    if (name.startsWith("User") || name === "Follow" || name.startsWith("Friend") || name === "PushToken" || name === "Notification" || name.startsWith("Subscription")) {
      categories["User & Auth"].push(name)
    } else if (name.includes("Activity") || name === "Sport" || name === "Discipline" || name.includes("Gear") || name.startsWith("Personal")) {
      categories["Sports & Activities"].push(name)
    } else if (name.includes("Ranking") || name.includes("Leaderboard") || name.includes("SportIndex")) {
      categories["Rankings & Leaderboards"].push(name)
    } else if (name.includes("Badge") || name.includes("Streak") || name.includes("Challenge") || name === "Perk" || name === "Target") {
      categories["Gamification"].push(name)
    } else if (name === "Post" || name === "Comment" || name === "Like" || name === "FeedItem" || name.includes("Partner")) {
      categories["Social"].push(name)
    } else if (name.startsWith("Team") || name.startsWith("Community") || name.startsWith("League") || name.startsWith("Cohort")) {
      categories["Teams & Communities"].push(name)
    } else if (name.includes("Strava") || name.includes("Integration") || name.includes("Connection") || name.includes("Import")) {
      categories["Integrations"].push(name)
    } else if (name.includes("Training") || name.includes("Plan") || name.includes("Workout")) {
      categories["Training"].push(name)
    } else if (name.includes("Rivalry") || name.includes("Competition") || name.includes("Benchmark")) {
      categories["Gamification"].push(name)
    } else {
      categories["Other"].push(name)
    }
  }

  console.log("| Category | Models | Count |")
  console.log("|----------|--------|-------|")

  for (const [category, modelNames] of Object.entries(categories)) {
    if (modelNames.length > 0) {
      console.log(`| ${category} | ${modelNames.slice(0, 5).join(", ")}${modelNames.length > 5 ? ", ..." : ""} | ${modelNames.length} |`)
    }
  }

  console.log("")
  console.log("### Key Enums")
  console.log("")
  console.log("| Enum | Values |")
  console.log("|------|--------|")

  // Show first 10 enums
  for (const e of enums.slice(0, 15)) {
    const valuesStr = e.values.length > 4
      ? e.values.slice(0, 4).join(", ") + ", ..."
      : e.values.join(", ")
    console.log(`| ${e.name} | ${valuesStr} |`)
  }

  if (enums.length > 15) {
    console.log(`| ... | (${enums.length - 15} more enums) |`)
  }

  console.log("")
  console.log("<!-- AUTO:SCHEMA_STATS_END -->")
}

main()
