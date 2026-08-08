// BI_WEBSITE_US_APPLICATIONS_v22
export type CountryCode = "CA" | "US";

export const COUNTRY_OPTIONS: ReadonlyArray<{ value: CountryCode; label: string }> = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
];

/** Canada, less Quebec—the carrier does not write PGI there. */
export const CA_REGIONS = [
  { value: "AB", label: "Alberta" }, { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" }, { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" }, { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" }, { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" }, { value: "PE", label: "Prince Edward Island" },
  { value: "SK", label: "Saskatchewan" }, { value: "YT", label: "Yukon" },
] as const;

export const US_REGIONS = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" }, { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" }, { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" }, { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" }, { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" }, { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" }, { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" }, { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

/** Normalizes legacy and current stored country values to a country code. */
export function toCountryCode(value: unknown): CountryCode {
  const raw = String(value ?? "").trim().toUpperCase();
  return raw === "US" || raw === "USA" || raw === "UNITED STATES" ? "US" : "CA";
}

export function regionsFor(country: CountryCode) {
  return country === "US" ? US_REGIONS : CA_REGIONS;
}

export function regionLabel(country: CountryCode): string {
  return country === "US" ? "State" : "Province";
}

export function postalLabel(country: CountryCode): string {
  return country === "US" ? "ZIP code" : "Postal code";
}

/** Formats Canadian postal codes and US five- or nine-digit ZIP codes. */
export function normalizePostal(country: CountryCode, raw: string): string {
  const value = String(raw ?? "");
  if (country === "US") {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return cleaned.length > 3 ? `${cleaned.slice(0, 3)} ${cleaned.slice(3)}` : cleaned;
}

export function isValidPostal(country: CountryCode, raw: string): boolean {
  const value = String(raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (!value) return false;
  return country === "US"
    ? /^\d{5}(-?\d{4})?$/.test(value)
    : /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\d[ABCEGHJ-NPRSTV-Z]\d$/.test(value);
}
