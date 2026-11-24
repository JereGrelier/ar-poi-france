/**
 * Minimal runnable geo check. Run: npm run check --workspace=@ar-poi/shared
 */
import {
  bearingDegrees,
  haversineMeters,
  normalizeDeltaDegrees,
  projectToScreen,
  relativeBearing,
  resolveLabelCollisions,
} from "./geo.js";

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

const kept = resolveLabelCollisions([
  { id: "a", x: 100, y: 100, scale: 1, distanceM: 50 },
  { id: "b", x: 110, y: 105, scale: 1, distanceM: 200 },
  { id: "c", x: 300, y: 300, scale: 1, distanceM: 80 },
]);
assert(kept.length === 2, `expected 2 after collision, got ${kept.length}`);
assert(kept[0]?.id === "a", "nearer label should win");

console.log("shared geo selfCheck OK", {
  d: Math.round(d),
  bearing: Math.round(bearing),
});
