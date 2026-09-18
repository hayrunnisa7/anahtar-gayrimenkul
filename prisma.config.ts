import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7'de bağlantı bilgisi artık `schema.prisma` yerine burada
 * tanımlanır. `DATABASE_URL` değeri `.env` dosyasından (gitignore'da,
 * asla commit edilmez) okunur. Bu dosya, CLI komutlarının (migrate, db
 * push, generate, studio) bağlantı dizesini nereden alacağını belirler.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
