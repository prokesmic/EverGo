/**
 * Backfill normalized location fields for existing users
 *
 * This script migrates users who have legacy `country` and `city` string fields
 * to the new normalized `countryCode`, `countryName`, `cityId`, and `cityName` fields.
 *
 * Usage:
 *   npx tsx scripts/backfill-location.ts
 *   npx tsx scripts/backfill-location.ts --dry-run
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Country name to code mapping (includes common variations)
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  // Standard names
  austria: "AT",
  belgium: "BE",
  bulgaria: "BG",
  croatia: "HR",
  cyprus: "CY",
  "czech republic": "CZ",
  czechia: "CZ",
  denmark: "DK",
  estonia: "EE",
  finland: "FI",
  france: "FR",
  germany: "DE",
  greece: "GR",
  hungary: "HU",
  ireland: "IE",
  italy: "IT",
  latvia: "LV",
  lithuania: "LT",
  luxembourg: "LU",
  malta: "MT",
  netherlands: "NL",
  "the netherlands": "NL",
  holland: "NL",
  norway: "NO",
  poland: "PL",
  portugal: "PT",
  romania: "RO",
  slovakia: "SK",
  slovenia: "SI",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  ukraine: "UA",
  canada: "CA",
  mexico: "MX",
  "united states": "US",
  usa: "US",
  "united states of america": "US",
  argentina: "AR",
  brazil: "BR",
  chile: "CL",
  colombia: "CO",
  australia: "AU",
  china: "CN",
  "hong kong": "HK",
  india: "IN",
  indonesia: "ID",
  japan: "JP",
  malaysia: "MY",
  "new zealand": "NZ",
  philippines: "PH",
  singapore: "SG",
  "south korea": "KR",
  korea: "KR",
  taiwan: "TW",
  thailand: "TH",
  vietnam: "VN",
  egypt: "EG",
  israel: "IL",
  "south africa": "ZA",
  "united arab emirates": "AE",
  uae: "AE",
}

const CODE_TO_NAME: Record<string, string> = {
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  HR: "Croatia",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GR: "Greece",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxembourg",
  MT: "Malta",
  NL: "Netherlands",
  NO: "Norway",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SK: "Slovakia",
  SI: "Slovenia",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  GB: "United Kingdom",
  UA: "Ukraine",
  CA: "Canada",
  MX: "Mexico",
  US: "United States",
  AR: "Argentina",
  BR: "Brazil",
  CL: "Chile",
  CO: "Colombia",
  AU: "Australia",
  CN: "China",
  HK: "Hong Kong",
  IN: "India",
  ID: "Indonesia",
  JP: "Japan",
  MY: "Malaysia",
  NZ: "New Zealand",
  PH: "Philippines",
  SG: "Singapore",
  KR: "South Korea",
  TW: "Taiwan",
  TH: "Thailand",
  VN: "Vietnam",
  EG: "Egypt",
  IL: "Israel",
  ZA: "South Africa",
  AE: "United Arab Emirates",
}

function normalizeString(str: string): string {
  return str.toLowerCase().trim()
}

function getCountryCode(countryName: string): string | null {
  const normalized = normalizeString(countryName)
  return COUNTRY_NAME_TO_CODE[normalized] || null
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("=".repeat(60))
  console.log("Location Backfill Script")
  console.log(isDryRun ? "DRY RUN MODE - No changes will be made" : "LIVE MODE")
  console.log("=".repeat(60))

  // Find users needing migration
  const usersToMigrate = await prisma.user.findMany({
    where: {
      OR: [
        // Has legacy country but no countryCode
        { country: { not: null }, countryCode: null },
        // Has legacy city but no cityId
        { city: { not: null }, cityId: null },
      ],
    },
    select: {
      id: true,
      email: true,
      country: true,
      city: true,
      countryCode: true,
      countryName: true,
      cityId: true,
      cityName: true,
    },
  })

  console.log(`\nFound ${usersToMigrate.length} users needing migration\n`)

  let countryMigrated = 0
  let cityMigrated = 0
  let countryFailed = 0
  let cityFailed = 0

  for (const user of usersToMigrate) {
    const updates: Record<string, string | null> = {}
    let countryCode = user.countryCode

    // Migrate country
    if (user.country && !user.countryCode) {
      const code = getCountryCode(user.country)
      if (code) {
        countryCode = code
        updates.countryCode = code
        updates.countryName = CODE_TO_NAME[code] || user.country
        console.log(`  [COUNTRY] ${user.email}: "${user.country}" -> ${code}`)
        countryMigrated++
      } else {
        console.log(`  [COUNTRY SKIP] ${user.email}: No match for "${user.country}"`)
        countryFailed++
      }
    }

    // Migrate city (requires countryCode)
    if (user.city && !user.cityId && countryCode) {
      // Try to find matching city in database
      const cityNormalized = normalizeString(user.city)
      const matchingCity = await prisma.city.findFirst({
        where: {
          countryCode: countryCode,
          OR: [
            { name: { equals: user.city, mode: "insensitive" } },
            { normalized: { contains: cityNormalized } },
          ],
        },
        select: { id: true, name: true },
      })

      if (matchingCity) {
        updates.cityId = matchingCity.id
        updates.cityName = matchingCity.name
        console.log(`  [CITY] ${user.email}: "${user.city}" -> ${matchingCity.name} (${matchingCity.id})`)
        cityMigrated++
      } else {
        console.log(`  [CITY SKIP] ${user.email}: No match for "${user.city}" in ${countryCode}`)
        cityFailed++
      }
    }

    // Apply updates
    if (Object.keys(updates).length > 0 && !isDryRun) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      })
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("Summary:")
  console.log(`  Countries migrated: ${countryMigrated}`)
  console.log(`  Countries failed:   ${countryFailed}`)
  console.log(`  Cities migrated:    ${cityMigrated}`)
  console.log(`  Cities failed:      ${cityFailed}`)
  console.log("=".repeat(60))

  if (isDryRun) {
    console.log("\nThis was a dry run. Run without --dry-run to apply changes.")
  }
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
