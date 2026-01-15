export type CityOption = { label: string; iana: string };

export const CITY_OPTIONS: CityOption[] = [
  { label: "Tokyo", iana: "Asia/Tokyo" },
  { label: "New York", iana: "America/New_York" },
  { label: "London", iana: "Europe/London" },
  { label: "Paris", iana: "Europe/Paris" },
  { label: "Berlin", iana: "Europe/Berlin" },
  { label: "Singapore", iana: "Asia/Singapore" },
  { label: "Sydney", iana: "Australia/Sydney" },
  { label: "Seoul", iana: "Asia/Seoul" },
  { label: "Los Angeles", iana: "America/Los_Angeles" },
  { label: "San Francisco", iana: "America/Los_Angeles" },
  { label: "Chicago", iana: "America/Chicago" },
  { label: "Toronto", iana: "America/Toronto" },
  { label: "Vancouver", iana: "America/Vancouver" },
  { label: "Bangalore", iana: "Asia/Kolkata" },
  { label: "Delhi", iana: "Asia/Kolkata" },
  { label: "Dubai", iana: "Asia/Dubai" },
  { label: "Hong Kong", iana: "Asia/Hong_Kong" },
  { label: "Taipei", iana: "Asia/Taipei" },
  { label: "Shanghai", iana: "Asia/Shanghai" }
];

// labelの揺れ対策（必要なら拡張）
export function findCityOption(label: string): CityOption | undefined {
  const normalized = label.trim().toLowerCase();
  return CITY_OPTIONS.find(c => c.label.toLowerCase() === normalized);
}
