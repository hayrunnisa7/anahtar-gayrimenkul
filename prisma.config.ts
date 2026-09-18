import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7'de bağlantı bilgisi artık `schema.prisma` yerine burada
 * tanımlanır. `DATABASE_URL` değeri `.env` dosyasından (gitignore'da,
 * asla commit edilmez) okunur. Bu dosya, CLI komutlarının (migrate, db
 * push, generate, studio) bağlantı dizesini nereden alacağını belirler.
 *
 * `prisma/config`'in `env()` yardımcısı yerine doğrudan `process.env`
 * okunuyor: `env()`, değişken tanımsızsa fırlatıyor. `prisma generate`
 * gerçek bir bağlantı kurmadığı için bu URL'e ihtiyaç duymaz — ama
 * `postinstall`'da (`npm install` sırasında) çalıştığından, dağıtım
 * platformunun o aşamada env değişkenlerini henüz sağlamadığı
 * durumlarda `env()` tüm kurulumu çökertebilir. Boş string'e düşmek
 * `generate`'i güvenli kılar; `migrate`/`db push`/`studio` gibi gerçek
 * bağlantı gerektiren komutlar zaten DATABASE_URL set edilmiş ortamda
 * çalıştırılır.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
