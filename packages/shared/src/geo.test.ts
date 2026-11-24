import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bearingDegrees,
  haversineMeters,
  normalizeDeltaDegrees,
  projectToScreen,
  relativeBearing,
  resolveLabelCollisions,
} from "./geo.js";

describe("haversineMeters", () => {
  it("estimates Louvre–Eiffel ~3 km", () => {
    const d = haversineMeters(48.8584, 2.2945, 48.8606, 2.3376);
    assert.ok(d > 2000 && d < 4000);
  });
});

describe("bearing + relative", () => {
  it("relative bearing ~0 when facing POI", () => {
    const bearing = bearingDegrees(48.8584, 2.2945, 48.8606, 2.3376);
    const rel = relativeBearing(48.8584, 2.2945, bearing, 48.8606, 2.3376);
    assert.ok(Math.abs(rel) < 1);
  });

  it("normalize wraps across 360", () => {
    assert.ok(Math.abs(normalizeDeltaDegrees(350) - -10) < 0.01);
  });
});

describe("projectToScreen", () => {
  it("centers POI ahead and uses pitch for y", () => {
    const bearing = bearingDegrees(48.8584, 2.2945, 48.8606, 2.3376);
    const level = projectToScreen({
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
    const lookingUp = projectToScreen({
      userLat: 48.8584,
      userLon: 2.2945,
      heading: bearing,
      pitch: 20,
      poiLat: 48.8606,
      poiLon: 2.3376,
      screenWidth: 390,
      screenHeight: 844,
      halfFovHDeg: 30,
    });
    assert.equal(level.visible, true);
    assert.ok(Math.abs(level.x - 195) < 5);
    assert.ok(lookingUp.y > level.y);
  });
});

describe("resolveLabelCollisions", () => {
  it("keeps nearer label when overlapping", () => {
    const kept = resolveLabelCollisions([
      { id: "far", x: 100, y: 100, scale: 1, distanceM: 500 },
      { id: "near", x: 105, y: 100, scale: 1, distanceM: 40 },
    ]);
    assert.deepEqual(
      kept.map((k) => k.id),
      ["near"],
    );
  });
});
