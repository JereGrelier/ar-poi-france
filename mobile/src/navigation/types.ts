import type { Poi } from "../types";

export type RootStackParamList = {
  List: undefined;
  Ar: undefined;
  PoiDetail: { poiId: string; poi?: Poi };
};
