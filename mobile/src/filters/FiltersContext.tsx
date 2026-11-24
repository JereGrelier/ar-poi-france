import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Poi, PoiListMeta } from "@ar-poi/shared";
import { fetchNearbyPois } from "../api/pois";
import { DEFAULT_RADIUS_M } from "../config";
import { usePose } from "../pose/PoseContext";

type FiltersContextValue = {
  radiusMeters: number;
  typeFilter: string;
  setRadiusMeters: (radius: number) => void;
  setTypeFilter: (type: string) => void;
  pois: Poi[];
  meta: PoiListMeta | null;
  loading: boolean;
  error: string | null;
  refresh: (signal?: AbortSignal) => Promise<void>;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const { pose, ready } = usePose();
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_M);
  const [typeFilter, setTypeFilter] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const [meta, setMeta] = useState<PoiListMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = pose?.latitude;
  const lon = pose?.longitude;

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (lat == null || lon == null) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchNearbyPois({
          latitude: lat,
          longitude: lon,
          radiusMeters,
          type: typeFilter || undefined,
          signal,
        });
        if (signal?.aborted) return;
        setPois(response.data);
        setMeta(response.meta);
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Erreur chargement POI");
        setPois([]);
        setMeta(null);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [lat, lon, radiusMeters, typeFilter],
  );

  useEffect(() => {
    if (!ready || lat == null || lon == null) return;
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [ready, lat, lon, refresh]);

  const value = useMemo(
    () => ({
      radiusMeters,
      typeFilter,
      setRadiusMeters,
      setTypeFilter,
      pois,
      meta,
      loading,
      error,
      refresh,
    }),
    [radiusMeters, typeFilter, pois, meta, loading, error, refresh],
  );

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
}

export function useFilters(): FiltersContextValue {
  const ctx = useContext(FiltersContext);
  if (!ctx) {
    throw new Error("useFilters must be used within FiltersProvider");
  }
  return ctx;
}
