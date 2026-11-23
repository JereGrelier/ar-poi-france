/**
 * Minimal runnable check for haversine used by mock filter.
 * Run: npm run check
 */
import { filterMockPois } from "./mockPois.js";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const nearEiffel = filterMockPois(48.8584, 2.2945, 200);
assert(
  nearEiffel.some((p) => p.id === "mock-tour-eiffel"),
  "expected Tour Eiffel within 200m of itself",
);

const museums = filterMockPois(48.86, 2.33, 2000, "Museum");
assert(
  museums.every((p) => p.types.some((t) => t.toLowerCase().includes("museum"))),
  "type filter must only return museums",
);

console.log("geoSelfCheck OK", {
  nearEiffel: nearEiffel.length,
  museums: museums.map((m) => m.name),
});
