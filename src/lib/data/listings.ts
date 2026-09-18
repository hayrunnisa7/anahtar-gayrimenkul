import { prisma } from "@/lib/db/prisma";
import { UsageStatus as PrismaUsageStatus, type Listing as DbListing, type Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils/slugify";
import type {
  Listing,
  ListingPublishStatus,
  ListingStatus,
  PropertyCategory,
  UsageStatus,
} from "@/types/listing";

/**
 * Data-access layer for listings. Prisma/Supabase (PostgreSQL) üzerinden
 * okur/yazar. Fonksiyon imzaları bilinçli olarak mock dönemiyle birebir
 * aynı bırakıldı — çağıran sayfa/bileşen/route dosyalarının hiçbiri
 * değişmedi.
 */

export type ListingSort = "en-yeni" | "fiyat-artan" | "fiyat-azalan";

// "mulk-sahibi-oturuyor" gibi tire içeren değerler Prisma enum
// tanımlayıcısı olamayacağı için şemada `@map` ile eşlendi. Prisma Client
// üzerinden okurken/yazarken bu iki temsil (JS tarafı `mulkSahibiOturuyor`
// ↔ uygulama tarafı `"mulk-sahibi-oturuyor"`) arasında çeviri gerekir —
// diğer tüm enum'larda (tire içermedikleri için) böyle bir çeviriye gerek
// yok, string değerleri zaten birebir aynı.
function toDbUsageStatus(value?: UsageStatus): PrismaUsageStatus | undefined {
  if (!value) return undefined;
  if (value === "mulk-sahibi-oturuyor") return PrismaUsageStatus.mulkSahibiOturuyor;
  return value as PrismaUsageStatus;
}

function fromDbUsageStatus(value: PrismaUsageStatus | null): UsageStatus | undefined {
  if (!value) return undefined;
  if (value === PrismaUsageStatus.mulkSahibiOturuyor) return "mulk-sahibi-oturuyor";
  return value as UsageStatus;
}

function toAppListing(row: DbListing): Listing {
  return {
    id: row.id,
    listingNo: row.listingNo,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status as ListingStatus,
    category: row.category as PropertyCategory,
    subCategory: row.subCategory,
    price: row.price,
    currency: "TRY",
    area: row.area,
    netArea: row.netArea ?? undefined,
    roomCount: row.roomCount ?? undefined,
    floor: row.floor ?? undefined,
    buildingAge: row.buildingAge ?? undefined,
    bathroomCount: row.bathroomCount ?? undefined,
    balconyCount: row.balconyCount ?? undefined,
    heating: row.heating ?? undefined,
    isFurnished: row.isFurnished ?? undefined,
    titleDeedStatus: row.titleDeedStatus ?? undefined,
    loanEligible: row.loanEligible ?? undefined,
    hasParking: row.hasParking ?? undefined,
    inComplex: row.inComplex ?? undefined,
    dues: row.dues ?? undefined,
    facade: row.facade,
    usageStatus: fromDbUsageStatus(row.usageStatus),
    city: row.city,
    district: row.district,
    neighborhood: row.neighborhood,
    address: row.address,
    photoCount: row.photoCount,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    advisorId: row.advisorId,
    regionId: row.regionId ?? "",
    features: row.features,
    publishStatus: row.publishStatus as ListingPublishStatus,
    viewCount: row.viewCount,
  };
}

/**
 * Genel/herkese açık sayfalarda (ana sayfa, ilan listeleme, ilan detay)
 * yalnızca "aktif" ilanlar gösterilir — "beklemede" (admin onayı bekleyen)
 * ve "pasif" ilanlar yalnızca ait olduğu danışmanın panelinde görünür.
 */
const publicWhere = { publishStatus: "aktif" as const };

/**
 * Yeni/güncellenen bir ilan için embedding üretip kaydeder. Bu bir
 * zenginleştirme adımıdır — başarısız olursa (ör. model ilk kez
 * yükleniyorsa geçici bir hata) ilan oluşturma/güncelleme işlemini
 * BOZMAMALI, yalnızca uyarı olarak loglanır.
 *
 * `@/lib/ai/embeddings` (ve onun native onnxruntime bağımlılığı) burada
 * BİLEREK dinamik `import()` ile yükleniyor — statik bir import, bu
 * dosyayı (neredeyse tüm route'ların ortak veri katmanını) kullanan HER
 * sayfanın sunucu paketine gereksiz yere ağır bir native binary sürükler.
 * Yalnızca ilan oluşturma/güncelleme çağrıldığında gerçekten yükleniyor.
 */
async function safelyEmbedListing(row: DbListing): Promise<void> {
  try {
    const { generateAndSaveListingEmbedding } = await import("@/lib/ai/embeddings");
    await generateAndSaveListingEmbedding(prisma, row);
  } catch (err) {
    console.warn(`İlan embedding'i üretilemedi (id: ${row.id}):`, err);
  }
}

/** Herkese açık aramalarda (ör. AI arama) taranacak temel ilan havuzu. */
export async function getPublicListings(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({ where: publicWhere });
  return rows.map(toAppListing);
}

export interface ListingFilters {
  status?: ListingStatus;
  category?: PropertyCategory;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomCount?: string;
  sort?: ListingSort;
}

export interface ListingFilterOptions {
  cities: string[];
  districtsByCity: Record<string, string[]>;
  roomCounts: string[];
}

export async function getFilteredListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const where: Prisma.ListingWhereInput = { publishStatus: "aktif" };
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.city) where.city = filters.city;
  if (filters.district) where.district = filters.district;
  if (filters.roomCount) where.roomCount = filters.roomCount;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = { gte: filters.minPrice, lte: filters.maxPrice };
  }
  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    where.area = { gte: filters.minArea, lte: filters.maxArea };
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    filters.sort === "fiyat-artan"
      ? { price: "asc" }
      : filters.sort === "fiyat-azalan"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const rows = await prisma.listing.findMany({ where, orderBy });
  return rows.map(toAppListing);
}

export async function getListingFilterOptions(): Promise<ListingFilterOptions> {
  const visibleListings = await prisma.listing.findMany({
    where: publicWhere,
    select: { city: true, district: true, roomCount: true },
  });

  const cities = Array.from(new Set(visibleListings.map((l) => l.city))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );

  const districtsByCity: Record<string, string[]> = {};
  for (const listing of visibleListings) {
    const list = districtsByCity[listing.city] ?? [];
    if (!list.includes(listing.district)) list.push(listing.district);
    districtsByCity[listing.city] = list;
  }
  for (const city of Object.keys(districtsByCity)) {
    districtsByCity[city].sort((a, b) => a.localeCompare(b, "tr"));
  }

  const roomCounts = Array.from(
    new Set(visibleListings.map((l) => l.roomCount).filter((r): r is string => Boolean(r))),
  ).sort((a, b) => a.localeCompare(b, "tr"));

  return { cities, districtsByCity, roomCounts };
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { ...publicWhere, isFeatured: true },
    take: limit,
  });
  return rows.map(toAppListing);
}

export async function getLatestListings(limit = 8): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: publicWhere,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toAppListing);
}

export async function getListingBySlug(slug: string): Promise<Listing | undefined> {
  const row = await prisma.listing.findUnique({ where: { slug } });
  return row ? toAppListing(row) : undefined;
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  const row = await prisma.listing.findUnique({ where: { id } });
  return row ? toAppListing(row) : undefined;
}

/** Admin onayı bekleyen ilanlar, danışmandan bağımsız olarak, en yeni önde. */
export async function getPendingListings(): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { publishStatus: "beklemede" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAppListing);
}

export interface ListingStats {
  total: number;
  active: number;
  pending: number;
  passive: number;
}

export async function getListingStats(): Promise<ListingStats> {
  const [total, active, pending, passive] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { publishStatus: "aktif" } }),
    prisma.listing.count({ where: { publishStatus: "beklemede" } }),
    prisma.listing.count({ where: { publishStatus: "pasif" } }),
  ]);
  return { total, active, pending, passive };
}

/**
 * İlanın yayın durumunu günceller. Yetki kontrolü burada YAPILMAZ — çağıran
 * taraf (route handler) ilanın oturum sahibine ait olduğunu doğrulamalıdır.
 */
export async function setListingPublishStatus(
  id: string,
  publishStatus: ListingPublishStatus,
): Promise<Listing | undefined> {
  try {
    const row = await prisma.listing.update({ where: { id }, data: { publishStatus } });
    return toAppListing(row);
  } catch {
    return undefined;
  }
}

export interface NewListingInput {
  status: ListingStatus;
  category: PropertyCategory;
  subCategory: string;
  title: string;
  description: string;
  price: number;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  area: number;
  netArea?: number;
  roomCount?: string;
  bathroomCount?: number;
  buildingAge?: number;
  floor?: string;
  heating?: string;
  balconyCount?: number;
  isFurnished?: boolean;
  hasParking?: boolean;
  inComplex?: boolean;
  dues?: number;
  facade?: string[];
  titleDeedStatus?: string;
  loanEligible?: boolean;
  usageStatus?: UsageStatus;
  features: string[];
  photoCount: number;
}

/** Girilen il/ilçeye göre en iyi eşleşen bölgeyi bulur (bölge sayısı az olduğu için tüm bölgeler çekilip JS'te karşılaştırılır). */
async function findMatchingRegionId(city: string, district: string): Promise<string | undefined> {
  const regions = await prisma.region.findMany();
  const match = regions.find(
    (r) =>
      r.city.toLocaleLowerCase("tr") === city.toLocaleLowerCase("tr") &&
      r.name.toLocaleLowerCase("tr") === district.toLocaleLowerCase("tr"),
  );
  return match?.id;
}

/**
 * Danışman panelinden yeni bir ilan oluşturur. Yeni ilan her zaman
 * "beklemede" durumunda başlar (admin onayı simülasyonu) ve mutlaka
 * `advisorId` parametresiyle verilen oturum sahibine atanır — çağıran taraf
 * bunu asla form verisinden almamalı, session'dan almalıdır.
 */
export async function createListing(input: NewListingInput, advisorId: string): Promise<Listing> {
  const id = `lst-${Date.now().toString(36)}`;
  const listingNo = `AG-${Date.now().toString().slice(-8)}`;

  let slug = slugify(`${input.title}-${input.district}`) || `ilan-${Date.now()}`;
  if ((await prisma.listing.count({ where: { slug } })) > 0) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const regionId = await findMatchingRegionId(input.city, input.district);

  const row = await prisma.listing.create({
    data: {
      id,
      listingNo,
      slug,
      title: input.title,
      description: input.description,
      status: input.status,
      category: input.category,
      subCategory: input.subCategory,
      price: input.price,
      currency: "TRY",
      area: input.area,
      netArea: input.netArea,
      roomCount: input.roomCount,
      floor: input.floor,
      buildingAge: input.buildingAge,
      bathroomCount: input.bathroomCount,
      balconyCount: input.balconyCount,
      heating: input.heating,
      isFurnished: input.isFurnished,
      titleDeedStatus: input.titleDeedStatus,
      loanEligible: input.loanEligible,
      hasParking: input.hasParking,
      inComplex: input.inComplex,
      dues: input.dues,
      facade: input.facade ?? [],
      usageStatus: toDbUsageStatus(input.usageStatus),
      city: input.city,
      district: input.district,
      neighborhood: input.neighborhood,
      address: input.address,
      photoCount: input.photoCount,
      isFeatured: false,
      features: input.features,
      publishStatus: "beklemede",
      viewCount: 0,
      advisorId,
      regionId,
    },
  });

  await safelyEmbedListing(row);
  return toAppListing(row);
}

export interface ListingUpdateInput extends Omit<NewListingInput, "photoCount"> {
  /** Yeni fotoğraf yüklenmediyse mevcut sayı korunur. */
  photoCount?: number;
}

/**
 * Danışman panelinden mevcut bir ilanı günceller. Yetki kontrolü burada
 * yapılır: ilan `advisorId` parametresiyle verilen oturum sahibine ait
 * değilse `undefined` döner ve hiçbir alan değiştirilmez. Slug ve yayın
 * durumu düzenleme sırasında değişmez — böylece mevcut bağlantılar ve
 * favoriler geçerliliğini korur.
 */
export async function updateListing(
  id: string,
  advisorId: string,
  input: ListingUpdateInput,
): Promise<Listing | undefined> {
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing || existing.advisorId !== advisorId) return undefined;

  const regionId = (await findMatchingRegionId(input.city, input.district)) ?? existing.regionId ?? undefined;

  const row = await prisma.listing.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      category: input.category,
      subCategory: input.subCategory,
      price: input.price,
      area: input.area,
      netArea: input.netArea,
      roomCount: input.roomCount,
      floor: input.floor,
      buildingAge: input.buildingAge,
      bathroomCount: input.bathroomCount,
      balconyCount: input.balconyCount,
      heating: input.heating,
      isFurnished: input.isFurnished,
      titleDeedStatus: input.titleDeedStatus,
      loanEligible: input.loanEligible,
      hasParking: input.hasParking,
      inComplex: input.inComplex,
      dues: input.dues,
      facade: input.facade ?? [],
      usageStatus: toDbUsageStatus(input.usageStatus),
      city: input.city,
      district: input.district,
      neighborhood: input.neighborhood,
      address: input.address,
      features: input.features,
      regionId,
      photoCount: input.photoCount ?? existing.photoCount,
    },
  });

  await safelyEmbedListing(row);
  return toAppListing(row);
}

export async function getListingsByRegion(regionId: string): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({ where: { regionId, publishStatus: "aktif" } });
  return rows.map(toAppListing);
}

export async function getListingsByAdvisor(advisorId: string): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({ where: { advisorId } });
  return rows.map(toAppListing);
}

/** Danışman profil sayfası gibi herkese açık yerlerde yalnızca aktif ilanlar gösterilir. */
export async function getActiveListingsByAdvisor(advisorId: string): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({ where: { advisorId, publishStatus: "aktif" } });
  return rows.map(toAppListing);
}

export async function getSimilarListings(listing: Listing, limit = 3): Promise<Listing[]> {
  const rows = await prisma.listing.findMany({
    where: { id: { not: listing.id }, category: listing.category, publishStatus: "aktif" },
  });

  const scored = rows
    .map(toAppListing)
    .map((l) => {
      let score = 0;
      if (l.district === listing.district) score += 2;
      else if (l.city === listing.city) score += 1;
      if (l.status === listing.status) score += 1;
      return { listing: l, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.listing);
}
