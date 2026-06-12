"use client";

import type { SearchResult } from "@/lib/search/types";
import {
  Building2,
  ExternalLink,
  MapPin,
  Phone,
  Plus,
  Check,
  Sun,
  Zap,
} from "lucide-react";

interface SearchResultCardProps {
  result: SearchResult;
  sector: string;
  city: string;
  district?: string;
  saved: boolean;
  onSave: () => void;
}

export function SearchResultCard({
  result,
  saved,
  onSave,
}: SearchResultCardProps) {
  const isGes = result.external_id.startsWith("ges:");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isGes && <Sun className="h-4 w-4 shrink-0 text-amber-500" />}
            <h3 className="truncate font-semibold text-slate-900">
              {result.name}
            </h3>
          </div>

          {result.operator_company && result.plant_name && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              {result.operator_company}
            </p>
          )}

          {result.plant_name && (
            <p className="mt-1 text-sm text-slate-500">
              Santral: {result.plant_name}
            </p>
          )}

          {result.plant_capacity && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-amber-700">
              <Zap className="h-3.5 w-3.5" />
              {result.plant_capacity}
            </p>
          )}

          {result.project_location && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{result.project_location}</span>
            </p>
          )}

          {!isGes && result.address && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-2">{result.address}</span>
            </p>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            saved
              ? "bg-emerald-50 text-emerald-700"
              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          }`}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Kaydedildi
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Portföye Ekle
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        {result.phone ? (
          <a
            href={`tel:${result.phone}`}
            className="flex items-center gap-1.5 font-medium text-emerald-700 hover:text-emerald-800"
          >
            <Phone className="h-3.5 w-3.5" />
            {result.phone}
          </a>
        ) : isGes ? (
          <span className="text-xs text-slate-400">
            Telefon bulunamadı — Google API ile şirket merkezi aranır
          </span>
        ) : null}
        {result.website && (
          <a
            href={result.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Web sitesi
          </a>
        )}
        {result.latitude && result.longitude && (
          <a
            href={`https://www.google.com/maps?q=${result.latitude},${result.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600"
          >
            <MapPin className="h-3.5 w-3.5" />
            Santral konumu
          </a>
        )}
      </div>
    </div>
  );
}
