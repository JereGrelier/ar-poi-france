import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { filterMockPois, MOCK_POIS } from "./mockPois.js";
import { mapDatatourismePoi } from "./mapPoi.js";
import type { Poi, PoiDetailResponse, PoiListResponse } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = Number(process.env.PORT ?? 8787);
const API_KEY = process.env.DATATOURISME_API_KEY?.trim() ?? "";
const MOCK_MODE =
  process.env.MOCK_MODE === "1" || process.env.MOCK_MODE === "true" || !API_KEY;
const DT_BASE = "https://api.datatourisme.fr/v1";

const DEFAULT_FIELDS = [
  "uuid",
  "label",
  "type",
  "isLocatedAt.geo",
  "isLocatedAt.address",
  "hasDescription",
  "hasMainRepresentation",
].join(",");

const cache = new Map<string, { at: number; payload: PoiListResponse }>();
const CACHE_TTL_MS = 60_000;
const CACHE_MAX = 50;

function setCache(key: string, payload: PoiListResponse) {
  cache.set(key, { at: Date.now(), payload });
  if (cache.size <= CACHE_MAX) return;
  const oldest = cache.keys().next().value;
  if (oldest) cache.delete(oldest);
}

const app = express();
app.use(cors());
app.use(express.json());

function parseNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function envelopeList(
  data: Poi[],
  meta: PoiListResponse["meta"],
  error: string | null = null,
): PoiListResponse {
  return {
    success: error === null,
    data,
    error,
    meta,
  };
}

async function fetchDatatourismeNearby(
  lat: number,
  lon: number,
  radiusMeters: number,
  typeFilter?: string,
): Promise<Poi[]> {
  const params = new URLSearchParams({
    geo_distance: `${lat},${lon},${Math.round(radiusMeters)}m`,
    page_size: "50",
    lang: "fr",
    fields: DEFAULT_FIELDS,
  });
  if (typeFilter) {
    params.set("filters", `type[text]=${typeFilter}`);
  }

  const response = await fetch(`${DT_BASE}/catalog?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`DATAtourisme upstream error (${response.status})`);
  }

  const json = (await response.json()) as { objects?: unknown[] };
  const objects = Array.isArray(json.objects) ? json.objects : [];
  return objects
    .map((obj) => mapDatatourismePoi(obj as Record<string, unknown>))
    .filter((poi): poi is Poi => poi !== null);
}

async function fetchDatatourismeById(id: string): Promise<Poi | null> {
  const response = await fetch(`${DT_BASE}/catalog/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`DATAtourisme upstream error (${response.status})`);
  }
  const json = (await response.json()) as Record<string, unknown>;
  return mapDatatourismePoi(json);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    mockMode: MOCK_MODE,
    hasApiKey: Boolean(API_KEY),
  });
});

app.get("/api/pois", async (req, res) => {
  const lat = parseNumber(req.query.lat, NaN);
  const lon = parseNumber(req.query.lon, NaN);
  const radiusMeters = Math.min(
    Math.max(parseNumber(req.query.radius, 500), 50),
    5000,
  );
  const typeFilter =
    typeof req.query.type === "string" && req.query.type.trim()
      ? req.query.type.trim()
      : undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    const payload = envelopeList(
      [],
      {
        total: 0,
        source: MOCK_MODE ? "mock" : "datatourisme",
        radiusMeters,
      },
      "lat and lon are required",
    );
    res.status(400).json(payload);
    return;
  }

  const cacheKey = `${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusMeters}:${typeFilter ?? ""}:${MOCK_MODE}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.json(cached.payload);
    return;
  }

  try {
    const data = MOCK_MODE
      ? filterMockPois(lat, lon, radiusMeters, typeFilter)
      : await fetchDatatourismeNearby(lat, lon, radiusMeters, typeFilter);

    const payload = envelopeList(data, {
      total: data.length,
      source: MOCK_MODE ? "mock" : "datatourisme",
      radiusMeters,
    });
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(502).json(
      envelopeList(
        [],
        {
          total: 0,
          source: "datatourisme",
          radiusMeters,
        },
        message,
      ),
    );
  }
});

app.get("/api/pois/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let poi: Poi | null = null;
    if (MOCK_MODE) {
      poi = MOCK_POIS.find((p) => p.id === id) ?? null;
    } else {
      poi = await fetchDatatourismeById(id);
    }

    const payload: PoiDetailResponse = {
      success: poi !== null,
      data: poi,
      error: poi ? null : "POI not found",
    };
    res.status(poi ? 200 : 404).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const payload: PoiDetailResponse = {
      success: false,
      data: null,
      error: message,
    };
    res.status(502).json(payload);
  }
});

app.listen(PORT, () => {
  console.log(
    `[ar-map-proxy] http://localhost:${PORT} mock=${MOCK_MODE} key=${Boolean(API_KEY)}`,
  );
  if (!API_KEY) {
    console.log(
      "[ar-map-proxy] No DATATOURISME_API_KEY — using MOCK_MODE. Get a key: https://www.datatourisme.fr/utiliser-les-donnees",
    );
  }
});
