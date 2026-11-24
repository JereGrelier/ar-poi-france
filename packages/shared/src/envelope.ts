import type { PoiDetailResponse, PoiListResponse } from "./types.js";

export function isPoiListResponse(value: unknown): value is PoiListResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.success !== "boolean" ||
    !Array.isArray(v.data) ||
    !(v.error === null || typeof v.error === "string") ||
    typeof v.meta !== "object" ||
    v.meta === null
  ) {
    return false;
  }
  const meta = v.meta as Record<string, unknown>;
  return (
    typeof meta.total === "number" &&
    (meta.source === "datatourisme" || meta.source === "mock") &&
    typeof meta.radiusMeters === "number" &&
    typeof meta.page === "number" &&
    typeof meta.pageSize === "number" &&
    typeof meta.truncated === "boolean"
  );
}

export function isPoiDetailResponse(
  value: unknown,
): value is PoiDetailResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.success === "boolean" &&
    (v.data === null || typeof v.data === "object") &&
    (v.error === null || typeof v.error === "string")
  );
}
