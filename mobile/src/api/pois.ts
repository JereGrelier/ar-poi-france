import { API_BASE_URL } from "../config";
import type { Poi, PoiDetailResponse, PoiListResponse } from "../types";

function isPoiListResponse(value: unknown): value is PoiListResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.success === "boolean" &&
    Array.isArray(v.data) &&
    (v.error === null || typeof v.error === "string") &&
    typeof v.meta === "object" &&
    v.meta !== null
  );
}

function isPoiDetailResponse(value: unknown): value is PoiDetailResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.success === "boolean" &&
    (v.data === null || typeof v.data === "object") &&
    (v.error === null || typeof v.error === "string")
  );
}

export async function fetchNearbyPois(params: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type?: string;
  signal?: AbortSignal;
}): Promise<PoiListResponse> {
  const query = new URLSearchParams({
    lat: String(params.latitude),
    lon: String(params.longitude),
    radius: String(params.radiusMeters),
  });
  if (params.type) query.set("type", params.type);

  const response = await fetch(`${API_BASE_URL}/api/pois?${query.toString()}`, {
    signal: params.signal,
  });
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(`POI fetch failed (${response.status}): invalid JSON`);
  }
  if (!isPoiListResponse(json)) {
    throw new Error(`POI fetch failed (${response.status}): bad envelope`);
  }
  if (!response.ok || !json.success) {
    throw new Error(json.error ?? `POI fetch failed (${response.status})`);
  }
  return json;
}

export async function fetchPoiById(id: string): Promise<Poi> {
  const response = await fetch(
    `${API_BASE_URL}/api/pois/${encodeURIComponent(id)}`,
  );
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(`POI detail failed (${response.status}): invalid JSON`);
  }
  if (!isPoiDetailResponse(json)) {
    throw new Error(`POI detail failed (${response.status}): bad envelope`);
  }
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error ?? `POI detail failed (${response.status})`);
  }
  return json.data;
}
