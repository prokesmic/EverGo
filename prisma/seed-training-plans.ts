import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedTrainingPlans() {
  console.log("🏃 Seeding training plans...")

  // Get Running sport
  const runningSport = await prisma.sport.findFirst({
    where: { name: "Running" },
  })

  if (!runningSport) {
    console.log("❌ Running sport not found. Please seed sports first.")
    return
  }

  // Couch to 5K Plan
  const couch5K = await prisma.trainingPlan.upsert({
    where: { id: "couch-to-5k" },
    update: {},
    create: {
      id: "couch-to-5k",
      name: "Couch to 5K",
      description:
        "Perfect for complete beginners. Build from zero to running 5K in 8 weeks with a gradual walk-run program.",
      duration: 8,
      level: "BEGINNER",
      sportId: runningSport.id,
      isTemplate: true,
      isPublic: true,
      tags: JSON.stringify(["5K", "beginner", "walk-run"]),
      weeks: {
        create: [
          {
            weekNumber: 1,
            title: "Getting Started",
            description: "Gentle introduction to running",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Walk/Run Intervals",
                  description: "1 min run, 2 min walk - repeat 8 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Walk/Run Intervals",
                  description: "1 min run, 2 min walk - repeat 8 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Walk/Run Intervals",
                  description: "1 min run, 2 min walk - repeat 8 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 2,
            title: "Building Endurance",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Walk/Run Intervals",
                  description: "2 min run, 2 min walk - repeat 6 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Walk/Run Intervals",
                  description: "2 min run, 2 min walk - repeat 6 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Walk/Run Intervals",
                  description: "2 min run, 2 min walk - repeat 6 times",
                  targetType: "DURATION",
                  targetValue: 24,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 3,
            title: "Increasing Run Time",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Walk/Run Intervals",
                  description: "3 min run, 2 min walk - repeat 5 times",
                  targetType: "DURATION",
                  targetValue: 25,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Walk/Run Intervals",
                  description: "3 min run, 2 min walk - repeat 5 times",
                  targetType: "DURATION",
                  targetValue: 25,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Walk/Run Intervals",
                  description: "3 min run, 2 min walk - repeat 5 times",
                  targetType: "DURATION",
                  targetValue: 25,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 4,
            title: "Longer Runs",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Continuous Run",
                  description: "5 min run, 3 min walk, 5 min run, 3 min walk, 5 min run",
                  targetType: "DURATION",
                  targetValue: 21,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Continuous Run",
                  description: "5 min run, 3 min walk, 5 min run, 3 min walk, 5 min run",
                  targetType: "DURATION",
                  targetValue: 21,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Continuous Run",
                  description: "5 min run, 3 min walk, 5 min run, 3 min walk, 5 min run",
                  targetType: "DURATION",
                  targetValue: 21,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 5,
            title: "Building Stamina",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "8 min run, 5 min walk, 8 min run",
                  targetType: "DURATION",
                  targetValue: 21,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run",
                  description: "8 min run, 5 min walk, 8 min run",
                  targetType: "DURATION",
                  targetValue: 21,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Continuous Run",
                  description: "20 min continuous run",
                  targetType: "DURATION",
                  targetValue: 20,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 6,
            title: "Pushing Further",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Run for 22 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 22,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run",
                  description: "Run for 22 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 22,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Run for 25 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 25,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 7,
            title: "Almost There",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Run for 25 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 25,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run",
                  description: "Run for 28 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 28,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Run for 30 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 30,
                  targetUnit: "min",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 8,
            title: "5K Ready!",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Run for 28 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 28,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run",
                  description: "Run for 30 minutes at comfortable pace",
                  targetType: "DURATION",
                  targetValue: 30,
                  targetUnit: "min",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "5K Run!",
                  description: "Your first 5K! Run at a comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "MODERATE",
                },
              ],
            },
          },
        ],
      },
    },
  })

  // 10K Training Plan
  const train10K = await prisma.trainingPlan.upsert({
    where: { id: "10k-training" },
    update: {},
    create: {
      id: "10k-training",
      name: "10K Training Plan",
      description:
        "For runners who can comfortably run 5K. Build your endurance to complete a 10K race in 8 weeks.",
      duration: 8,
      level: "INTERMEDIATE",
      sportId: runningSport.id,
      isTemplate: true,
      isPublic: true,
      tags: JSON.stringify(["10K", "intermediate", "race-prep"]),
      weeks: {
        create: [
          {
            weekNumber: 1,
            title: "Base Building",
            description: "Establish a solid aerobic base",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Tempo Run",
                  description: "Warm up 1km, 3km at tempo, cool down 1km",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "MODERATE",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 4,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Slow and steady pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 2,
            title: "Building Volume",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Intervals",
                  description: "1km warm up, 6x400m at 5K pace with 200m recovery, 1km cool down",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "HARD",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Slow and steady pace",
                  targetType: "DISTANCE",
                  targetValue: 7,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 3,
            title: "Increasing Distance",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Tempo Run",
                  description: "1km warm up, 5km at tempo, 1km cool down",
                  targetType: "DISTANCE",
                  targetValue: 7,
                  targetUnit: "km",
                  intensity: "MODERATE",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Slow and steady pace",
                  targetType: "DISTANCE",
                  targetValue: 8,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 4,
            title: "Recovery Week",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 4,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 4,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 5,
            title: "Peak Training",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Intervals",
                  description: "1km warm up, 8x400m at 5K pace with 200m recovery, 1km cool down",
                  targetType: "DISTANCE",
                  targetValue: 7,
                  targetUnit: "km",
                  intensity: "HARD",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Slow and steady pace",
                  targetType: "DISTANCE",
                  targetValue: 10,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 6,
            title: "Building Strength",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Tempo Run",
                  description: "1km warm up, 6km at tempo, 1km cool down",
                  targetType: "DISTANCE",
                  targetValue: 8,
                  targetUnit: "km",
                  intensity: "MODERATE",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Comfortable pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Long Run",
                  description: "Slow and steady pace",
                  targetType: "DISTANCE",
                  targetValue: 11,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 7,
            title: "Tapering",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run with Strides",
                  description: "4km easy + 4x100m strides",
                  targetType: "DISTANCE",
                  targetValue: 5,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 4,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 4,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 6,
                  title: "Easy Run",
                  description: "Light recovery pace",
                  targetType: "DISTANCE",
                  targetValue: 6,
                  targetUnit: "km",
                  intensity: "EASY",
                },
              ],
            },
          },
          {
            weekNumber: 8,
            title: "Race Week!",
            workouts: {
              create: [
                {
                  dayOfWeek: 0,
                  title: "Easy Run",
                  description: "Very light pace",
                  targetType: "DISTANCE",
                  targetValue: 3,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 2,
                  title: "Easy Run with Strides",
                  description: "3km easy + 3x100m strides",
                  targetType: "DISTANCE",
                  targetValue: 3,
                  targetUnit: "km",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 3,
                  title: "Rest",
                  description: "Complete rest before race",
                  targetType: "REST",
                  intensity: "EASY",
                },
                {
                  dayOfWeek: 5,
                  title: "10K RACE!",
                  description: "Race day! Trust your training and enjoy!",
                  targetType: "DISTANCE",
                  targetValue: 10,
                  targetUnit: "km",
                  intensity: "RACE_PACE",
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log("✅ Training plans seeded successfully!")
  console.log(`   - ${couch5K.name}`)
  console.log(`   - ${train10K.name}`)
}

seedTrainingPlans()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
