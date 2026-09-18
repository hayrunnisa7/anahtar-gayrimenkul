/**
 * Mevcut tüm ilanlar için embedding üretip `embedding` sütununa yazar.
 * Tekrar çalıştırıldığında hepsini yeniden üretir (embedding türetilmiş bir
 * veridir, düz metin şifreler gibi "zaten hash'li mi" kontrolüne gerek
 * yoktur — yeniden üretmek her zaman güvenlidir).
 *
 * Çalıştırma: npx tsx prisma/backfill-embeddings.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { generateAndSaveListingEmbedding } from "../src/lib/ai/embeddings";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });
const prisma = new PrismaClient({ adapter });

async function main() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      subCategory: true,
      city: true,
      district: true,
      neighborhood: true,
      features: true,
    },
  });

  console.log(`${listings.length} ilan için embedding üretiliyor (ilk çalıştırmada model indirilir, biraz sürebilir)...`);

  for (const listing of listings) {
    await generateAndSaveListingEmbedding(prisma, listing);
    console.log(`  ✓ ${listing.title}`);
  }

  console.log("Tamamlandı.");
}

main()
  .catch((e) => {
    console.error("Backfill başarısız:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
