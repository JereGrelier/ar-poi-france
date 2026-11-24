export type Poi = {
  id: string;
  name: string;
  types: string[];
  latitude: number;
  longitude: number;
  description: string | null;
  imageUrl: string | null;
  address: string | null;
};

export type PoiListMeta = {
  total: number;
  source: "datatourisme" | "mock";
  radiusMeters: number;
  page: number;
  pageSize: number;
  truncated: boolean;
};

export type PoiListResponse = {
  success: boolean;
  data: Poi[];
  error: string | null;
  meta: PoiListMeta;
};

export type PoiDetailResponse = {
  success: boolean;
  data: Poi | null;
  error: string | null;
};

/** Device pose for location-based AR. Pitch: degrees, 0 = level, + = looking up. */
export type UserPose = {
  latitude: number;
  longitude: number;
  heading: number;
  pitch: number;
};
