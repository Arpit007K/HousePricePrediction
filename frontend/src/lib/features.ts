// Feature names and order come from train.py (sklearn's fetch_california_housing)
// and are mirrored by the HouseFeatures schema in main.py.
export const FEATURE_KEYS = [
  "MedInc",
  "HouseAge",
  "AveRooms",
  "AveBedrms",
  "Population",
  "AveOccup",
  "Latitude",
  "Longitude",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type HouseFeatures = Record<FeatureKey, number>;

export interface FeatureSpec {
  key: FeatureKey;
  label: string;
  hint: string;
  placeholder: string;
}

export const FEATURE_SPECS: FeatureSpec[] = [
  { key: "MedInc", label: "Median income", hint: "In tens of thousands of dollars (3.5 = $35,000)", placeholder: "3.87" },
  { key: "HouseAge", label: "Median house age", hint: "Years", placeholder: "29" },
  { key: "AveRooms", label: "Average rooms", hint: "Rooms per household", placeholder: "5.4" },
  { key: "AveBedrms", label: "Average bedrooms", hint: "Bedrooms per household", placeholder: "1.1" },
  { key: "Population", label: "Population", hint: "Residents in the block group", placeholder: "1425" },
  { key: "AveOccup", label: "Average occupancy", hint: "People per household, above 0", placeholder: "3.07" },
  { key: "Latitude", label: "Latitude", hint: "Between 32 and 42", placeholder: "34.05" },
  { key: "Longitude", label: "Longitude", hint: "Between -125 and -114", placeholder: "-118.25" },
];

// First row of the California Housing dataset, a real record.
export const EXAMPLE: Record<FeatureKey, string> = {
  MedInc: "8.3252",
  HouseAge: "41",
  AveRooms: "6.984127",
  AveBedrms: "1.023810",
  Population: "322",
  AveOccup: "2.555556",
  Latitude: "37.88",
  Longitude: "-122.23",
};

/** Same rules as the Pydantic schema in main.py and the checks in /predict-file. */
export function checkRange(key: FeatureKey, n: number): string | null {
  switch (key) {
    case "AveOccup":
      return n > 0 ? null : "Must be greater than 0";
    case "Latitude":
      return n >= 32 && n <= 42 ? null : "Must be between 32 and 42";
    case "Longitude":
      return n >= -125 && n <= -114 ? null : "Must be between -125 and -114";
    default:
      return n >= 0 ? null : "Cannot be negative";
  }
}

export function validateRaw(key: FeatureKey, raw: string): string | null {
  if (raw.trim() === "") return "Required";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "Enter a valid number";
  return checkRange(key, n);
}
