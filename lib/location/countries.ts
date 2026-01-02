export interface Country {
  code: string
  name: string
}

export const COUNTRIES: Country[] = [
  // Europe
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "GB", name: "United Kingdom" },
  { code: "UA", name: "Ukraine" },

  // North America
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "US", name: "United States" },

  // South America
  { code: "AR", name: "Argentina" },
  { code: "BR", name: "Brazil" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },

  // Asia Pacific
  { code: "AU", name: "Australia" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "JP", name: "Japan" },
  { code: "MY", name: "Malaysia" },
  { code: "NZ", name: "New Zealand" },
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
  { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },

  // Middle East & Africa
  { code: "EG", name: "Egypt" },
  { code: "IL", name: "Israel" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
].sort((a, b) => a.name.localeCompare(b.name))

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code)
}

export function getCountryNameByCode(code: string): string | undefined {
  return getCountryByCode(code)?.name
}
