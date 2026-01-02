import { z } from "zod"

// Gender options matching Prisma schema
export const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] as const
export type Gender = typeof GENDER_OPTIONS[number]

// Sync provider options
export const SYNC_PROVIDERS = ["STRAVA", "GARMIN", "SKIP"] as const
export type SyncProvider = typeof SYNC_PROVIDERS[number]

/**
 * Onboarding schema - strict + normalized
 * Used for validating onboarding wizard data
 */
export const onboardingSchema = z.object({
  // Step 1: Identity
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(280, "Bio must be 280 characters or less").optional().default(""),
  gender: z.enum(GENDER_OPTIONS).optional(),

  // Normalized location (no free text storage)
  countryCode: z.string().length(2, "Select a country"),
  countryName: z.string().min(2, "Country name required"),
  cityId: z.string().min(1, "Select a city"),
  cityName: z.string().min(2, "City name required"),

  // Step 2: Sports (canonical IDs)
  primarySportId: z.string().min(1, "Select a primary sport"),
  otherSportIds: z.array(z.string()).default([]),

  // Step 3: Initial Benchmark (manual PB to seed ranking)
  // Optional - for team sports or users who skip
  initialBenchmark: z.object({
    benchmarkId: z.string().min(1), // BenchmarkDefinition ID
    disciplineSlug: z.string().min(1),
    // rawInput kept only for parsing; final `value` is numeric normalized
    rawInput: z.string().min(1),
    value: z.number().positive("Value must be positive"),
    unit: z.string().min(1), // "seconds", "meters", "kg", "watts"
    occurredAt: z.string().optional(), // ISO date optional
  }).optional(),

  // Step 4: Sync (optional)
  connectProvider: z.enum(SYNC_PROVIDERS).default("SKIP"),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

// Partial schema for step-by-step validation
export const step1Schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(280).optional().default(""),
  gender: z.enum(GENDER_OPTIONS).optional(),
  countryCode: z.string().length(2, "Select a country"),
  countryName: z.string().min(2),
  cityId: z.string().min(1, "Select a city"),
  cityName: z.string().min(2),
})

export const step2Schema = z.object({
  primarySportId: z.string().min(1, "Select a primary sport"),
  otherSportIds: z.array(z.string()).default([]),
})

export const step3Schema = z.object({
  initialBenchmark: z.object({
    benchmarkId: z.string().min(1),
    disciplineSlug: z.string().min(1),
    rawInput: z.string().min(1),
    value: z.number().positive(),
    unit: z.string().min(1),
    occurredAt: z.string().optional(),
  }).optional(),
})

export const step4Schema = z.object({
  connectProvider: z.enum(SYNC_PROVIDERS).default("SKIP"),
})
