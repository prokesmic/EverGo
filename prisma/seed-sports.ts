import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedSports() {
  console.log("🏃 Seeding sports...")

  const sports = [
    // ============ ENDURANCE ============
    { name: "Running", slug: "running", icon: "🏃", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Cycling", slug: "cycling", icon: "🚴", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Swimming", slug: "swimming", icon: "🏊", category: "ENDURANCE", hasGpsTracking: false },
    { name: "Rowing", slug: "rowing", icon: "🚣", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Triathlon", slug: "triathlon", icon: "🏆", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Marathon", slug: "marathon", icon: "🏅", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Race Walking", slug: "race-walking", icon: "🚶", category: "ENDURANCE", hasGpsTracking: true },
    { name: "Modern Pentathlon", slug: "modern-pentathlon", icon: "🏅", category: "ENDURANCE", hasGpsTracking: true },

    // ============ STRENGTH ============
    { name: "Gym / Strength", slug: "gym-strength", icon: "💪", category: "STRENGTH", hasGpsTracking: false },
    { name: "CrossFit", slug: "crossfit", icon: "🏋️", category: "STRENGTH", hasGpsTracking: false },
    { name: "Weightlifting", slug: "weightlifting", icon: "🏋️", category: "STRENGTH", hasGpsTracking: false },
    { name: "Powerlifting", slug: "powerlifting", icon: "🏋️", category: "STRENGTH", hasGpsTracking: false },
    { name: "Calisthenics", slug: "calisthenics", icon: "💪", category: "STRENGTH", hasGpsTracking: false },

    // ============ OUTDOOR ============
    { name: "Hiking", slug: "hiking", icon: "🥾", category: "OUTDOOR", hasGpsTracking: true },
    { name: "Walking", slug: "walking", icon: "🚶", category: "OUTDOOR", hasGpsTracking: true },
    { name: "Bouldering", slug: "bouldering", icon: "🧗", category: "OUTDOOR", hasGpsTracking: false },
    { name: "Sport Climbing", slug: "climbing-sport", icon: "🧗", category: "OUTDOOR", hasGpsTracking: false },
    { name: "Mountaineering", slug: "mountaineering", icon: "⛰️", category: "OUTDOOR", hasGpsTracking: true },
    { name: "Skateboarding", slug: "skateboarding", icon: "🛹", category: "OUTDOOR", hasGpsTracking: false },

    // ============ WATER SPORTS ============
    { name: "Kitesurfing", slug: "kitesurfing", icon: "🪁", category: "WATER", hasGpsTracking: true },
    { name: "Surfing", slug: "surfing", icon: "🏄", category: "WATER", hasGpsTracking: true },
    { name: "Windsurfing", slug: "windsurfing", icon: "🏄", category: "WATER", hasGpsTracking: true },
    { name: "Sailing", slug: "sailing", icon: "⛵", category: "WATER", hasGpsTracking: true },
    { name: "Kayaking", slug: "kayaking", icon: "🛶", category: "WATER", hasGpsTracking: true },
    { name: "Canoeing", slug: "canoeing", icon: "🛶", category: "WATER", hasGpsTracking: true },
    { name: "Diving", slug: "diving", icon: "🤿", category: "WATER", hasGpsTracking: false },
    { name: "Water Polo", slug: "water-polo", icon: "🤽", category: "WATER", hasGpsTracking: false },
    { name: "Stand Up Paddling", slug: "stand-up-paddling", icon: "🏄", category: "WATER", hasGpsTracking: true },
    { name: "Wakeboarding", slug: "wakeboarding", icon: "🏄", category: "WATER", hasGpsTracking: true },

    // ============ WINTER SPORTS ============
    { name: "Alpine Skiing", slug: "skiing", icon: "⛷️", category: "WINTER", hasGpsTracking: true },
    { name: "Cross-Country Skiing", slug: "cross-country-skiing", icon: "⛷️", category: "WINTER", hasGpsTracking: true },
    { name: "Snowboarding", slug: "snowboarding", icon: "🏂", category: "WINTER", hasGpsTracking: true },
    { name: "Biathlon", slug: "biathlon", icon: "🎿", category: "WINTER", hasGpsTracking: true },
    { name: "Ski Jumping", slug: "ski-jumping", icon: "🎿", category: "WINTER", hasGpsTracking: false },
    { name: "Freestyle Skiing", slug: "freestyle-skiing", icon: "⛷️", category: "WINTER", hasGpsTracking: true },
    { name: "Figure Skating", slug: "figure-skating", icon: "⛸️", category: "WINTER", hasGpsTracking: false },
    { name: "Speed Skating", slug: "speed-skating", icon: "⛸️", category: "WINTER", hasGpsTracking: false },
    { name: "Ice Hockey", slug: "ice-hockey", icon: "🏒", category: "WINTER", hasGpsTracking: false },
    { name: "Curling", slug: "curling", icon: "🥌", category: "WINTER", hasGpsTracking: false },
    { name: "Bobsled", slug: "bobsled", icon: "🛷", category: "WINTER", hasGpsTracking: true },
    { name: "Luge", slug: "luge", icon: "🛷", category: "WINTER", hasGpsTracking: true },
    { name: "Skeleton", slug: "skeleton", icon: "🛷", category: "WINTER", hasGpsTracking: true },

    // ============ COMBAT SPORTS ============
    { name: "Boxing", slug: "boxing", icon: "🥊", category: "COMBAT", hasGpsTracking: false },
    { name: "MMA", slug: "mma", icon: "🥋", category: "COMBAT", hasGpsTracking: false },
    { name: "Wrestling", slug: "wrestling", icon: "🤼", category: "COMBAT", hasGpsTracking: false },
    { name: "Judo", slug: "judo", icon: "🥋", category: "COMBAT", hasGpsTracking: false },
    { name: "Taekwondo", slug: "taekwondo", icon: "🥋", category: "COMBAT", hasGpsTracking: false },
    { name: "Karate", slug: "karate", icon: "🥋", category: "COMBAT", hasGpsTracking: false },
    { name: "Fencing", slug: "fencing", icon: "🤺", category: "COMBAT", hasGpsTracking: false },
    { name: "Kickboxing", slug: "kickboxing", icon: "🥊", category: "COMBAT", hasGpsTracking: false },
    { name: "Brazilian Jiu-Jitsu", slug: "brazilian-jiu-jitsu", icon: "🥋", category: "COMBAT", hasGpsTracking: false },
    { name: "Muay Thai", slug: "muay-thai", icon: "🥊", category: "COMBAT", hasGpsTracking: false },

    // ============ RACKET SPORTS ============
    { name: "Tennis", slug: "tennis", icon: "🎾", category: "RACKET", hasGpsTracking: false },
    { name: "Padel", slug: "padel", icon: "🎾", category: "RACKET", hasGpsTracking: false },
    { name: "Badminton", slug: "badminton", icon: "🏸", category: "RACKET", hasGpsTracking: false },
    { name: "Table Tennis", slug: "table-tennis", icon: "🏓", category: "RACKET", hasGpsTracking: false },
    { name: "Squash", slug: "squash", icon: "🎾", category: "RACKET", hasGpsTracking: false },
    { name: "Pickleball", slug: "pickleball", icon: "🏓", category: "RACKET", hasGpsTracking: false },

    // ============ TEAM SPORTS ============
    { name: "Basketball", slug: "basketball", icon: "🏀", category: "TEAM", hasGpsTracking: false },
    { name: "Football (Soccer)", slug: "football", icon: "⚽", category: "TEAM", hasGpsTracking: true },
    { name: "Volleyball", slug: "volleyball", icon: "🏐", category: "TEAM", hasGpsTracking: false },
    { name: "Beach Volleyball", slug: "beach-volleyball", icon: "🏐", category: "TEAM", hasGpsTracking: false },
    { name: "Handball", slug: "handball", icon: "🤾", category: "TEAM", hasGpsTracking: false },
    { name: "Rugby", slug: "rugby", icon: "🏉", category: "TEAM", hasGpsTracking: true },
    { name: "American Football", slug: "american-football", icon: "🏈", category: "TEAM", hasGpsTracking: true },
    { name: "Baseball", slug: "baseball", icon: "⚾", category: "TEAM", hasGpsTracking: false },
    { name: "Softball", slug: "softball", icon: "🥎", category: "TEAM", hasGpsTracking: false },
    { name: "Field Hockey", slug: "field-hockey", icon: "🏑", category: "TEAM", hasGpsTracking: true },
    { name: "Lacrosse", slug: "lacrosse", icon: "🥍", category: "TEAM", hasGpsTracking: true },
    { name: "Cricket", slug: "cricket", icon: "🏏", category: "TEAM", hasGpsTracking: false },

    // ============ GYMNASTICS ============
    { name: "Artistic Gymnastics", slug: "artistic-gymnastics", icon: "🤸", category: "GYMNASTICS", hasGpsTracking: false },
    { name: "Rhythmic Gymnastics", slug: "rhythmic-gymnastics", icon: "🤸", category: "GYMNASTICS", hasGpsTracking: false },
    { name: "Trampoline", slug: "trampoline", icon: "🤸", category: "GYMNASTICS", hasGpsTracking: false },
    { name: "Acrobatics", slug: "acrobatics", icon: "🤸", category: "GYMNASTICS", hasGpsTracking: false },
    { name: "Pole Dance", slug: "pole-dance", icon: "💃", category: "GYMNASTICS", hasGpsTracking: false },
    { name: "Cheerleading", slug: "cheerleading", icon: "📣", category: "GYMNASTICS", hasGpsTracking: false },

    // ============ PRECISION SPORTS ============
    { name: "Archery", slug: "archery", icon: "🏹", category: "PRECISION", hasGpsTracking: false },
    { name: "Shooting", slug: "shooting", icon: "🎯", category: "PRECISION", hasGpsTracking: false },
    { name: "Golf", slug: "golf", icon: "⛳", category: "PRECISION", hasGpsTracking: true },
    { name: "Darts", slug: "darts", icon: "🎯", category: "PRECISION", hasGpsTracking: false },
    { name: "Bowling", slug: "bowling", icon: "🎳", category: "PRECISION", hasGpsTracking: false },

    // ============ ATHLETICS ============
    { name: "Sprinting", slug: "sprinting", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Hurdles", slug: "hurdles", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Long Jump", slug: "long-jump", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "High Jump", slug: "high-jump", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Pole Vault", slug: "pole-vault", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Triple Jump", slug: "triple-jump", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Shot Put", slug: "shot-put", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Discus Throw", slug: "discus", icon: "🥏", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Javelin Throw", slug: "javelin", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Hammer Throw", slug: "hammer-throw", icon: "🏃", category: "ATHLETICS", hasGpsTracking: false },
    { name: "Decathlon", slug: "decathlon", icon: "🏅", category: "ATHLETICS", hasGpsTracking: true },
    { name: "Heptathlon", slug: "heptathlon", icon: "🏅", category: "ATHLETICS", hasGpsTracking: true },

    // ============ MIND & BODY ============
    { name: "Yoga", slug: "yoga", icon: "🧘", category: "MIND_BODY", hasGpsTracking: false },
    { name: "Pilates", slug: "pilates", icon: "🧘", category: "MIND_BODY", hasGpsTracking: false },
    { name: "Tai Chi", slug: "tai-chi", icon: "🧘", category: "MIND_BODY", hasGpsTracking: false },
    { name: "Meditation", slug: "meditation", icon: "🧘", category: "MIND_BODY", hasGpsTracking: false },

    // ============ EQUESTRIAN ============
    { name: "Dressage", slug: "dressage", icon: "🐎", category: "EQUESTRIAN", hasGpsTracking: true },
    { name: "Show Jumping", slug: "show-jumping", icon: "🐎", category: "EQUESTRIAN", hasGpsTracking: true },
    { name: "Eventing", slug: "eventing", icon: "🐎", category: "EQUESTRIAN", hasGpsTracking: true },

    // ============ OTHER ============
    { name: "Breaking (Breakdance)", slug: "break-dancing", icon: "🕺", category: "OTHER", hasGpsTracking: false },
    { name: "Roller Skating", slug: "roller-skating", icon: "🛼", category: "OTHER", hasGpsTracking: true },
    { name: "Inline Skating", slug: "inline-skating", icon: "🛼", category: "OTHER", hasGpsTracking: true },
    { name: "Parkour", slug: "parkour", icon: "🏃", category: "OTHER", hasGpsTracking: true },
    { name: "Dance", slug: "dance", icon: "💃", category: "OTHER", hasGpsTracking: false },

    // ============ GENERAL ============
    { name: "All Sports", slug: "all-sports", icon: "🏅", category: "GENERAL", hasGpsTracking: false },
  ]

  for (const sport of sports) {
    await prisma.sport.upsert({
      where: { slug: sport.slug },
      update: {
        name: sport.name,
        icon: sport.icon,
        category: sport.category,
        hasGpsTracking: sport.hasGpsTracking,
      },
      create: sport,
    })
    console.log(`  ✅ ${sport.name}`)
  }

  console.log(`✅ ${sports.length} sports seeded successfully!`)
}

seedSports()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
