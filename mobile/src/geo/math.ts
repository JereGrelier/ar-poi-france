/** Earth-radius haversine distance in meters. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Initial bearing from point A to B, degrees [0, 360). */
export function bearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Normalize angle difference to [-180, 180]. */
export function normalizeDeltaDegrees(delta: number): number {
  let d = ((delta + 180) % 360) - 180;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Relative azimuth of a POI vs device heading, degrees in [-180, 180].
 * Negative = left of center, positive = right.
 */
export function relativeBearing(
  userLat: number,
  userLon: number,
  heading: number,
  poiLat: number,
  poiLon: number,
): number {
  const bearing = bearingDegrees(userLat, userLon, poiLat, poiLon);
  return normalizeDeltaDegrees(bearing - heading);
}

export type ScreenProjection = {
  visible: boolean;
  x: number;
  y: number;
  scale: number;
  distanceM: number;
};

/** Project POI onto camera overlay using heading + assumed FOV. */
export function projectToScreen(params: {
  userLat: number;
  userLon: number;
  heading: number;
  poiLat: number;
  poiLon: number;
  screenWidth: number;
  screenHeight: number;
  halfFovDeg: number;
}): ScreenProjection {
  const distanceM = haversineMeters(
    params.userLat,
    params.userLon,
    params.poiLat,
    params.poiLon,
  );
  const rel = relativeBearing(
    params.userLat,
    params.userLon,
    params.heading,
    params.poiLat,
    params.poiLon,
  );
  const visible = Math.abs(rel) <= params.halfFovDeg;
  const x =
    params.screenWidth / 2 +
    (rel / params.halfFovDeg) * (params.screenWidth / 2);
  const depthT = Math.min(distanceM / 1000, 1);
  const y = params.screenHeight * (0.35 + depthT * 0.25);
  const scale = Math.max(0.65, 1.25 - depthT);
  return { visible, x, y, scale, distanceM };
}
