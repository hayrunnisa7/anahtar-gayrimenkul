import { prisma } from "@/lib/db/prisma";
import { generateEmbedding } from "@/lib/ai/embeddings";
import { getPublicListings } from "@/lib/data/listings";
import type { Listing } from "@/types/listing";

export interface NaturalLanguageSearchResult {
  query: string;
  matches: Listing[];
  summary: string;
}

const RESULT_LIMIT = 9;

/**
 * Verilen ilan kümesini, sorgu embedding'ine pgvector cosine mesafesiyle en
 * yakın olacak şekilde yeniden sıralar. Zaten elimizde tam `Listing[]`
 * nesneleri olduğu için (tip dönüşümleri `lib/data/listings.ts`'te
 * yapılmış), burada yalnızca SIRALAMA için bir ID listesi çekilir — ikinci
 * bir tam veri çekimi/eşleme yapılmaz.
 */
async function rankBySimilarity(
  listings: Listing[],
  queryEmbedding: number[],
  limit: number,
): Promise<Listing[]> {
  if (listings.length === 0) return [];

  const ids = listings.map((l) => l.id);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  const ranked = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM listings
    WHERE id = ANY(${ids}) AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;

  const byId = new Map(listings.map((l) => [l.id, l]));
  const rankedListings = ranked
    .map((r) => byId.get(r.id))
    .filter((l): l is Listing => Boolean(l));

  // Henüz embedding'i olmayan (ör. backfill'den önce eklenmiş) ilanlar
  // sıralamadan düşmez, sona eklenir — hiçbir eşleşen ilan kaybolmaz.
  const rankedIds = new Set(rankedListings.map((l) => l.id));
  const remaining = listings.filter((l) => !rankedIds.has(l.id));

  return [...rankedListings, ...remaining].slice(0, limit);
}

/**
 * Doğal dil ilan araması — iki katmanlı çalışır:
 *
 * 1) KESİN FİLTRELER (şehir/ilçe/oda sayısı/bütçe/kategori anahtar
 *    kelimeleri): regex/anahtar kelime tabanlı, hiçbir zaman ihlal
 *    edilmez — kullanıcı "500.000 TL altı" dediyse bu limitin üzerindeki
 *    hiçbir ilan asla sonuçlarda görünmez.
 * 2) ANLAMSAL SIRALAMA (pgvector + yerel embedding modeli): kesin
 *    filtrelerden geçen (ya da hiç filtre yoksa herkese açık tüm) havuzu,
 *    sorgunun ANLAMINA en yakın olacak şekilde sıralar. Böylece "aile için
 *    sakin, ferah bir ev" gibi hiçbir sabit anahtar kelimeye uymayan ama
 *    anlamca uygun ilanlar da artık öne çıkabiliyor.
 *
 * Anlamsal sıralama adımı başarısız olursa (ör. model geçici bir sorun
 * yaşarsa) sessizce eski davranışa (filtre sırası) düşülür — arama hiçbir
 * zaman hata vermez.
 */
export async function searchListingsWithNaturalLanguage(
  query: string,
): Promise<NaturalLanguageSearchResult> {
  const normalized = query.toLocaleLowerCase("tr-TR");
  const pool = await getPublicListings();

  const keywordMap: Record<string, (l: Listing) => boolean> = {
    kiralık: (l) => l.status === "kiralik",
    kiralik: (l) => l.status === "kiralik",
    satılık: (l) => l.status === "satilik",
    satilik: (l) => l.status === "satilik",
    arsa: (l) => l.category === "arsa",
    konut: (l) => l.category === "konut",
    ofis: (l) => l.subCategory === "Ofis",
    işyeri: (l) => l.category === "isyeri",
    dükkan: (l) => l.subCategory === "Dükkan",
    daire: (l) => l.subCategory === "Daire",
    villa: (l) => l.subCategory === "Villa",
    müstakil: (l) => l.subCategory === "Müstakil Ev",
    deniz: (l) => l.features.some((f) => f.toLocaleLowerCase("tr-TR").includes("deniz")),
    bahçeli: (l) => l.features.some((f) => f.toLocaleLowerCase("tr-TR").includes("bahçe")),
    eşyalı: (l) => l.isFurnished === true,
    otoparklı: (l) => l.hasParking === true,
  };

  const cities = ["istanbul", "ankara", "izmir", "bursa", "antalya"];
  const districtHints = Array.from(new Set(pool.map((l) => l.district.toLocaleLowerCase("tr-TR"))));

  let matches = pool;
  let hardFilterApplied = false;

  const activeFilters = Object.entries(keywordMap).filter(([kw]) => normalized.includes(kw));
  if (activeFilters.length > 0) {
    matches = matches.filter((l) => activeFilters.every(([, predicate]) => predicate(l)));
    hardFilterApplied = true;
  }

  const matchedCity = cities.find((c) => normalized.includes(c));
  if (matchedCity) {
    matches = matches.filter((l) => l.city.toLocaleLowerCase("tr-TR").includes(matchedCity));
    hardFilterApplied = true;
  }

  const matchedDistrict = districtHints.find((d) => normalized.includes(d));
  if (matchedDistrict) {
    matches = matches.filter((l) => l.district.toLocaleLowerCase("tr-TR") === matchedDistrict);
    hardFilterApplied = true;
  }

  // Oda sayısı: "3+1" gibi bir örüntü yakalanırsa doğrudan eşleştir.
  const roomMatch = normalized.match(/(\d)\s*\+\s*(\d)/);
  if (roomMatch) {
    const roomCount = `${roomMatch[1]}+${roomMatch[2]}`;
    matches = matches.filter((l) => l.roomCount === roomCount);
    hardFilterApplied = true;
  }

  // Bütçe: "30.000", "9.500.000" gibi binlik ayraçlı ya da 4+ haneli düz
  // sayılar bir üst fiyat sınırı olarak yorumlanır.
  const budgetMatch = normalized.match(/(\d{1,3}(?:[.,]\d{3})+|\d{4,})/);
  if (budgetMatch) {
    const budget = Number(budgetMatch[1].replace(/[.,]/g, ""));
    if (Number.isFinite(budget) && budget > 0) {
      matches = matches.filter((l) => l.price <= budget);
      hardFilterApplied = true;
    }
  }

  // Kesin filtreler bir sonucu tamamen eledi ise (ör. bütçe çok düşük)
  // anlamsal aramaya DÜŞÜLMEZ — bu, kullanıcının açıkça belirttiği bir
  // kısıtın yok sayılması anlamına gelirdi. Filtre yoksa ya da filtreden
  // geçen ilan varsa, kalan havuz anlamsal olarak sıralanır.
  let ranked = matches.slice(0, RESULT_LIMIT);
  if (!hardFilterApplied || matches.length > 0) {
    try {
      const queryEmbedding = await generateEmbedding(query);
      ranked = await rankBySimilarity(matches, queryEmbedding, RESULT_LIMIT);
    } catch (err) {
      console.warn("Anlamsal sıralama başarısız, filtre sırasına dönülüyor:", err);
    }
  }

  return {
    query,
    matches: ranked,
    summary:
      matches.length > 0
        ? `"${query}" ifadenize uygun ${matches.length} ilan bulundu.`
        : `"${query}" ifadenize tam uyan ilan bulunamadı, tüm ilanları inceleyebilirsiniz.`,
  };
}
