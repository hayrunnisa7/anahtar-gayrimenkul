import { pipeline, env, type FeatureExtractionPipeline } from "@huggingface/transformers";
import type { PrismaClient } from "@prisma/client";
import os from "node:os";
import path from "node:path";

// `@huggingface/transformers`'ın varsayılan dosya önbelleği
// (`env.cacheDir`), paketin kendi `node_modules` dizini altındaki
// `./.cache`'e yazar. Vercel'in serverless fonksiyon dosya sistemi
// salt-okunurdur (yalnızca `/tmp` yazılabilir) — varsayılan yolla model
// indirme her seferinde ENOENT ile patlar ve `search.ts`'teki try/catch
// bunu SESSİZCE yutup anahtar-kelime filtresine düşer, yani anlamsal arama
// hiç çalışmadan "başarılı" görünür. Önbellek dizinini açıkça yazılabilir
// bir konuma (`os.tmpdir()`, hem yerelde hem Vercel'de her zaman yazılabilir)
// yönlendirmek bu sessiz bozulmayı önler.
env.cacheDir = path.join(os.tmpdir(), "hf-cache");

// NOT: Kasıtlı olarak "server-only" işaretlenmedi — bu modül hem uygulama
// içinden (lib/data/listings.ts üzerinden, zaten yalnızca Server
// Component/Action bağlamında kullanılan bir katman) hem de bağımsız
// script'lerden (prisma/backfill-embeddings.ts, düz Node/tsx ile çalışır,
// Next.js bundler bağlamı yok) import edilir. `@huggingface/transformers`
// ve `pg` gibi Node-only bağımlılıkları zaten bir istemci paketine
// sızarsa derleme başarısız olur — ayrı bir koruma katmanına gerek yok.

/**
 * Yerel (ücretsiz, hesap/API anahtarı gerektirmeyen) embedding üretimi.
 * `Xenova/paraphrase-multilingual-MiniLM-L12-v2` modeli ilk çağrıda Hugging
 * Face'ten indirilip yerelde önbelleğe alınır, sonrasında tamamen
 * çevrimdışı ve ücretsiz çalışır. 384 boyutlu, normalize edilmiş vektörler
 * üretir.
 *
 * NOT: İlk denemede tek dilli `Xenova/all-MiniLM-L6-v2` kullanılmıştı, ama
 * testte Türkçe metinlerde anlamsal ayrım yapamadığı ortaya çıktı (ör.
 * "aile için sakin, ferah bir ev" sorgusunda bir arazi ilanı, gerçek bir
 * daire ilanından daha "benzer" çıkıyordu — çünkü bu model esasen İngilizce
 * için eğitilmiş). Çok dilli bu model aynı boyutta (384) ama Türkçe dahil
 * 50+ dilde anlamlı benzerlik skorları üretiyor — karşılaştırmalı testle
 * doğrulandı.
 *
 * Model tekil (singleton) olarak `globalThis` üzerinde tutulur — Prisma
 * Client'ta ve mock veri depolarında kullanılan tekil desenin aynısı —
 * böylece her istek için yeniden yüklenmez.
 */

declare global {
  var __anahtarEmbeddingPipeline: Promise<FeatureExtractionPipeline> | undefined;
}

function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  return (globalThis.__anahtarEmbeddingPipeline ??= pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
  ));
}

export interface EmbeddableListing {
  title: string;
  description: string;
  subCategory: string;
  city: string;
  district: string;
  neighborhood: string;
  features: string[];
}

/** İlanın hangi metninden embedding üretileceğini belirler — anlamsal aramanın kalitesi buna bağlıdır. */
export function buildEmbeddingText(listing: EmbeddableListing): string {
  return [
    listing.title,
    listing.description,
    listing.subCategory,
    `${listing.district}, ${listing.city}`,
    listing.neighborhood,
    listing.features.join(", "),
  ]
    .filter(Boolean)
    .join(". ");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/**
 * Bir ilanın `embedding` sütununu ham SQL ile yazar (Prisma pgvector'ü
 * native desteklemediği için `Unsupported` alanlar normal `update()` ile
 * yazılamaz). `prisma` parametre olarak alınır ki bu fonksiyon hem
 * uygulamanın tekil client'ıyla (`@/lib/db/prisma`) hem de bağımsız
 * script'lerin (backfill vb.) kendi client örnekleriyle kullanılabilsin.
 */
export async function saveListingEmbedding(
  prisma: PrismaClient,
  listingId: string,
  embedding: number[],
): Promise<void> {
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRaw`UPDATE listings SET embedding = ${vectorLiteral}::vector WHERE id = ${listingId}`;
}

export async function generateAndSaveListingEmbedding(
  prisma: PrismaClient,
  listing: EmbeddableListing & { id: string },
): Promise<void> {
  const text = buildEmbeddingText(listing);
  const embedding = await generateEmbedding(text);
  await saveListingEmbedding(prisma, listing.id, embedding);
}
