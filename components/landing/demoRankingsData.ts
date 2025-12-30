// Demo data for landing page rankings showcase
// This is static placeholder data - logged-in users see real data

export type DemoScope = "global" | "country" | "city"

export type DemoSport = {
  slug: string
  label: string
  icon: string
  disciplines: DemoDiscipline[]
}

export type DemoDiscipline = {
  id: string
  label: string
  unit: string
  rows: DemoLeaderboardRow[]
}

export type DemoLeaderboardRow = {
  rank: number
  name: string
  flag: string
  value: string
  delta?: number // position change, positive = moved up
}

export type DemoSportPack = DemoSport[]

export type DemoRivalry = {
  id: string
  opponentName: string
  opponentAvatar: string
  sport: string
  discipline: string
  yourValue: string
  theirValue: string
  winning: boolean
  lastActivity: string
}

export const DEMO_SPORTS: DemoSportPack = [
  {
    slug: "running",
    label: "Running",
    icon: "🏃",
    disciplines: [
      {
        id: "5k",
        label: "5K",
        unit: "time",
        rows: [
          { rank: 1, name: "Jakob Ingebrigtsen", flag: "🇳🇴", value: "12:48", delta: 0 },
          { rank: 2, name: "Joshua Cheptegei", flag: "🇺🇬", value: "12:51", delta: 2 },
          { rank: 3, name: "Mo Farah", flag: "🇬🇧", value: "12:53", delta: -1 },
          { rank: 4, name: "Kenenisa Bekele", flag: "🇪🇹", value: "12:55", delta: 0 },
          { rank: 5, name: "Selemon Barega", flag: "🇪🇹", value: "12:58", delta: 1 },
        ],
      },
      {
        id: "10k",
        label: "10K",
        unit: "time",
        rows: [
          { rank: 1, name: "Joshua Cheptegei", flag: "🇺🇬", value: "26:11", delta: 0 },
          { rank: 2, name: "Kenenisa Bekele", flag: "🇪🇹", value: "26:17", delta: 0 },
          { rank: 3, name: "Rhonex Kipruto", flag: "🇰🇪", value: "26:24", delta: 1 },
          { rank: 4, name: "Selemon Barega", flag: "🇪🇹", value: "26:31", delta: -1 },
          { rank: 5, name: "Mo Farah", flag: "🇬🇧", value: "26:46", delta: 0 },
        ],
      },
      {
        id: "marathon",
        label: "Marathon",
        unit: "time",
        rows: [
          { rank: 1, name: "Kelvin Kiptum", flag: "🇰🇪", value: "2:00:35", delta: 0 },
          { rank: 2, name: "Eliud Kipchoge", flag: "🇰🇪", value: "2:01:09", delta: 0 },
          { rank: 3, name: "Kenenisa Bekele", flag: "🇪🇹", value: "2:01:41", delta: 0 },
          { rank: 4, name: "Birhanu Legese", flag: "🇪🇹", value: "2:02:48", delta: 2 },
          { rank: 5, name: "Sisay Lemma", flag: "🇪🇹", value: "2:03:36", delta: -1 },
        ],
      },
    ],
  },
  {
    slug: "cycling",
    label: "Cycling",
    icon: "🚴",
    disciplines: [
      {
        id: "ftp",
        label: "FTP (w/kg)",
        unit: "power",
        rows: [
          { rank: 1, name: "Tadej Pogačar", flag: "🇸🇮", value: "6.8 w/kg", delta: 1 },
          { rank: 2, name: "Jonas Vingegaard", flag: "🇩🇰", value: "6.7 w/kg", delta: -1 },
          { rank: 3, name: "Remco Evenepoel", flag: "🇧🇪", value: "6.5 w/kg", delta: 0 },
          { rank: 4, name: "Primož Roglič", flag: "🇸🇮", value: "6.4 w/kg", delta: 2 },
          { rank: 5, name: "Adam Yates", flag: "🇬🇧", value: "6.3 w/kg", delta: 0 },
        ],
      },
      {
        id: "vo2max",
        label: "VO2max",
        unit: "ml/kg/min",
        rows: [
          { rank: 1, name: "Jonas Vingegaard", flag: "🇩🇰", value: "97.5", delta: 0 },
          { rank: 2, name: "Tadej Pogačar", flag: "🇸🇮", value: "95.2", delta: 0 },
          { rank: 3, name: "Remco Evenepoel", flag: "🇧🇪", value: "92.8", delta: 1 },
          { rank: 4, name: "Primož Roglič", flag: "🇸🇮", value: "91.4", delta: -1 },
          { rank: 5, name: "Mathieu van der Poel", flag: "🇳🇱", value: "89.6", delta: 0 },
        ],
      },
    ],
  },
  {
    slug: "swimming",
    label: "Swimming",
    icon: "🏊",
    disciplines: [
      {
        id: "100m-free",
        label: "100m Free",
        unit: "time",
        rows: [
          { rank: 1, name: "Pan Zhanle", flag: "🇨🇳", value: "46.40", delta: 0 },
          { rank: 2, name: "Kyle Chalmers", flag: "🇦🇺", value: "46.96", delta: 1 },
          { rank: 3, name: "David Popovici", flag: "🇷🇴", value: "47.12", delta: -1 },
          { rank: 4, name: "Caeleb Dressel", flag: "🇺🇸", value: "47.22", delta: 0 },
          { rank: 5, name: "Nandor Nemeth", flag: "🇭🇺", value: "47.41", delta: 2 },
        ],
      },
      {
        id: "1500m-free",
        label: "1500m Free",
        unit: "time",
        rows: [
          { rank: 1, name: "Bobby Finke", flag: "🇺🇸", value: "14:30.67", delta: 0 },
          { rank: 2, name: "Daniel Wiffen", flag: "🇮🇪", value: "14:31.24", delta: 1 },
          { rank: 3, name: "Ahmed Hafnaoui", flag: "🇹🇳", value: "14:36.12", delta: -1 },
          { rank: 4, name: "Florian Wellbrock", flag: "🇩🇪", value: "14:40.91", delta: 0 },
          { rank: 5, name: "Gregorio Paltrinieri", flag: "🇮🇹", value: "14:42.87", delta: 0 },
        ],
      },
    ],
  },
  {
    slug: "kitesurfing",
    label: "Kitesurfing",
    icon: "🪁",
    disciplines: [
      {
        id: "max-speed",
        label: "Max Speed",
        unit: "knots",
        rows: [
          { rank: 1, name: "Alexandre Caizergues", flag: "🇫🇷", value: "57.97 kts", delta: 0 },
          { rank: 2, name: "Rob Douglas", flag: "🇺🇸", value: "55.65 kts", delta: 0 },
          { rank: 3, name: "Sylvain Hoceini", flag: "🇫🇷", value: "54.28 kts", delta: 1 },
          { rank: 4, name: "Sébastien Cattelan", flag: "🇫🇷", value: "53.91 kts", delta: -1 },
          { rank: 5, name: "Axel Mazella", flag: "🇫🇷", value: "52.44 kts", delta: 2 },
        ],
      },
      {
        id: "jump-height",
        label: "Jump Height",
        unit: "meters",
        rows: [
          { rank: 1, name: "Jamie Overbeek", flag: "🇳🇱", value: "34.8 m", delta: 0 },
          { rank: 2, name: "Giel Vlugt", flag: "🇳🇱", value: "33.2 m", delta: 1 },
          { rank: 3, name: "Lasse Walker", flag: "🇩🇰", value: "32.6 m", delta: -1 },
          { rank: 4, name: "Nick Jacobsen", flag: "🇩🇰", value: "31.9 m", delta: 0 },
          { rank: 5, name: "Ruben Lenten", flag: "🇳🇱", value: "31.2 m", delta: 0 },
        ],
      },
    ],
  },
  {
    slug: "strength",
    label: "Strength",
    icon: "🏋️",
    disciplines: [
      {
        id: "deadlift",
        label: "Deadlift",
        unit: "kg",
        rows: [
          { rank: 1, name: "Hafthor Björnsson", flag: "🇮🇸", value: "501 kg", delta: 0 },
          { rank: 2, name: "Eddie Hall", flag: "🇬🇧", value: "500 kg", delta: 0 },
          { rank: 3, name: "Krzysztof Wierzbicki", flag: "🇵🇱", value: "463 kg", delta: 1 },
          { rank: 4, name: "Peiman Maheripourehir", flag: "🇮🇷", value: "461 kg", delta: -1 },
          { rank: 5, name: "Jamal Browner", flag: "🇺🇸", value: "457 kg", delta: 0 },
        ],
      },
      {
        id: "bench-press",
        label: "Bench Press",
        unit: "kg",
        rows: [
          { rank: 1, name: "Julius Maddox", flag: "🇺🇸", value: "355 kg", delta: 0 },
          { rank: 2, name: "Jimmy Kolb", flag: "🇺🇸", value: "350 kg", delta: 1 },
          { rank: 3, name: "Will Barotti", flag: "🇺🇸", value: "328 kg", delta: -1 },
          { rank: 4, name: "Fredrik Smulter", flag: "🇫🇮", value: "325 kg", delta: 0 },
          { rank: 5, name: "Kirill Sarychev", flag: "🇷🇺", value: "321 kg", delta: 0 },
        ],
      },
      {
        id: "squat",
        label: "Squat",
        unit: "kg",
        rows: [
          { rank: 1, name: "Ray Williams", flag: "🇺🇸", value: "490 kg", delta: 0 },
          { rank: 2, name: "Jesus Olivares", flag: "🇲🇽", value: "478 kg", delta: 1 },
          { rank: 3, name: "Blaine Sumner", flag: "🇺🇸", value: "473 kg", delta: -1 },
          { rank: 4, name: "Zahir Khudayarov", flag: "🇦🇿", value: "468 kg", delta: 0 },
          { rank: 5, name: "Andrey Malanichev", flag: "🇷🇺", value: "460 kg", delta: 0 },
        ],
      },
    ],
  },
]

export const DEMO_RIVALRIES: DemoRivalry[] = [
  {
    id: "1",
    opponentName: "Alex Runner",
    opponentAvatar: "",
    sport: "Running",
    discipline: "5K",
    yourValue: "21:34",
    theirValue: "21:12",
    winning: false,
    lastActivity: "2 days ago",
  },
  {
    id: "2",
    opponentName: "Chris Cyclist",
    opponentAvatar: "",
    sport: "Cycling",
    discipline: "FTP",
    yourValue: "4.2 w/kg",
    theirValue: "4.0 w/kg",
    winning: true,
    lastActivity: "Yesterday",
  },
  {
    id: "3",
    opponentName: "Sam Swimmer",
    opponentAvatar: "",
    sport: "Swimming",
    discipline: "100m Free",
    yourValue: "58.4s",
    theirValue: "57.9s",
    winning: false,
    lastActivity: "5 days ago",
  },
]
