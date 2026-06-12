import { getSectorById } from "@/lib/sectors";
import { getCityById, isAllTurkey } from "@/lib/locations";
import { searchGooglePlaces } from "@/lib/search/google-places";
import { searchOverpass } from "@/lib/search/overpass";
import { searchSolarPlants } from "@/lib/search/solar-plants";
import type { SearchResult } from "@/lib/search/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectorId, cityId, district, keyword, limit = 20 } = body;

    if (!sectorId || !cityId) {
      return NextResponse.json(
        { error: "Sektör ve şehir seçimi zorunludur" },
        { status: 400 }
      );
    }

    const sector = getSectorById(sectorId);
    const city = getCityById(cityId);

    if (!sector) {
      return NextResponse.json({ error: "Geçersiz sektör" }, { status: 400 });
    }
    if (!city) {
      return NextResponse.json({ error: "Geçersiz şehir" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const effectiveLimit = isAllTurkey(cityId) ? Math.max(limit, 40) : limit;
    let results: SearchResult[] = [];
    let source = "openstreetmap";

    if (sector.specialty === "ges") {
      results = await searchSolarPlants(
        cityId,
        district,
        apiKey,
        effectiveLimit,
        keyword
      );
      source = apiKey ? "ges_combined" : "openstreetmap_ges";
    } else if (apiKey) {
      try {
        results = await searchGooglePlaces(
          sector,
          cityId,
          district,
          apiKey,
          effectiveLimit,
          keyword
        );
        source = "google_places";
      } catch {
        results = await searchOverpass(
          sector,
          cityId,
          district,
          effectiveLimit,
          keyword
        );
        source = "openstreetmap";
      }
    } else {
      results = await searchOverpass(
        sector,
        cityId,
        district,
        effectiveLimit,
        keyword
      );
    }

    return NextResponse.json({
      results,
      meta: {
        sector: sector.label,
        city: city.label,
        district: district ?? null,
        keyword: keyword?.trim() || null,
        count: results.length,
        source,
        hasGoogleKey: !!apiKey,
        isGes: sector.specialty === "ges",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Arama sırasında hata oluştu";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
