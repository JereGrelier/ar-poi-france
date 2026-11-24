import type { Poi } from "@ar-poi/shared";

type RawPoi = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = firstString(item);
      if (nested) return nested;
    }
  }
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record["@fr"] === "string") return record["@fr"];
  if (typeof record.fr === "string") return record.fr;
  if (typeof record["@value"] === "string") return record["@value"];
  for (const v of Object.values(record)) {
    const nested = firstString(v);
    if (nested) return nested;
  }
  return null;
}

function extractTypes(raw: RawPoi): string[] {
  const typeValue = raw.type;
  if (typeof typeValue === "string") {
    return [typeValue.split("/").pop() ?? typeValue];
  }
  if (Array.isArray(typeValue)) {
    return typeValue
      .map((t) => {
        if (typeof t !== "string") return null;
        return t.split("/").pop() ?? t;
      })
      .filter((t): t is string => Boolean(t));
  }
  return [];
}

function extractGeo(
  raw: RawPoi,
): { latitude: number; longitude: number } | null {
  const located = raw.isLocatedAt;
  const locations = Array.isArray(located) ? located : located ? [located] : [];
  for (const loc of locations) {
    const locRec = asRecord(loc);
    if (!locRec) continue;
    const geo = asRecord(locRec.geo) ?? asRecord(locRec.geoPoint);
    if (!geo) continue;
    const lat = Number(geo.latitude ?? geo.lat);
    const lon = Number(geo.longitude ?? geo.lon ?? geo.lng);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon };
    }
  }
  return null;
}

function extractAddress(raw: RawPoi): string | null {
  const located = raw.isLocatedAt;
  const locations = Array.isArray(located) ? located : located ? [located] : [];
  for (const loc of locations) {
    const locRec = asRecord(loc);
    if (!locRec) continue;
    const address = asRecord(locRec.address);
    if (!address) continue;
    const street = firstString(address.streetAddress);
    const postal = firstString(address.postalCode);
    const city = firstString(
      asRecord(address.hasAddressCity)?.["rdfs:label"] ??
        address.hasAddressCity,
    );
    const parts = [street, [postal, city].filter(Boolean).join(" ")]
      .map((p) => p?.trim())
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return null;
}

function extractDescription(raw: RawPoi): string | null {
  const descriptions = raw.hasDescription;
  const list = Array.isArray(descriptions)
    ? descriptions
    : descriptions
      ? [descriptions]
      : [];
  for (const item of list) {
    const rec = asRecord(item);
    const text =
      firstString(rec?.shortDescription) ??
      firstString(rec?.description) ??
      firstString(item);
    if (text) return text;
  }
  return null;
}

function extractImage(raw: RawPoi): string | null {
  const main = raw.hasMainRepresentation;
  const list = Array.isArray(main) ? main : main ? [main] : [];
  for (const item of list) {
    const rec = asRecord(item);
    if (!rec) continue;
    const url =
      firstString(rec.contentUrl) ??
      firstString(rec.url) ??
      firstString(asRecord(rec.hasMediaResource)?.contentUrl);
    if (url?.startsWith("http")) return url;
  }
  return null;
}

export function mapDatatourismePoi(raw: RawPoi): Poi | null {
  const id =
    (typeof raw.uuid === "string" && raw.uuid) ||
    (typeof raw.identifier === "string" && raw.identifier) ||
    null;
  const name = firstString(raw.label) ?? firstString(raw["rdfs:label"]);
  const geo = extractGeo(raw);
  if (!id || !name || !geo) return null;

  return {
    id,
    name,
    types: extractTypes(raw),
    latitude: geo.latitude,
    longitude: geo.longitude,
    description: extractDescription(raw),
    imageUrl: extractImage(raw),
    address: extractAddress(raw),
  };
}
