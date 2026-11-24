import {
  isPoiDetailResponse,
  isPoiListResponse,
  type Poi,
  type PoiListResponse,
} from "@ar-poi/shared";
import { API_BASE_URL } from "../config";

export async function fetchNearbyPois(params: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  type?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}): Promise<PoiListResponse> {
  const query = new URLSearchParams({
    lat: String(params.latitude),
    lon: String(params.longitude),
    radius: String(params.radiusMeters),
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 50),
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
