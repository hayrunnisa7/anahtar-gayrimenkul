/**
 * Mock veriyi Supabase'deki (şu an boş) tablolara aktaran tek seferlik seed
 * script'i. `src/lib/data/*.ts` dosyalarına DOKUNMAZ — bu script çalıştıktan
 * sonra bile uygulama hâlâ mock diziden okumaya devam eder. Tekrar tekrar
 * çalıştırılırsa (tablo zaten doluysa) veri tekrarlamaması için baştan
 * kontrol eder ve çıkar. Tüm eklemeler tek bir transaction içinde yapılır —
 * bir yerde hata olursa hiçbir kayıt kalıcı olmaz (hepsi ya da hiçbiri).
 *
 * Çalıştırma: npx tsx prisma/seed.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UsageStatus, type Prisma } from "@prisma/client";
import { mockUsers } from "../src/lib/mock/users";
import { mockAdvisors } from "../src/lib/mock/advisors";
import { mockRegions } from "../src/lib/mock/regions";
import { mockListings } from "../src/lib/mock/listings";
import { mockPackages } from "../src/lib/mock/packages";
import { mockBlogPosts } from "../src/lib/mock/blog-posts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function toUsageStatus(value?: string): UsageStatus | undefined {
  if (!value) return undefined;
  if (value === "mulk-sahibi-oturuyor") return UsageStatus.mulkSahibiOturuyor;
  return value as UsageStatus;
}

async function seedAll(tx: Prisma.TransactionClient) {
  console.log("users...");
  for (const u of mockUsers) {
    await tx.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        isBlocked: u.isBlocked ?? false,
      },
    });
  }

  console.log("regions...");
  for (const r of mockRegions) {
    await tx.region.create({
      data: { id: r.id, slug: r.slug, name: r.name, city: r.city, description: r.description },
    });
  }

  console.log("advisors...");
  for (const a of mockAdvisors) {
    await tx.advisor.create({
      data: {
        id: a.id,
        slug: a.slug,
        name: a.name,
        title: a.title,
        phone: a.phone,
        whatsapp: a.whatsapp,
        email: a.email,
        bio: a.bio,
        regions: a.regions,
      },
    });
  }

  console.log("listings...");
  for (const l of mockListings) {
    await tx.listing.create({
      data: {
        id: l.id,
        listingNo: l.listingNo,
        slug: l.slug,
        title: l.title,
        description: l.description,
        status: l.status,
        category: l.category,
        subCategory: l.subCategory,
        price: l.price,
        currency: l.currency,
        area: l.area,
        netArea: l.netArea,
        roomCount: l.roomCount,
        floor: l.floor,
        buildingAge: l.buildingAge,
        bathroomCount: l.bathroomCount,
        balconyCount: l.balconyCount,
        heating: l.heating,
        isFurnished: l.isFurnished,
        titleDeedStatus: l.titleDeedStatus,
        loanEligible: l.loanEligible,
        hasParking: l.hasParking,
        inComplex: l.inComplex,
        dues: l.dues,
        facade: l.facade ?? [],
        usageStatus: toUsageStatus(l.usageStatus),
        city: l.city,
        district: l.district,
        neighborhood: l.neighborhood,
        address: l.address,
        photoCount: l.photoCount,
        isFeatured: l.isFeatured,
        createdAt: new Date(l.createdAt),
        features: l.features,
        publishStatus: l.publishStatus,
        viewCount: l.viewCount,
        advisorId: l.advisorId,
        regionId: l.regionId || null,
      },
    });
  }

  console.log("saas_packages...");
  for (const p of mockPackages) {
    await tx.saasPackage.create({
      data: {
        id: p.id,
        name: p.name,
        priceMonthly: p.priceMonthly,
        description: p.description,
        features: p.features,
        listingLimit: p.listingLimit === "sinirsiz" ? null : p.listingLimit,
        highlighted: p.highlighted,
        cta: p.cta,
      },
    });
  }

  console.log("blog_posts...");
  for (const b of mockBlogPosts) {
    await tx.blogPost.create({
      data: {
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        content: b.content,
        author: b.author,
        publishedAt: new Date(b.publishedAt),
        readMinutes: b.readMinutes,
        category: b.category,
      },
    });
  }
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(
      `Durduruldu: "users" tablosunda zaten ${existingUsers} kayıt var. ` +
        "Tekrar tekrarlamayı önlemek için seed işlemi atlandı.",
    );
    return;
  }

  await prisma.$transaction(seedAll, { timeout: 30000 });

  console.log(
    "Seed tamamlandı. subscriptions ve favorites bilinçli olarak boş bırakıldı " +
      "(bellekteki mock deposu da boş — aktarılacak gerçek veri yok).",
  );
}

main()
  .catch((e) => {
    console.error("Seed başarısız, hiçbir kayıt kalıcı olmadı:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
