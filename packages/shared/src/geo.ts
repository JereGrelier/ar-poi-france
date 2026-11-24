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
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
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

/**
 * Project POI onto camera overlay using heading + pitch + FOV.
 * Ceiling: flat-earth bearing model; upgrade path = ARKit/ARCore anchors.
 */
export function projectToScreen(params: {
  userLat: number;
  userLon: number;
  heading: number;
  pitch?: number;
  poiLat: number;
  poiLon: number;
  screenWidth: number;
  screenHeight: number;
  halfFovHDeg: number;
  halfFovVDeg?: number;
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
  const halfFovH = params.halfFovHDeg;
  const halfFovV = params.halfFovVDeg ?? halfFovH * 0.75;
  const pitch = params.pitch ?? 0;

  // Distant POIs sit near horizon (~0° elevation); closer ones slightly below.
  const elevationDeg = -Math.min(distanceM / 80, 12);
  const relPitch = elevationDeg - pitch;

  const visibleH = Math.abs(rel) <= halfFovH;
  const visibleV = Math.abs(relPitch) <= halfFovV;
  const visible = visibleH && visibleV;

  const x =
    params.screenWidth / 2 + (rel / halfFovH) * (params.screenWidth / 2);
  const y =
    params.screenHeight / 2 +
    (-relPitch / halfFovV) * (params.screenHeight / 2);
  const depthT = Math.min(distanceM / 1000, 1);
  const scale = Math.max(0.65, 1.25 - depthT);
  return { visible, x, y, scale, distanceM };
}

export type PlacedLabel = {
  id: string;
  x: number;
  y: number;
  scale: number;
  distanceM: number;
};

/** Greedy collision: keep nearer labels; drop overlaps within minGap px. */
export function resolveLabelCollisions(
  candidates: PlacedLabel[],
  minGapPx = 56,
): PlacedLabel[] {
  const sorted = [...candidates].sort((a, b) => a.distanceM - b.distanceM);
  const kept: PlacedLabel[] = [];
  for (const c of sorted) {
    const overlaps = kept.some((k) => {
      const dx = c.x - k.x;
      const dy = c.y - k.y;
      return Math.hypot(dx, dy) < minGapPx;
    });
    if (!overlaps) kept.push(c);
  }
  return kept;
}
