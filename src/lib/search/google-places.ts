import type { Sector } from "../sectors";
import { buildLocationQuery } from "../locations";
import { buildSearchQuery } from "./query";
import type { SearchResult } from "./types";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
}

interface GoogleTextSearchResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
}

interface GooglePlaceDetailsResponse {
  result?: {
    formatted_phone_number?: string;
    website?: string;
    formatted_address?: string;
    name?: string;
  };
  status: string;
}

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<{ phone: string | null; website: string | null; address: string | null }> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_phone_number,website,formatted_address"
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "tr");

  const res = await fetch(url.toString());
  const data = (await res.json()) as GooglePlaceDetailsResponse;

  return {
    phone: data.result?.formatted_phone_number ?? null,
    website: data.result?.website ?? null,
    address: data.result?.formatted_address ?? null,
  };
}

export async function searchGooglePlaces(
  sector: Sector,
  cityId: string,
  district: string | undefined,
  apiKey: string,
  limit = 20,
  keyword?: string
): Promise<SearchResult[]> {
  const location = buildLocationQuery(cityId, district);
  const query = buildSearchQuery(sector, location, keyword);

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "tr");
  if (sector.googleType) {
    url.searchParams.set("type", sector.googleType);
  }

  const res = await fetch(url.toString());
  const data = (await res.json()) as GoogleTextSearchResponse;

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places hatası: ${data.status}`);
  }

  const places = data.results.slice(0, limit);
  const results: SearchResult[] = [];

  for (const place of places) {
    const details = await fetchPlaceDetails(place.place_id, apiKey);
    await new Promise((r) => setTimeout(r, 100));

    results.push({
      name: place.name,
      address: details.address ?? place.formatted_address ?? null,
      phone: details.phone,
      website: details.website,
      latitude: place.geometry?.location.lat ?? null,
      longitude: place.geometry?.location.lng ?? null,
      source: "google_places",
      external_id: `google:${place.place_id}`,
      project_location: details.address ?? place.formatted_address ?? null,
    });
  }

  return results;
}
