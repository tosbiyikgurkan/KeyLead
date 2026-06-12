export interface Sector {
  id: string;
  label: string;
  searchQuery: string;
  googleType?: string;
  osmTags: { key: string; value: string }[];
  /** Özel arama modülü kullanılır */
  specialty?: "ges";
}

export const SECTORS: Sector[] = [
  {
    id: "ges",
    label: "☀ Güneş Enerji Santralleri (GES)",
    searchQuery: "güneş enerji santrali GES",
    googleType: "point_of_interest",
    osmTags: [{ key: "plant:source", value: "solar" }],
    specialty: "ges",
  },
  {
    id: "insaat",
    label: "İnşaat & Yapı",
    searchQuery: "inşaat şirketi",
    googleType: "general_contractor",
    osmTags: [
      { key: "office", value: "construction_company" },
      { key: "craft", value: "builder" },
      { key: "company", value: "construction" },
    ],
  },
  {
    id: "mimarlik",
    label: "Mimarlık & Mühendislik",
    searchQuery: "mimarlık ofisi",
    googleType: "architect",
    osmTags: [{ key: "office", value: "architect" }],
  },
  {
    id: "emlak",
    label: "Emlak & Gayrimenkul",
    searchQuery: "emlak ofisi",
    googleType: "real_estate_agency",
    osmTags: [{ key: "office", value: "estate_agent" }],
  },
  {
    id: "otel",
    label: "Otel & Konaklama",
    searchQuery: "otel",
    googleType: "lodging",
    osmTags: [{ key: "tourism", value: "hotel" }],
  },
  {
    id: "restoran",
    label: "Restoran & Kafe",
    searchQuery: "restoran",
    googleType: "restaurant",
    osmTags: [{ key: "amenity", value: "restaurant" }],
  },
  {
    id: "perakende",
    label: "Perakende & Mağaza",
    searchQuery: "mağaza",
    googleType: "store",
    osmTags: [{ key: "shop", value: "yes" }],
  },
  {
    id: "saglik",
    label: "Sağlık & Hastane",
    searchQuery: "hastane klinik",
    googleType: "hospital",
    osmTags: [{ key: "amenity", value: "hospital" }],
  },
  {
    id: "egitim",
    label: "Eğitim & Okul",
    searchQuery: "okul eğitim kurumu",
    googleType: "school",
    osmTags: [{ key: "amenity", value: "school" }],
  },
  {
    id: "fabrika",
    label: "Fabrika & Sanayi",
    searchQuery: "fabrika sanayi",
    googleType: "factory",
    osmTags: [{ key: "landuse", value: "industrial" }],
  },
  {
    id: "lojistik",
    label: "Lojistik & Depo",
    searchQuery: "lojistik depo",
    googleType: "storage",
    osmTags: [{ key: "landuse", value: "commercial" }],
  },
  {
    id: "enerji",
    label: "Enerji & Güneş Firmaları",
    searchQuery: "güneş enerji solar panel firması",
    googleType: "electrician",
    osmTags: [
      { key: "office", value: "energy_supplier" },
      { key: "generator:source", value: "solar" },
    ],
  },
  {
    id: "teknoloji",
    label: "Teknoloji & Yazılım",
    searchQuery: "yazılım teknoloji şirketi",
    googleType: "point_of_interest",
    osmTags: [{ key: "office", value: "it" }],
  },
  {
    id: "hukuk",
    label: "Hukuk & Danışmanlık",
    searchQuery: "hukuk bürosu avukat",
    googleType: "lawyer",
    osmTags: [{ key: "office", value: "lawyer" }],
  },
  {
    id: "finans",
    label: "Finans & Bankacılık",
    searchQuery: "banka finans",
    googleType: "bank",
    osmTags: [{ key: "amenity", value: "bank" }],
  },
  {
    id: "spor",
    label: "Spor & Fitness",
    searchQuery: "spor salonu fitness",
    googleType: "gym",
    osmTags: [{ key: "leisure", value: "fitness_centre" }],
  },
];

export function getSectorById(id: string): Sector | undefined {
  return SECTORS.find((s) => s.id === id);
}
