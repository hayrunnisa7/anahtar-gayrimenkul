/**
 * Mevcut düz metin şifreleri Argon2id ile hash'ler. Tekrar tekrar
 * çalıştırılabilir (idempotent) — bir kullanıcının şifresi zaten Argon2id
 * formatındaysa ("$argon2id$" ile başlıyorsa) dokunulmaz. Hiçbir şifre
 * ekrana yazdırılmaz.
 *
 * Çalıştırma: npx tsx prisma/migrate-passwords.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3 });
const prisma = new PrismaClient({ adapter });

function isAlreadyHashed(password: string): boolean {
  return password.startsWith("$argon2id$");
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, password: true } });

  let migrated = 0;
  let alreadyHashed = 0;

  for (const user of users) {
    if (isAlreadyHashed(user.password)) {
      alreadyHashed++;
      continue;
    }

    const hashed = await argon2.hash(user.password);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    migrated++;
  }

  console.log(
    `Tamamlandı. ${users.length} kullanıcı tarandı — ${migrated} şifre hash'lendi, ` +
      `${alreadyHashed} zaten hash'liydi (atlandı).`,
  );
}

main()
  .catch((e) => {
    console.error("Şifre taşıma başarısız:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
