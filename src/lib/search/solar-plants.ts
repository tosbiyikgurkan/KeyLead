import {
  buildLocationQuery,
  getCityById,
  isAllTurkey,
} from "../locations";
import { filterByKeyword } from "./query";
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
  boundingbox?: [string, string, string, string];
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

interface GeoArea {
  lat: number;
  lon: number;
  bbox: [number, number, number, number]; // south, west, north, east
}

async function geocodeArea(
  locationQuery: string,
  district?: string
): Promise<GeoArea | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", locationQuery);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "tr");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as NominatimResult[];
  if (!data.length) return null;

  const item = data[0];
  const lat = parseFloat(item.lat);
  const lon = parseFloat(item.lon);

  if (item.boundingbox) {
    const [minLat, maxLat, minLon, maxLon] = item.boundingbox.map(parseFloat);
    return { lat, lon, bbox: [minLat, minLon, maxLat, maxLon] };
  }

  const delta = district ? 0.15 : 0.45;
  return {
    lat,
    lon,
    bbox: [lat - delta, lon - delta, lat + delta, lon + delta],
  };
}

function buildSolarOverpassQuery(bbox: [number, number, number, number]): string {
  const [south, west, north, east] = bbox;
  return `[out:json][timeout:60];(
    node["power"="plant"]["plant:source"="solar"](${south},${west},${north},${east});
    way["power"="plant"]["plant:source"="solar"](${south},${west},${north},${east});
    relation["power"="plant"]["plant:source"="solar"](${south},${west},${north},${east});
    node["generator:source"="solar"]["power"="generator"](${south},${west},${north},${east});
    way["generator:source"="solar"]["power"="generator"](${south},${west},${north},${east});
    node["plant:source"="solar"](${south},${west},${north},${east});
    way["plant:source"="solar"](${south},${west},${north},${east});
  );out center tags;`;
}

function buildTurkeySolarQuery(): string {
  return `[out:json][timeout:120];area["ISO3166-1"="TR"]->.searchArea;(
    node["power"="plant"]["plant:source"="solar"](area.searchArea);
    way["power"="plant"]["plant:source"="solar"](area.searchArea);
    relation["power"="plant"]["plant:source"="solar"](area.searchArea);
    node["generator:source"="solar"]["power"="generator"](area.searchArea);
    way["generator:source"="solar"]["power"="generator"](area.searchArea);
    node["plant:source"="solar"](area.searchArea);
    way["plant:source"="solar"](area.searchArea);
  );out center tags;`;
}

async function fetchOverpass(query: string): Promise<OverpassResponse> {
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

      if (!res.ok) continue;

      const text = await res.text();
      if (text.startsWith("<")) continue;

      return JSON.parse(text) as OverpassResponse;
    } catch {
      continue;
    }
  }

  throw new Error("GES harita sorgusu başarısız oldu");
}

function formatCapacity(tags: Record<string, string>): string | null {
  const raw =
    tags["plant:output:electricity"] ||
    tags["generator:output:electricity"] ||
    tags["output:electricity"];
  if (!raw) return null;
  return raw.replace(/(\d)([a-zA-Z])/g, "$1 $2");
}

function elementToPlant(el: OverpassElement): SearchResult | null {
  const tags = el.tags ?? {};
  const isSolar =
    tags["plant:source"] === "solar" ||
    tags["generator:source"] === "solar" ||
    tags["generator:method"] === "photovoltaic";

  if (!isSolar && tags.power !== "plant") return null;

  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  if (lat === null || lon === null) return null;

  const plantName = tags.name || tags["name:tr"] || null;
  const operator = tags.operator || tags.owner || tags.brand || null;
  const capacity = formatCapacity(tags);

  const locationLabel =
    lat && lon
      ? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      : null;

  const displayName = operator || plantName || "Güneş Enerji Santrali";

  const notes = [
    plantName ? `Santral: ${plantName}` : null,
    capacity ? `Kapasite: ${capacity}` : null,
    operator ? `İşletmeci: ${operator}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    name: displayName,
    plant_name: plantName,
    operator_company: operator,
    plant_capacity: capacity,
    address: locationLabel,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    latitude: lat,
    longitude: lon,
    source: "openstreetmap_ges",
    external_id: `ges:osm:${el.type}/${el.id}`,
    project_location: locationLabel,
  };
}

async function lookupCompanyContact(
  companyName: string,
  cityLabel: string,
  apiKey: string
): Promise<{ phone: string | null; website: string | null; address: string | null }> {
  const query = `${companyName} enerji ${cityLabel} Türkiye`;

  const searchUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("key", apiKey);
  searchUrl.searchParams.set("language", "tr");

  const searchRes = await fetch(searchUrl.toString());
  const searchData = (await searchRes.json()) as {
    results?: { place_id: string }[];
    status: string;
  };

  if (!searchData.results?.length) {
    return { phone: null, website: null, address: null };
  }

  const detailsUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  detailsUrl.searchParams.set("place_id", searchData.results[0].place_id);
  detailsUrl.searchParams.set(
    "fields",
    "formatted_phone_number,website,formatted_address"
  );
  detailsUrl.searchParams.set("key", apiKey);
  detailsUrl.searchParams.set("language", "tr");

  const detailsRes = await fetch(detailsUrl.toString());
  const detailsData = (await detailsRes.json()) as {
    result?: {
      formatted_phone_number?: string;
      website?: string;
      formatted_address?: string;
    };
  };

  return {
    phone: detailsData.result?.formatted_phone_number ?? null,
    website: detailsData.result?.website ?? null,
    address: detailsData.result?.formatted_address ?? null,
  };
}

async function searchGoogleGesCompanies(
  cityId: string,
  district: string | undefined,
  apiKey: string,
  limit: number,
  keyword?: string
): Promise<SearchResult[]> {
  const location = buildLocationQuery(cityId, district);
  const kw = keyword?.trim();
  const queries = kw
    ? [
        `${kw} güneş enerji santrali GES ${location}`,
        `${kw} solar enerji ${location}`,
        `${kw} yenilenebilir enerji ${location}`,
      ]
    : [
        `güneş enerji santrali GES ${location}`,
        `solar enerji şirketi ${location}`,
        `yenilenebilir enerji ${location}`,
      ];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/textsearch/json"
    );
    url.searchParams.set("query", query);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "tr");

    const res = await fetch(url.toString());
    const data = (await res.json()) as {
      results?: {
        place_id: string;
        name: string;
        formatted_address?: string;
        geometry?: { location: { lat: number; lng: number } };
      }[];
      status: string;
    };

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") continue;

    for (const place of data.results ?? []) {
      if (seen.has(place.place_id)) continue;
      seen.add(place.place_id);

      const detailsUrl = new URL(
        "https://maps.googleapis.com/maps/api/place/details/json"
      );
      detailsUrl.searchParams.set("place_id", place.place_id);
      detailsUrl.searchParams.set(
        "fields",
        "name,formatted_phone_number,website,formatted_address"
      );
      detailsUrl.searchParams.set("key", apiKey);
      detailsUrl.searchParams.set("language", "tr");

      const detailsRes = await fetch(detailsUrl.toString());
      const details = (await detailsRes.json()) as {
        result?: {
          formatted_phone_number?: string;
          website?: string;
          formatted_address?: string;
        };
      };

      await new Promise((r) => setTimeout(r, 120));

      results.push({
        name: place.name,
        operator_company: place.name,
        plant_name: null,
        plant_capacity: null,
        address:
          details.result?.formatted_address ??
          place.formatted_address ??
          null,
        phone: details.result?.formatted_phone_number ?? null,
        website: details.result?.website ?? null,
        latitude: place.geometry?.location.lat ?? null,
        longitude: place.geometry?.location.lng ?? null,
        source: "google_places_ges",
        external_id: `ges:google:${place.place_id}`,
        project_location:
          details.result?.formatted_address ??
          place.formatted_address ??
          null,
      });

      if (results.length >= limit) return results;
    }
  }

  return results;
}

export async function searchSolarPlants(
  cityId: string,
  district: string | undefined,
  apiKey: string | undefined,
  limit = 25,
  keyword?: string
): Promise<SearchResult[]> {
  const city = getCityById(cityId);
  if (!city) throw new Error("Geçersiz şehir");

  const locationQuery = buildLocationQuery(cityId, district);

  let overpassQuery: string;

  if (isAllTurkey(cityId)) {
    overpassQuery = buildTurkeySolarQuery();
  } else {
    const area = await geocodeArea(locationQuery, district);
    if (!area) {
      throw new Error(`Konum bulunamadı: ${locationQuery}`);
    }
    overpassQuery = buildSolarOverpassQuery(area.bbox);
  }

  await new Promise((r) => setTimeout(r, 1100));

  const data = await fetchOverpass(overpassQuery);

  const plantResults: SearchResult[] = [];
  const seenPlants = new Set<string>();

  for (const el of data.elements) {
    const result = elementToPlant(el);
    if (!result || seenPlants.has(result.external_id)) continue;
    if (keyword?.trim() && !filterByKeyword([result], keyword).length) continue;
    seenPlants.add(result.external_id);
    plantResults.push(result);
  }

  const companyCache = new Map<
    string,
    { phone: string | null; website: string | null; address: string | null }
  >();

  if (apiKey) {
    const locationLabel = locationQuery;
    for (const plant of plantResults) {
      if (plant.phone || !plant.operator_company) continue;

      const key = plant.operator_company.toLowerCase();
      if (!companyCache.has(key)) {
        companyCache.set(
          key,
          await lookupCompanyContact(
            plant.operator_company,
            locationLabel,
            apiKey
          )
        );
        await new Promise((r) => setTimeout(r, 150));
      }

      const contact = companyCache.get(key)!;
      if (contact.phone) plant.phone = contact.phone;
      if (contact.website && !plant.website) plant.website = contact.website;
      if (contact.address && !plant.address) plant.address = contact.address;
    }
  }

  let googleCompanies: SearchResult[] = [];
  if (apiKey) {
    googleCompanies = await searchGoogleGesCompanies(
      cityId,
      district,
      apiKey,
      limit,
      keyword
    );
  }

  const merged = filterByKeyword(
    [...plantResults, ...googleCompanies.filter((c) => {
      const nameKey = c.name.toLowerCase();
      if (plantResults.some((p) => p.name.toLowerCase() === nameKey)) {
        const existing = plantResults.find(
          (p) => p.name.toLowerCase() === nameKey
        );
        if (existing && !existing.phone && c.phone) {
          existing.phone = c.phone;
          existing.website = existing.website || c.website;
        }
        return false;
      }
      return true;
    })],
    keyword
  );

  if (merged.length === 0) {
    throw new Error(
      keyword?.trim()
        ? `"${keyword}" için GES kaydı bulunamadı. Farklı bir kelime deneyin.`
        : "Bu bölgede GES kaydı bulunamadı. Google Places API anahtarı ekleyerek enerji şirketlerini aramayı deneyin."
    );
  }

  return merged.slice(0, limit);
}
