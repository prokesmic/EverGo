export interface CityData {
  countryCode: string
  name: string
  normalized: string
  lat?: number
  lon?: number
  population?: number
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
}

export const CITIES_SEED: CityData[] = [
  // Czech Republic
  { countryCode: "CZ", name: "Prague", normalized: normalize("Prague"), lat: 50.0755, lon: 14.4378, population: 1300000 },
  { countryCode: "CZ", name: "Brno", normalized: normalize("Brno"), lat: 49.1951, lon: 16.6068, population: 380000 },
  { countryCode: "CZ", name: "Ostrava", normalized: normalize("Ostrava"), lat: 49.8209, lon: 18.2625, population: 290000 },
  { countryCode: "CZ", name: "Plzeň", normalized: normalize("Plzeň"), lat: 49.7384, lon: 13.3736, population: 170000 },
  { countryCode: "CZ", name: "Liberec", normalized: normalize("Liberec"), lat: 50.7663, lon: 15.0543, population: 104000 },
  { countryCode: "CZ", name: "Olomouc", normalized: normalize("Olomouc"), lat: 49.5938, lon: 17.2509, population: 100000 },
  { countryCode: "CZ", name: "České Budějovice", normalized: normalize("České Budějovice"), lat: 48.9745, lon: 14.4744, population: 94000 },
  { countryCode: "CZ", name: "Hradec Králové", normalized: normalize("Hradec Králové"), lat: 50.2104, lon: 15.8328, population: 93000 },
  { countryCode: "CZ", name: "Pardubice", normalized: normalize("Pardubice"), lat: 50.0343, lon: 15.7812, population: 90000 },
  { countryCode: "CZ", name: "Zlín", normalized: normalize("Zlín"), lat: 49.2331, lon: 17.6628, population: 75000 },

  // Slovakia
  { countryCode: "SK", name: "Bratislava", normalized: normalize("Bratislava"), lat: 48.1486, lon: 17.1077, population: 430000 },
  { countryCode: "SK", name: "Košice", normalized: normalize("Košice"), lat: 48.7164, lon: 21.2611, population: 240000 },
  { countryCode: "SK", name: "Prešov", normalized: normalize("Prešov"), lat: 48.9986, lon: 21.2391, population: 90000 },
  { countryCode: "SK", name: "Žilina", normalized: normalize("Žilina"), lat: 49.2231, lon: 18.7393, population: 85000 },
  { countryCode: "SK", name: "Banská Bystrica", normalized: normalize("Banská Bystrica"), lat: 48.7358, lon: 19.1461, population: 80000 },

  // Germany
  { countryCode: "DE", name: "Berlin", normalized: normalize("Berlin"), lat: 52.5200, lon: 13.4050, population: 3600000 },
  { countryCode: "DE", name: "Hamburg", normalized: normalize("Hamburg"), lat: 53.5511, lon: 9.9937, population: 1900000 },
  { countryCode: "DE", name: "Munich", normalized: normalize("Munich"), lat: 48.1351, lon: 11.5820, population: 1500000 },
  { countryCode: "DE", name: "Cologne", normalized: normalize("Cologne"), lat: 50.9375, lon: 6.9603, population: 1100000 },
  { countryCode: "DE", name: "Frankfurt", normalized: normalize("Frankfurt"), lat: 50.1109, lon: 8.6821, population: 750000 },
  { countryCode: "DE", name: "Stuttgart", normalized: normalize("Stuttgart"), lat: 48.7758, lon: 9.1829, population: 635000 },
  { countryCode: "DE", name: "Düsseldorf", normalized: normalize("Düsseldorf"), lat: 51.2277, lon: 6.7735, population: 620000 },
  { countryCode: "DE", name: "Leipzig", normalized: normalize("Leipzig"), lat: 51.3397, lon: 12.3731, population: 600000 },
  { countryCode: "DE", name: "Dresden", normalized: normalize("Dresden"), lat: 51.0504, lon: 13.7373, population: 555000 },

  // Austria
  { countryCode: "AT", name: "Vienna", normalized: normalize("Vienna"), lat: 48.2082, lon: 16.3738, population: 1900000 },
  { countryCode: "AT", name: "Graz", normalized: normalize("Graz"), lat: 47.0707, lon: 15.4395, population: 290000 },
  { countryCode: "AT", name: "Linz", normalized: normalize("Linz"), lat: 48.3064, lon: 14.2858, population: 206000 },
  { countryCode: "AT", name: "Salzburg", normalized: normalize("Salzburg"), lat: 47.8095, lon: 13.0550, population: 155000 },
  { countryCode: "AT", name: "Innsbruck", normalized: normalize("Innsbruck"), lat: 47.2692, lon: 11.4041, population: 132000 },

  // Poland
  { countryCode: "PL", name: "Warsaw", normalized: normalize("Warsaw"), lat: 52.2297, lon: 21.0122, population: 1800000 },
  { countryCode: "PL", name: "Kraków", normalized: normalize("Kraków"), lat: 50.0647, lon: 19.9450, population: 780000 },
  { countryCode: "PL", name: "Łódź", normalized: normalize("Łódź"), lat: 51.7592, lon: 19.4550, population: 680000 },
  { countryCode: "PL", name: "Wrocław", normalized: normalize("Wrocław"), lat: 51.1079, lon: 17.0385, population: 640000 },
  { countryCode: "PL", name: "Poznań", normalized: normalize("Poznań"), lat: 52.4064, lon: 16.9252, population: 540000 },
  { countryCode: "PL", name: "Gdańsk", normalized: normalize("Gdańsk"), lat: 54.3520, lon: 18.6466, population: 470000 },

  // Netherlands
  { countryCode: "NL", name: "Amsterdam", normalized: normalize("Amsterdam"), lat: 52.3676, lon: 4.9041, population: 870000 },
  { countryCode: "NL", name: "Rotterdam", normalized: normalize("Rotterdam"), lat: 51.9244, lon: 4.4777, population: 650000 },
  { countryCode: "NL", name: "The Hague", normalized: normalize("The Hague"), lat: 52.0705, lon: 4.3007, population: 545000 },
  { countryCode: "NL", name: "Utrecht", normalized: normalize("Utrecht"), lat: 52.0907, lon: 5.1214, population: 360000 },
  { countryCode: "NL", name: "Eindhoven", normalized: normalize("Eindhoven"), lat: 51.4416, lon: 5.4697, population: 235000 },

  // United Kingdom
  { countryCode: "GB", name: "London", normalized: normalize("London"), lat: 51.5074, lon: -0.1278, population: 9000000 },
  { countryCode: "GB", name: "Birmingham", normalized: normalize("Birmingham"), lat: 52.4862, lon: -1.8904, population: 1150000 },
  { countryCode: "GB", name: "Manchester", normalized: normalize("Manchester"), lat: 53.4808, lon: -2.2426, population: 550000 },
  { countryCode: "GB", name: "Leeds", normalized: normalize("Leeds"), lat: 53.8008, lon: -1.5491, population: 790000 },
  { countryCode: "GB", name: "Glasgow", normalized: normalize("Glasgow"), lat: 55.8642, lon: -4.2518, population: 635000 },
  { countryCode: "GB", name: "Edinburgh", normalized: normalize("Edinburgh"), lat: 55.9533, lon: -3.1883, population: 525000 },
  { countryCode: "GB", name: "Bristol", normalized: normalize("Bristol"), lat: 51.4545, lon: -2.5879, population: 465000 },
  { countryCode: "GB", name: "Liverpool", normalized: normalize("Liverpool"), lat: 53.4084, lon: -2.9916, population: 495000 },

  // France
  { countryCode: "FR", name: "Paris", normalized: normalize("Paris"), lat: 48.8566, lon: 2.3522, population: 2200000 },
  { countryCode: "FR", name: "Marseille", normalized: normalize("Marseille"), lat: 43.2965, lon: 5.3698, population: 870000 },
  { countryCode: "FR", name: "Lyon", normalized: normalize("Lyon"), lat: 45.7640, lon: 4.8357, population: 520000 },
  { countryCode: "FR", name: "Toulouse", normalized: normalize("Toulouse"), lat: 43.6047, lon: 1.4442, population: 480000 },
  { countryCode: "FR", name: "Nice", normalized: normalize("Nice"), lat: 43.7102, lon: 7.2620, population: 340000 },
  { countryCode: "FR", name: "Bordeaux", normalized: normalize("Bordeaux"), lat: 44.8378, lon: -0.5792, population: 260000 },

  // Spain
  { countryCode: "ES", name: "Madrid", normalized: normalize("Madrid"), lat: 40.4168, lon: -3.7038, population: 3300000 },
  { countryCode: "ES", name: "Barcelona", normalized: normalize("Barcelona"), lat: 41.3851, lon: 2.1734, population: 1600000 },
  { countryCode: "ES", name: "Valencia", normalized: normalize("Valencia"), lat: 39.4699, lon: -0.3763, population: 790000 },
  { countryCode: "ES", name: "Seville", normalized: normalize("Seville"), lat: 37.3891, lon: -5.9845, population: 690000 },
  { countryCode: "ES", name: "Bilbao", normalized: normalize("Bilbao"), lat: 43.2630, lon: -2.9350, population: 350000 },

  // Italy
  { countryCode: "IT", name: "Rome", normalized: normalize("Rome"), lat: 41.9028, lon: 12.4964, population: 2870000 },
  { countryCode: "IT", name: "Milan", normalized: normalize("Milan"), lat: 45.4642, lon: 9.1900, population: 1370000 },
  { countryCode: "IT", name: "Naples", normalized: normalize("Naples"), lat: 40.8518, lon: 14.2681, population: 960000 },
  { countryCode: "IT", name: "Turin", normalized: normalize("Turin"), lat: 45.0703, lon: 7.6869, population: 870000 },
  { countryCode: "IT", name: "Florence", normalized: normalize("Florence"), lat: 43.7696, lon: 11.2558, population: 380000 },
  { countryCode: "IT", name: "Venice", normalized: normalize("Venice"), lat: 45.4408, lon: 12.3155, population: 260000 },

  // Greece
  { countryCode: "GR", name: "Athens", normalized: normalize("Athens"), lat: 37.9838, lon: 23.7275, population: 660000 },
  { countryCode: "GR", name: "Thessaloniki", normalized: normalize("Thessaloniki"), lat: 40.6401, lon: 22.9444, population: 325000 },

  // United States
  { countryCode: "US", name: "New York", normalized: normalize("New York"), lat: 40.7128, lon: -74.0060, population: 8400000 },
  { countryCode: "US", name: "Los Angeles", normalized: normalize("Los Angeles"), lat: 34.0522, lon: -118.2437, population: 3970000 },
  { countryCode: "US", name: "Chicago", normalized: normalize("Chicago"), lat: 41.8781, lon: -87.6298, population: 2700000 },
  { countryCode: "US", name: "Houston", normalized: normalize("Houston"), lat: 29.7604, lon: -95.3698, population: 2300000 },
  { countryCode: "US", name: "Phoenix", normalized: normalize("Phoenix"), lat: 33.4484, lon: -112.0740, population: 1680000 },
  { countryCode: "US", name: "San Francisco", normalized: normalize("San Francisco"), lat: 37.7749, lon: -122.4194, population: 870000 },
  { countryCode: "US", name: "Seattle", normalized: normalize("Seattle"), lat: 47.6062, lon: -122.3321, population: 750000 },
  { countryCode: "US", name: "Denver", normalized: normalize("Denver"), lat: 39.7392, lon: -104.9903, population: 715000 },
  { countryCode: "US", name: "Boston", normalized: normalize("Boston"), lat: 42.3601, lon: -71.0589, population: 690000 },
  { countryCode: "US", name: "Miami", normalized: normalize("Miami"), lat: 25.7617, lon: -80.1918, population: 470000 },

  // Canada
  { countryCode: "CA", name: "Toronto", normalized: normalize("Toronto"), lat: 43.6532, lon: -79.3832, population: 2930000 },
  { countryCode: "CA", name: "Montreal", normalized: normalize("Montreal"), lat: 45.5017, lon: -73.5673, population: 1780000 },
  { countryCode: "CA", name: "Vancouver", normalized: normalize("Vancouver"), lat: 49.2827, lon: -123.1207, population: 675000 },
  { countryCode: "CA", name: "Calgary", normalized: normalize("Calgary"), lat: 51.0447, lon: -114.0719, population: 1340000 },
  { countryCode: "CA", name: "Ottawa", normalized: normalize("Ottawa"), lat: 45.4215, lon: -75.6972, population: 1000000 },

  // Australia
  { countryCode: "AU", name: "Sydney", normalized: normalize("Sydney"), lat: -33.8688, lon: 151.2093, population: 5300000 },
  { countryCode: "AU", name: "Melbourne", normalized: normalize("Melbourne"), lat: -37.8136, lon: 144.9631, population: 5000000 },
  { countryCode: "AU", name: "Brisbane", normalized: normalize("Brisbane"), lat: -27.4698, lon: 153.0251, population: 2500000 },
  { countryCode: "AU", name: "Perth", normalized: normalize("Perth"), lat: -31.9505, lon: 115.8605, population: 2100000 },
  { countryCode: "AU", name: "Adelaide", normalized: normalize("Adelaide"), lat: -34.9285, lon: 138.6007, population: 1350000 },

  // Switzerland
  { countryCode: "CH", name: "Zurich", normalized: normalize("Zurich"), lat: 47.3769, lon: 8.5417, population: 420000 },
  { countryCode: "CH", name: "Geneva", normalized: normalize("Geneva"), lat: 46.2044, lon: 6.1432, population: 200000 },
  { countryCode: "CH", name: "Basel", normalized: normalize("Basel"), lat: 47.5596, lon: 7.5886, population: 175000 },
  { countryCode: "CH", name: "Bern", normalized: normalize("Bern"), lat: 46.9480, lon: 7.4474, population: 135000 },

  // Belgium
  { countryCode: "BE", name: "Brussels", normalized: normalize("Brussels"), lat: 50.8503, lon: 4.3517, population: 185000 },
  { countryCode: "BE", name: "Antwerp", normalized: normalize("Antwerp"), lat: 51.2194, lon: 4.4025, population: 530000 },
  { countryCode: "BE", name: "Ghent", normalized: normalize("Ghent"), lat: 51.0543, lon: 3.7174, population: 262000 },

  // Sweden
  { countryCode: "SE", name: "Stockholm", normalized: normalize("Stockholm"), lat: 59.3293, lon: 18.0686, population: 980000 },
  { countryCode: "SE", name: "Gothenburg", normalized: normalize("Gothenburg"), lat: 57.7089, lon: 11.9746, population: 580000 },
  { countryCode: "SE", name: "Malmö", normalized: normalize("Malmö"), lat: 55.6050, lon: 13.0038, population: 320000 },

  // Norway
  { countryCode: "NO", name: "Oslo", normalized: normalize("Oslo"), lat: 59.9139, lon: 10.7522, population: 700000 },
  { countryCode: "NO", name: "Bergen", normalized: normalize("Bergen"), lat: 60.3913, lon: 5.3221, population: 285000 },

  // Denmark
  { countryCode: "DK", name: "Copenhagen", normalized: normalize("Copenhagen"), lat: 55.6761, lon: 12.5683, population: 640000 },
  { countryCode: "DK", name: "Aarhus", normalized: normalize("Aarhus"), lat: 56.1629, lon: 10.2039, population: 280000 },

  // Finland
  { countryCode: "FI", name: "Helsinki", normalized: normalize("Helsinki"), lat: 60.1699, lon: 24.9384, population: 655000 },
  { countryCode: "FI", name: "Espoo", normalized: normalize("Espoo"), lat: 60.2055, lon: 24.6559, population: 290000 },

  // Portugal
  { countryCode: "PT", name: "Lisbon", normalized: normalize("Lisbon"), lat: 38.7223, lon: -9.1393, population: 545000 },
  { countryCode: "PT", name: "Porto", normalized: normalize("Porto"), lat: 41.1579, lon: -8.6291, population: 240000 },

  // Ireland
  { countryCode: "IE", name: "Dublin", normalized: normalize("Dublin"), lat: 53.3498, lon: -6.2603, population: 555000 },
  { countryCode: "IE", name: "Cork", normalized: normalize("Cork"), lat: 51.8985, lon: -8.4756, population: 125000 },

  // Hungary
  { countryCode: "HU", name: "Budapest", normalized: normalize("Budapest"), lat: 47.4979, lon: 19.0402, population: 1750000 },
  { countryCode: "HU", name: "Debrecen", normalized: normalize("Debrecen"), lat: 47.5316, lon: 21.6273, population: 200000 },

  // Romania
  { countryCode: "RO", name: "Bucharest", normalized: normalize("Bucharest"), lat: 44.4268, lon: 26.1025, population: 1880000 },
  { countryCode: "RO", name: "Cluj-Napoca", normalized: normalize("Cluj-Napoca"), lat: 46.7712, lon: 23.6236, population: 325000 },

  // Croatia
  { countryCode: "HR", name: "Zagreb", normalized: normalize("Zagreb"), lat: 45.8150, lon: 15.9819, population: 800000 },
  { countryCode: "HR", name: "Split", normalized: normalize("Split"), lat: 43.5081, lon: 16.4402, population: 170000 },

  // Slovenia
  { countryCode: "SI", name: "Ljubljana", normalized: normalize("Ljubljana"), lat: 46.0569, lon: 14.5058, population: 280000 },

  // Bulgaria
  { countryCode: "BG", name: "Sofia", normalized: normalize("Sofia"), lat: 42.6977, lon: 23.3219, population: 1240000 },
  { countryCode: "BG", name: "Plovdiv", normalized: normalize("Plovdiv"), lat: 42.1354, lon: 24.7453, population: 345000 },

  // Ukraine
  { countryCode: "UA", name: "Kyiv", normalized: normalize("Kyiv"), lat: 50.4501, lon: 30.5234, population: 2960000 },
  { countryCode: "UA", name: "Lviv", normalized: normalize("Lviv"), lat: 49.8397, lon: 24.0297, population: 720000 },
  { countryCode: "UA", name: "Odessa", normalized: normalize("Odessa"), lat: 46.4825, lon: 30.7233, population: 1000000 },
]
