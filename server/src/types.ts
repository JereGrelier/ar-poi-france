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

export type PoiListResponse = {
  success: boolean;
  data: Poi[];
  error: string | null;
  meta: {
    total: number;
    source: "datatourisme" | "mock";
    radiusMeters: number;
  };
};

export type PoiDetailResponse = {
  success: boolean;
  data: Poi | null;
  error: string | null;
};
