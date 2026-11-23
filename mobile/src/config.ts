/** Proxy URL — on a physical device, replace localhost with your machine LAN IP. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

export const DEFAULT_RADIUS_M = 500;
export const RADIUS_OPTIONS_M = [200, 500, 1000, 2000] as const;
export const TYPE_FILTERS = [
  { label: "Tous", value: "" },
  { label: "Musée", value: "Museum" },
  { label: "Monument", value: "Monument" },
  { label: "Culture", value: "CulturalSite" },
  { label: "Restaurant", value: "Restaurant" },
] as const;

/** Horizontal FOV assumed for label projection (degrees). */
export const CAMERA_HALF_FOV_DEG = 30;
