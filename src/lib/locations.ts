export interface City {
  id: string;
  label: string;
  districts: string[];
}

export const TURKIYE_CITY_ID = "turkiye";

/** Türkiye sınırları (south, west, north, east) */
export const TURKEY_BBOX: [number, number, number, number] = [
  35.8, 25.9, 42.15, 44.85,
];

/** Türkiye'nin 81 ili + Tüm Türkiye — alfabetik sıra (Tüm Türkiye en üstte) */
export const CITIES: City[] = [
  {
    id: TURKIYE_CITY_ID,
    label: "🇹🇷 Tüm Türkiye",
    districts: [],
  },
  {
    id: "adana",
    label: "Adana",
    districts: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan"],
  },
  { id: "adiyaman", label: "Adıyaman", districts: [] },
  { id: "afyonkarahisar", label: "Afyonkarahisar", districts: [] },
  { id: "agri", label: "Ağrı", districts: [] },
  { id: "aksaray", label: "Aksaray", districts: [] },
  { id: "amasya", label: "Amasya", districts: [] },
  {
    id: "ankara",
    label: "Ankara",
    districts: [
      "Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut",
      "Sincan", "Altındağ", "Pursaklar", "Gölbaşı", "Polatlı",
    ],
  },
  {
    id: "antalya",
    label: "Antalya",
    districts: ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Serik", "Kemer"],
  },
  { id: "ardahan", label: "Ardahan", districts: [] },
  { id: "artvin", label: "Artvin", districts: [] },
  { id: "aydin", label: "Aydın", districts: ["Efeler", "Nazilli", "Söke"] },
  {
    id: "balikesir",
    label: "Balıkesir",
    districts: ["Karesi", "Altıeylül", "Bandırma", "Edremit"],
  },
  { id: "bartin", label: "Bartın", districts: [] },
  { id: "batman", label: "Batman", districts: [] },
  { id: "bayburt", label: "Bayburt", districts: [] },
  { id: "bilecik", label: "Bilecik", districts: [] },
  { id: "bingol", label: "Bingöl", districts: [] },
  { id: "bitlis", label: "Bitlis", districts: [] },
  { id: "bolu", label: "Bolu", districts: [] },
  { id: "burdur", label: "Burdur", districts: [] },
  {
    id: "bursa",
    label: "Bursa",
    districts: ["Osmangazi", "Nilüfer", "Yıldırım", "Gemlik", "İnegöl", "Mudanya"],
  },
  { id: "canakkale", label: "Çanakkale", districts: [] },
  { id: "cankiri", label: "Çankırı", districts: [] },
  { id: "corum", label: "Çorum", districts: [] },
  {
    id: "denizli",
    label: "Denizli",
    districts: ["Merkezefendi", "Pamukkale", "Çivril"],
  },
  {
    id: "diyarbakir",
    label: "Diyarbakır",
    districts: ["Bağlar", "Kayapınar", "Yenişehir", "Sur"],
  },
  { id: "duzce", label: "Düzce", districts: [] },
  { id: "edirne", label: "Edirne", districts: [] },
  { id: "elazig", label: "Elazığ", districts: [] },
  { id: "erzincan", label: "Erzincan", districts: [] },
  { id: "erzurum", label: "Erzurum", districts: ["Yakutiye", "Palandöken", "Aziziye"] },
  {
    id: "eskisehir",
    label: "Eskişehir",
    districts: ["Tepebaşı", "Odunpazarı"],
  },
  {
    id: "gaziantep",
    label: "Gaziantep",
    districts: ["Şahinbey", "Şehitkamil", "Nizip", "İslahiye"],
  },
  { id: "giresun", label: "Giresun", districts: [] },
  { id: "gumushane", label: "Gümüşhane", districts: [] },
  { id: "hakkari", label: "Hakkâri", districts: [] },
  {
    id: "hatay",
    label: "Hatay",
    districts: ["Antakya", "Defne", "İskenderun", "Dörtyol"],
  },
  { id: "igdir", label: "Iğdır", districts: [] },
  { id: "isparta", label: "Isparta", districts: [] },
  {
    id: "istanbul",
    label: "İstanbul",
    districts: [
      "Kadıköy", "Beşiktaş", "Şişli", "Bakırköy", "Üsküdar", "Ataşehir",
      "Maltepe", "Kartal", "Pendik", "Tuzla", "Sarıyer", "Beyoğlu",
      "Fatih", "Başakşehir", "Esenyurt", "Beylikdüzü", "Avcılar",
      "Bağcılar", "Güngören", "Kağıthane", "Sultanbeyli", "Sancaktepe",
    ],
  },
  {
    id: "izmir",
    label: "İzmir",
    districts: [
      "Konak", "Karşıyaka", "Bornova", "Buca", "Bayraklı", "Çiğli",
      "Gaziemir", "Karabağlar", "Narlıdere", "Balçova", "Menemen", "Torbalı",
    ],
  },
  {
    id: "kahramanmaras",
    label: "Kahramanmaraş",
    districts: ["Dulkadiroğlu", "Onikişubat", "Elbistan"],
  },
  { id: "karabuk", label: "Karabük", districts: [] },
  { id: "karaman", label: "Karaman", districts: [] },
  { id: "kars", label: "Kars", districts: [] },
  { id: "kastamonu", label: "Kastamonu", districts: [] },
  {
    id: "kayseri",
    label: "Kayseri",
    districts: ["Kocasinan", "Melikgazi", "Talas", "Develi"],
  },
  { id: "kirikkale", label: "Kırıkkale", districts: [] },
  { id: "kirklareli", label: "Kırklareli", districts: [] },
  { id: "kirsehir", label: "Kırşehir", districts: [] },
  { id: "kilis", label: "Kilis", districts: [] },
  {
    id: "kocaeli",
    label: "Kocaeli",
    districts: ["İzmit", "Gebze", "Darıca", "Körfez", "Gölcük", "Kartepe", "Başiskele"],
  },
  {
    id: "konya",
    label: "Konya",
    districts: ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir", "Cihanbeyli"],
  },
  { id: "kutahya", label: "Kütahya", districts: [] },
  { id: "malatya", label: "Malatya", districts: ["Battalgazi", "Yeşilyurt"] },
  {
    id: "manisa",
    label: "Manisa",
    districts: ["Yunusemre", "Şehzadeler", "Akhisar", "Turgutlu", "Salihli"],
  },
  { id: "mardin", label: "Mardin", districts: ["Artuklu", "Kızıltepe", "Nusaybin"] },
  {
    id: "mersin",
    label: "Mersin",
    districts: ["Akdeniz", "Mezitli", "Toroslar", "Yenişehir", "Tarsus", "Silifke"],
  },
  {
    id: "mugla",
    label: "Muğla",
    districts: ["Menteşe", "Bodrum", "Fethiye", "Marmaris", "Milas"],
  },
  { id: "mus", label: "Muş", districts: [] },
  { id: "nevsehir", label: "Nevşehir", districts: [] },
  { id: "nigde", label: "Niğde", districts: [] },
  { id: "ordu", label: "Ordu", districts: ["Altınordu", "Ünye", "Fatsa"] },
  { id: "osmaniye", label: "Osmaniye", districts: [] },
  { id: "rize", label: "Rize", districts: [] },
  {
    id: "sakarya",
    label: "Sakarya",
    districts: ["Adapazarı", "Serdivan", "Erenler", "Hendek", "Akyazı"],
  },
  {
    id: "samsun",
    label: "Samsun",
    districts: ["İlkadım", "Atakum", "Canik", "Tekkeköy", "Bafra", "Çarşamba"],
  },
  { id: "siirt", label: "Siirt", districts: [] },
  { id: "sinop", label: "Sinop", districts: [] },
  { id: "sivas", label: "Sivas", districts: [] },
  {
    id: "sanliurfa",
    label: "Şanlıurfa",
    districts: ["Eyyübiye", "Haliliye", "Karaköprü", "Siverek"],
  },
  { id: "sirnak", label: "Şırnak", districts: [] },
  {
    id: "tekirdag",
    label: "Tekirdağ",
    districts: ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı"],
  },
  { id: "tokat", label: "Tokat", districts: [] },
  {
    id: "trabzon",
    label: "Trabzon",
    districts: ["Ortahisar", "Akçaabat", "Yomra", "Araklı", "Of"],
  },
  { id: "tunceli", label: "Tunceli", districts: [] },
  { id: "usak", label: "Uşak", districts: [] },
  { id: "van", label: "Van", districts: ["İpekyolu", "Tuşba", "Edremit"] },
  { id: "yalova", label: "Yalova", districts: [] },
  { id: "yozgat", label: "Yozgat", districts: [] },
  {
    id: "zonguldak",
    label: "Zonguldak",
    districts: ["Kozlu", "Çaycuma", "Ereğli", "Devrek"],
  },
];

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function isAllTurkey(cityId: string): boolean {
  return cityId === TURKIYE_CITY_ID;
}

export function buildLocationQuery(cityId: string, district?: string): string {
  if (isAllTurkey(cityId)) return "Türkiye";
  const city = getCityById(cityId);
  if (!city) return cityId;
  if (district) return `${district}, ${city.label}, Türkiye`;
  return `${city.label}, Türkiye`;
}
