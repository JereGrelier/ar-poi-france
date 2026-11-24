import {
  bearingDegrees,
  haversineMeters,
  normalizeDeltaDegrees,
  projectToScreen,
  relativeBearing,
} from "@ar-poi/shared";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const d = haversineMeters(48.8584, 2.2945, 48.8606, 2.3376);
assert(d > 2000 && d < 4000, `Louvre–Eiffel distance unexpected: ${d}`);

const bearing = bearingDegrees(48.8584, 2.2945, 48.8606, 2.3376);
assert(bearing > 60 && bearing < 120, `bearing unexpected: ${bearing}`);

assert(Math.abs(normalizeDeltaDegrees(350) - -10) < 0.01, "normalize wrap");

const rel = relativeBearing(48.8584, 2.2945, bearing, 48.8606, 2.3376);
assert(
  Math.abs(rel) < 1,
  `relative bearing should be ~0 when facing POI: ${rel}`,
);

const proj = projectToScreen({
  userLat: 48.8584,
  userLon: 2.2945,
  heading: bearing,
  pitch: 0,
  poiLat: 48.8606,
  poiLon: 2.3376,
  screenWidth: 390,
  screenHeight: 844,
  halfFovHDeg: 30,
});
assert(proj.visible, "POI ahead should be visible");
assert(Math.abs(proj.x - 195) < 5, `x should be near center: ${proj.x}`);

console.log("mobile geo selfCheck OK", {
  d: Math.round(d),
  bearing: Math.round(bearing),
});
