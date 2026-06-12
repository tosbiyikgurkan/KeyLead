"use client";

import { SECTORS } from "@/lib/sectors";
import { CITIES, isAllTurkey } from "@/lib/locations";
import { Loader2, MapPin, Search } from "lucide-react";
import { useState } from "react";

interface SearchPanelProps {
  onSearch: (params: {
    sectorId: string;
    cityId: string;
    district?: string;
    keyword?: string;
  }) => void;
  loading: boolean;
}

export function SearchPanel({ onSearch, loading }: SearchPanelProps) {
  const [sectorId, setSectorId] = useState("");
  const [cityId, setCityId] = useState("");
  const [district, setDistrict] = useState("");
  const [keyword, setKeyword] = useState("");

  const selectedCity = CITIES.find((c) => c.id === cityId);
  const isGes = sectorId === "ges";
  const isTurkiye = isAllTurkey(cityId);
  const canPickDistrict =
    selectedCity && !isTurkiye && selectedCity.districts.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sectorId || !cityId) return;
    onSearch({
      sectorId,
      cityId,
      district: district || undefined,
      keyword: keyword.trim() || undefined,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Müşteri Ara</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sektör, lokasyon ve isteğe bağlı anahtar kelime ile arayın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Sektör
            </label>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
            >
              <option value="">Sektör seçin</option>
              {SECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              İl / Bölge
            </label>
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setDistrict("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
            >
              <option value="">İl veya bölge seçin</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
              İlçe (opsiyonel)
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!canPickDistrict}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            >
              <option value="">
                {isTurkiye ? "Tüm Türkiye taranır" : "Tüm ilçeler"}
              </option>
              {selectedCity?.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !sectorId || !cityId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Aranıyor..." : "Ara"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Anahtar Kelime (opsiyonel)
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="ör. Kalyon, güneş santrali, ABC Enerji..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </form>

      {isGes ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>GES modu:</strong> Kelime ile şirket adı, santral adı veya
            işletmeci arayabilirsiniz. Google Places API telefon bilgisi için
            önerilir.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Anahtar kelime firma adı, proje adı veya sektör terimi olabilir.
            Google Places API ile sonuçlar daha zengin gelir.
          </p>
        </div>
      )}
    </div>
  );
}
