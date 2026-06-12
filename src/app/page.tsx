"use client";

import { Navbar } from "@/components/Navbar";
import { SearchPanel } from "@/components/SearchPanel";
import { SearchResultCard } from "@/components/SearchResultCard";
import { getSectorById } from "@/lib/sectors";
import { getCityById } from "@/lib/locations";
import type { SearchResult } from "@/lib/search/types";
import { AlertCircle, Download, Users } from "lucide-react";
import { useCallback, useState } from "react";

interface SearchMeta {
  sector: string;
  city: string;
  district: string | null;
  keyword: string | null;
  count: number;
  source: string;
  hasGoogleKey: boolean;
}

function buildProjectNotes(result: SearchResult): string | null {
  const parts = [
    result.plant_name ? `Santral: ${result.plant_name}` : null,
    result.plant_capacity ? `Kapasite: ${result.plant_capacity}` : null,
    result.operator_company ? `İşletmeci: ${result.operator_company}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function buildSavePayload(
  result: SearchResult,
  sectorLabel: string,
  cityLabel: string,
  district?: string
) {
  return {
    name: result.operator_company || result.name,
    sector: sectorLabel,
    city: cityLabel,
    district: district ?? null,
    address: result.address,
    phone: result.phone,
    website: result.website,
    latitude: result.latitude,
    longitude: result.longitude,
    project_name: result.plant_name || result.name,
    project_location: result.project_location,
    project_notes: buildProjectNotes(result),
    source: result.source,
    external_id: result.external_id,
  };
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useState<{
    sectorId: string;
    cityId: string;
    district?: string;
    keyword?: string;
  } | null>(null);

  const handleSearch = useCallback(
    async (params: {
      sectorId: string;
      cityId: string;
      district?: string;
      keyword?: string;
    }) => {
      setLoading(true);
      setError(null);
      setSearchParams(params);

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setResults(data.results);
        setMeta(data.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Arama başarısız");
        setResults([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  async function saveToPortfolio(result: SearchResult) {
    if (!searchParams) return;

    const sector = getSectorById(searchParams.sectorId);
    const city = getCityById(searchParams.cityId);

    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        buildSavePayload(
          result,
          sector?.label ?? searchParams.sectorId,
          city?.label ?? searchParams.cityId,
          searchParams.district
        )
      ),
    });

    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(result.external_id));
    }
  }

  async function saveAll() {
    if (!searchParams) return;

    const sector = getSectorById(searchParams.sectorId);
    const city = getCityById(searchParams.cityId);

    const unsaved = results.filter((r) => !savedIds.has(r.external_id));
    if (!unsaved.length) return;

    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bulk: true,
        customers: unsaved.map((r) =>
          buildSavePayload(
            r,
            sector?.label ?? searchParams.sectorId,
            city?.label ?? searchParams.cityId,
            searchParams.district
          )
        ),
      }),
    });

    if (res.ok) {
      setSavedIds(new Set(results.map((r) => r.external_id)));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            KeyLead ile potansiyel müşterileri keşfedin
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Sektörünüzü, lokasyonunuzu ve anahtar kelimenizi seçin; işletmelerin
            iletişim bilgileri, proje lokasyonlarını bulun ve portföyünüze kaydedin.
          </p>
        </div>

        <SearchPanel onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {meta && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {meta.count} sonuç bulundu
              </h2>
              <p className="text-sm text-slate-500">
                {meta.sector} · {meta.city}
                {meta.district ? ` / ${meta.district}` : ""}
                {meta.keyword ? ` · "${meta.keyword}"` : ""} ·{" "}
                {meta.source === "ges_combined"
                  ? "GES (Harita + Google)"
                  : meta.source === "openstreetmap_ges"
                    ? "GES Haritası"
                    : meta.source === "google_places"
                      ? "Google Places"
                      : meta.source === "nominatim"
                        ? "Nominatim"
                        : "OpenStreetMap"}
              </p>
            </div>
            {results.length > 0 && (
              <button
                onClick={saveAll}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" />
                Tümünü Portföye Ekle
              </button>
            )}
          </div>
        )}

        {results.length > 0 && searchParams && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.map((result) => (
              <SearchResultCard
                key={result.external_id}
                result={result}
                sector={searchParams.sectorId}
                city={searchParams.cityId}
                district={searchParams.district}
                saved={savedIds.has(result.external_id)}
                onSave={() => saveToPortfolio(result)}
              />
            ))}
          </div>
        )}

        {!loading && !results.length && !error && (
          <div className="mt-16 flex flex-col items-center text-center text-slate-400">
            <Users className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium">Henüz arama yapılmadı</p>
            <p className="mt-1 text-sm">
              Yukarıdan sektör ve lokasyon seçerek başlayın
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
