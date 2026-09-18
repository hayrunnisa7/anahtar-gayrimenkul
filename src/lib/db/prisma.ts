import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client tekil örneği. Next.js dev sunucusunda hot-reload sırasında
 * her modül yeniden değerlendirildiğinde yeni bir bağlantı havuzu
 * oluşmaması için `globalThis` üzerinde tutulur — mock veri deposu
 * dosyalarında (`lib/mock/*.ts`) kullanılan tekil desenin aynısı.
 *
 * `max: 3`: `next build` birden fazla paralel worker sürecinde SSG
 * sayfalarını üretir; `globalThis` yalnızca TEK bir sürecin içinde
 * paylaşılabildiği için her worker kendi bağlantı havuzunu açar. Supabase
 * Session Pooler'ın toplam istemci limiti sınırlı olduğundan (küçük
 * projelerde tipik olarak 15), her havuzu küçük tutmak gerekiyor —
 * aksi halde "max clients reached" hatasıyla build başarısız olur.
 */
declare global {
  var __anahtarPrisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = (globalThis.__anahtarPrisma ??= createPrismaClient());
