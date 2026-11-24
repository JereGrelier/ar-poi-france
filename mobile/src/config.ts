/** Proxy URL — on a physical device, replace localhost with your machine LAN IP. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8787";

/**
 * When "1", GPS denial/errors fall back to Paris (Tour Eiffel) with a visible banner.
 * Default off — no silent demo location.
 */
export const DEMO_FALLBACK =
  process.env.EXPO_PUBLIC_DEMO_FALLBACK === "1" ||
  process.env.EXPO_PUBLIC_DEMO_FALLBACK === "true";

export const DEFAULT_RADIUS_M = 500;
export const RADIUS_OPTIONS_M = [200, 500, 1000, 2000] as const;
export const TYPE_FILTERS = [
  { label: "Tous", value: "" },
  { label: "Musée", value: "Museum" },
  { label: "Monument", value: "Monument" },
  { label: "Culture", value: "CulturalSite" },
  { label: "Restaurant", value: "Restaurant" },
] as const;

/** Horizontal half-FOV for label projection (degrees). Typical phone ~60° full ≈ 30 half. */
export const CAMERA_HALF_FOV_H_DEG = 30;
/** Vertical half-FOV (degrees). */
export const CAMERA_HALF_FOV_V_DEG = 22;

/** @deprecated use CAMERA_HALF_FOV_H_DEG */
export const CAMERA_HALF_FOV_DEG = CAMERA_HALF_FOV_H_DEG;
