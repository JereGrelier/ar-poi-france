import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapDatatourismePoi } from "./mapPoi.js";

describe("mapDatatourismePoi", () => {
  it("maps a minimal DATAtourisme object", () => {
    const poi = mapDatatourismePoi({
      uuid: "abc-123",
      label: { "@fr": "Musée Test" },
      type: ["https://www.datatourisme.fr/ontology/core#Museum"],
      isLocatedAt: [
        {
          geo: { latitude: 48.86, longitude: 2.34 },
          address: {
            streetAddress: "1 rue Test",
            postalCode: "75001",
            hasAddressCity: { "rdfs:label": "Paris" },
          },
        },
      ],
      hasDescription: [{ shortDescription: "Une description" }],
      hasMainRepresentation: [{ contentUrl: "https://example.com/img.jpg" }],
    });
    assert.ok(poi);
    assert.equal(poi?.id, "abc-123");
    assert.equal(poi?.name, "Musée Test");
    assert.deepEqual(poi?.types, ["core#Museum"]);
    assert.equal(poi?.latitude, 48.86);
    assert.equal(poi?.description, "Une description");
    assert.equal(poi?.imageUrl, "https://example.com/img.jpg");
    assert.match(poi?.address ?? "", /rue Test/);
  });

  it("returns null without geo", () => {
    assert.equal(mapDatatourismePoi({ uuid: "x", label: "No geo" }), null);
  });
});
