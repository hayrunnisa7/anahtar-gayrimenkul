export type ListingStatus = "satilik" | "kiralik";
export type PropertyCategory = "konut" | "arsa" | "isyeri";
export type UsageStatus = "bos" | "kiracili" | "mulk-sahibi-oturuyor";

/** Danışman panelindeki yayın durumu — "status" (satılık/kiralık) alanından bağımsızdır. */
export type ListingPublishStatus = "aktif" | "beklemede" | "pasif";

export const PUBLISH_STATUS_LABELS: Record<ListingPublishStatus, string> = {
  aktif: "Aktif",
  beklemede: "Beklemede",
  pasif: "Pasif",
};

export const USAGE_STATUS_LABELS: Record<UsageStatus, string> = {
  bos: "Boş",
  kiracili: "Kiracılı",
  "mulk-sahibi-oturuyor": "Mülk Sahibi Oturuyor",
};

export interface Listing {
  id: string;
  listingNo: string;
  slug: string;
  title: string;
  description: string;
  status: ListingStatus;
  category: PropertyCategory;
  subCategory: string;
  price: number;
  currency: "TRY";
  /** Brüt alan (m²) — kart ve filtrelerde kullanılan ana alan değeri. */
  area: number;
  /** Net alan (m²), yalnızca detay sayfasında gösterilir. */
  netArea?: number;
  roomCount?: string;
  /** "4/8" gibi "bulunduğu kat/toplam kat" biçiminde. */
  floor?: string;
  buildingAge?: number;
  bathroomCount?: number;
  balconyCount?: number;
  heating?: string;
  isFurnished?: boolean;
  titleDeedStatus?: string;
  loanEligible?: boolean;
  hasParking?: boolean;
  inComplex?: boolean;
  /** Aylık aidat (TRY). Uygulanamıyorsa undefined. */
  dues?: number;
  facade?: string[];
  usageStatus?: UsageStatus;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  photoCount: number;
  isFeatured: boolean;
  createdAt: string;
  advisorId: string;
  regionId: string;
  features: string[];
  publishStatus: ListingPublishStatus;
  viewCount: number;
}
