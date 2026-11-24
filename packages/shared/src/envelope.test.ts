import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPoiDetailResponse, isPoiListResponse } from "./envelope.js";

describe("isPoiListResponse", () => {
  it("accepts valid envelope with pagination meta", () => {
    assert.equal(
      isPoiListResponse({
        success: true,
        data: [],
        error: null,
        meta: {
          total: 0,
          source: "mock",
          radiusMeters: 500,
          page: 1,
          pageSize: 50,
          truncated: false,
        },
      }),
      true,
    );
  });

  it("rejects missing truncated", () => {
    assert.equal(
      isPoiListResponse({
        success: true,
        data: [],
        error: null,
        meta: {
          total: 0,
          source: "mock",
          radiusMeters: 500,
          page: 1,
          pageSize: 50,
        },
      }),
      false,
    );
  });
});

describe("isPoiDetailResponse", () => {
  it("accepts null data", () => {
    assert.equal(
      isPoiDetailResponse({ success: false, data: null, error: "missing" }),
      true,
    );
  });

  it("rejects garbage", () => {
    assert.equal(isPoiDetailResponse({ ok: true }), false);
  });
});
