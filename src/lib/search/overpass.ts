import type { Sector } from "../sectors";
import { buildLocationQuery, isAllTurkey } from "../locations";
import { buildSearchQuery, filterByKeyword } from "./query";
import type { SearchResult } from "./types";

const USER_AGENT = "KeyLead/1.0 (https://github.com/keylead)";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  extratags?: Record<string, string>;
  address?: Record<string, string>;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

async function geocodeLocation(
  query: string
): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "tr");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult[];
  if (!data.length) return null;

  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

function buildOverpassQuery(
  lat: number,
  lon: number,
  osmTags: { key: string; value: string }[],
  radiusMeters = 12000
): string {
  const clauses = osmTags.flatMap((t) => [
    `node["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lon});`,
    `way["${t.key}"="${t.value}"](around:${radiusMeters},${lat},${lon});`,
  ]);

  return `[out:json][timeout:25];(${clauses.join("")});out center tags;`;
}

function buildTurkeyAreaQuery(
  osmTags: { key: string; value: string }[]
): string {
  const clauses = osmTags.flatMap((t) => [
    `node["${t.key}"="${t.value}"](area.searchArea);`,
    `way["${t.key}"="${t.value}"](area.searchArea);`,
  ]);

  return `[out:json][timeout:90];area["ISO3166-1"="TR"]->.searchArea;(${clauses.join("")});out center tags;`;
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
  let lastError = "OpenStreetMap sorgusu başarısız oldu";

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        lastError = `Overpass hatası (${res.status})`;
        continue;
      }

      const text = await res.text();
      if (text.startsWith("<?xml") || text.startsWith("<")) {
        lastError = "Overpass zaman aşımına uğradı";
        continue;
      }

      return JSON.parse(text) as OverpassResponse;
    } catch {
      lastError = "Overpass bağlantı hatası";
    }
  }

  throw new Error(lastError);
}

function elementToResult(el: OverpassElement): SearchResult | null {
  const tags = el.tags ?? {};
  const name = tags.name || tags["name:tr"] || tags.brand;
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;

  const addressParts = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:suburb"] || tags["addr:district"],
    tags["addr:city"],
  ].filter(Boolean);

  const address = addressParts.length > 0 ? addressParts.join(", ") : null;

  return {
    name,
    address,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    latitude: lat,
    longitude: lon,
    source: "openstreetmap",
    external_id: `osm:${el.type}/${el.id}`,
    project_location: address,
  };
}

async function searchNominatim(
  sector: Sector,
  locationQuery: string,
  limit: number,
  keyword?: string
): Promise<SearchResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set(
    "q",
    buildSearchQuery(sector, locationQuery, keyword)
  );
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("countrycodes", "tr");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as NominatimResult[];
  const results: SearchResult[] = [];

  for (const item of data) {
    const name =
      item.display_name.split(",")[0]?.trim() || item.display_name;
    const extra = item.extratags ?? {};

    results.push({
      name,
      address: item.display_name,
      phone: extra.phone || extra["contact:phone"] || null,
      website: extra.website || extra["contact:website"] || null,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      source: "nominatim",
      external_id: `nominatim:${item.lat},${item.lon},${name}`,
      project_location: item.display_name,
    });
  }

  return results;
}

export async function searchOverpass(
  sector: Sector,
  cityId: string,
  district: string | undefined,
  limit = 30,
  keyword?: string
): Promise<SearchResult[]> {
  const locationQuery = buildLocationQuery(cityId, district);
  const hasKeyword = !!keyword?.trim();
  let results: SearchResult[] = [];

  if (hasKeyword) {
    await new Promise((r) => setTimeout(r, 1100));
    results = await searchNominatim(sector, locationQuery, limit, keyword);
    if (results.length >= limit) {
      return results.slice(0, limit);
    }
  }

  await new Promise((r) => setTimeout(r, 1100));

  let overpassQuery: string;

  if (isAllTurkey(cityId)) {
    overpassQuery = buildTurkeyAreaQuery(sector.osmTags);
  } else {
    const coords = await geocodeLocation(locationQuery);
    if (!coords) {
      throw new Error(`Konum bulunamadı: ${locationQuery}`);
    }
    overpassQuery = buildOverpassQuery(
      coords.lat,
      coords.lon,
      sector.osmTags
    );
  }

  try {
    const data = await fetchOverpass(overpassQuery);
    const seen = new Set(results.map((r) => r.name.toLowerCase()));

    for (const el of data.elements) {
      const result = elementToResult(el);
      if (!result || seen.has(result.name.toLowerCase())) continue;
      if (hasKeyword && !filterByKeyword([result], keyword).length) continue;
      seen.add(result.name.toLowerCase());
      results.push(result);
      if (results.length >= limit) break;
    }
  } catch {
    // overpass başarısızsa nominatim sonuçlarıyla devam et
  }

  if (results.length < Math.min(limit, hasKeyword ? limit : 5)) {
    await new Promise((r) => setTimeout(r, 1100));
    const nominatimResults = await searchNominatim(
      sector,
      locationQuery,
      limit,
      keyword
    );

    const seen = new Set(results.map((r) => r.name.toLowerCase()));
    for (const r of nominatimResults) {
      if (seen.has(r.name.toLowerCase())) continue;
      seen.add(r.name.toLowerCase());
      results.push(r);
      if (results.length >= limit) break;
    }
  }

  results = filterByKeyword(results, keyword).slice(0, limit);

  if (results.length === 0) {
    throw new Error(
      isAllTurkey(cityId)
        ? "Türkiye genelinde sonuç bulunamadı. Google Places API anahtarı ekleyerek deneyin."
        : "Bu sektör ve lokasyonda sonuç bulunamadı. Farklı bir ilçe deneyin veya Google Places API anahtarı ekleyin."
    );
  }

  return results;
}
