import type { Sector } from "../sectors";
import type { SearchResult } from "./types";

export function buildSearchQuery(
  sector: Sector,
  location: string,
  keyword?: string
): string {
  return [keyword?.trim(), sector.searchQuery, location]
    .filter((part) => part && part.length > 0)
    .join(" ");
}

export function matchesKeyword(
  result: SearchResult,
  keyword: string
): boolean {
  const k = keyword.trim().toLowerCase();
  if (!k) return true;

  const haystack = [
    result.name,
    result.operator_company,
    result.plant_name,
    result.address,
    result.project_location,
    result.plant_capacity,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(k);
}

export function filterByKeyword(
  results: SearchResult[],
  keyword?: string
): SearchResult[] {
  if (!keyword?.trim()) return results;
  return results.filter((r) => matchesKeyword(r, keyword));
}
