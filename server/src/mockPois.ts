import type { Poi } from "./types.js";

/** Synthetic Paris POIs for MOCK_MODE / missing API key. */
export const MOCK_POIS: Poi[] = [
  {
    id: "mock-tour-eiffel",
    name: "Tour Eiffel",
    types: ["CulturalSite", "Monument"],
    latitude: 48.8584,
    longitude: 2.2945,
    description: "Monument emblématique de Paris (données mock).",
    imageUrl: null,
    address: "Champ de Mars, 75007 Paris",
  },
  {
    id: "mock-louvre",
    name: "Musée du Louvre",
    types: ["Museum", "CulturalSite"],
    latitude: 48.8606,
    longitude: 2.3376,
    description: "Musée d'art et d'antiquités (données mock).",
    imageUrl: null,
    address: "Rue de Rivoli, 75001 Paris",
  },
  {
    id: "mock-notre-dame",
    name: "Cathédrale Notre-Dame",
    types: ["ReligiousSite", "Monument"],
    latitude: 48.853,
    longitude: 2.3499,
    description: "Cathédrale gothique sur l'île de la Cité (données mock).",
    imageUrl: null,
    address: "6 Parvis Notre-Dame, 75004 Paris",
  },
  {
    id: "mock-sacre-coeur",
    name: "Basilique du Sacré-Cœur",
    types: ["ReligiousSite", "Monument"],
    latitude: 48.8867,
    longitude: 2.3431,
    description: "Basilique de Montmartre (données mock).",
    imageUrl: null,
    address: "35 Rue du Chevalier de La Barre, 75018 Paris",
  },
  {
    id: "mock-arc-triomphe",
    name: "Arc de Triomphe",
    types: ["Monument", "CulturalSite"],
    latitude: 48.8738,
    longitude: 2.295,
    description: "Arc au centre de la place Charles-de-Gaulle (données mock).",
    imageUrl: null,
    address: "Place Charles de Gaulle, 75008 Paris",
  },
];

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function filterMockPois(
  lat: number,
  lon: number,
  radiusMeters: number,
  typeFilter?: string,
): Poi[] {
  return MOCK_POIS.filter((poi) => {
    const distance = haversineMeters(lat, lon, poi.latitude, poi.longitude);
    if (distance > radiusMeters) return false;
    if (!typeFilter) return true;
    return poi.types.some((t) =>
      t.toLowerCase().includes(typeFilter.toLowerCase()),
    );
  });
}
