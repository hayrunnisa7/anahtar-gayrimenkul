import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

/**
 * Login rate limiting. Hesap (e-posta) ve IP bazlı iki bağımsız sayaç aynı
 * `LoginThrottle` tablosunu, farklı `key` önekleriyle paylaşır
 * ("email:..." / "ip:..."). Herhangi biri eşiği aşarsa giriş engellenir.
 */

export const EMAIL_WINDOW_MS = 15 * 60 * 1000;
export const EMAIL_MAX_ATTEMPTS = 5;
export const EMAIL_LOCK_MS = 15 * 60 * 1000;

export const IP_WINDOW_MS = 15 * 60 * 1000;
export const IP_MAX_ATTEMPTS = 20;
export const IP_LOCK_MS = 15 * 60 * 1000;

export function emailKey(email: string): string {
  return `email:${email}`;
}

export function ipKey(ip: string): string {
  return `ip:${ip}`;
}

/**
 * İstemci IP'sini `X-Forwarded-For` başlığından okur. Bu, YALNIZCA
 * uygulamanın önünde güvenilir tek bir reverse proxy (Caddy/Nginx) olduğu
 * ve Next.js sürecinin dışarıdan doğrudan erişilemediği varsayımı altında
 * güvenlidir — aksi halde bir istemci bu başlığı kendisi uydurup sınırı
 * atlatabilir/başkasının IP'sini hedef gösterebilir. Bu güvenli proxy
 * yapılandırması (14.5'te) devreye girene kadar, `X-Forwarded-For` başlığı
 * olmayan yerel/geliştirme isteklerinde `"unknown"` sabit anahtarına
 * düşülür — bu, tek bir geliştirme makinesinden yapılan test istekleri
 * için de tutarlı bir davranıştır.
 *
 * Tek proxy hop'u varsayımıyla, zincirdeki SON değer alınır (proxy'nin
 * gözlemlediği gerçek bağlantı) — baştaki değerler istemci tarafından
 * uydurulmuş olabilir. Uygulama ileride birden fazla proxy katmanının
 * (ör. CDN + Nginx) arkasına alınırsa, doğru hop pozisyonu yeniden
 * değerlendirilmelidir.
 */
export async function getClientIp(): Promise<string> {
  const hdrs = await headers();

  const forwardedFor = hdrs.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  const realIp = hdrs.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export interface RateLimitStatus {
  limited: boolean;
  retryAfterMinutes: number;
}

export async function checkRateLimit(key: string): Promise<RateLimitStatus> {
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  if (!row || !row.lockedUntil) return { limited: false, retryAfterMinutes: 0 };

  const now = Date.now();
  const lockedUntil = row.lockedUntil.getTime();
  if (lockedUntil <= now) return { limited: false, retryAfterMinutes: 0 };

  return { limited: true, retryAfterMinutes: Math.ceil((lockedUntil - now) / 60_000) };
}

export async function recordFailedAttempt(
  key: string,
  windowMs: number,
  maxAttempts: number,
  lockMs: number,
): Promise<void> {
  const now = new Date();
  const existing = await prisma.loginThrottle.findUnique({ where: { key } });

  const windowExpired = !existing || now.getTime() - existing.windowStart.getTime() > windowMs;

  if (windowExpired) {
    await prisma.loginThrottle.upsert({
      where: { key },
      create: { key, failedCount: 1, windowStart: now, lockedUntil: null },
      update: { failedCount: 1, windowStart: now, lockedUntil: null },
    });
    return;
  }

  const nextCount = existing.failedCount + 1;
  await prisma.loginThrottle.update({
    where: { key },
    data: {
      failedCount: nextCount,
      lockedUntil: nextCount >= maxAttempts ? new Date(now.getTime() + lockMs) : existing.lockedUntil,
    },
  });
}

/** Başarılı girişte hesap sayacı sıfırlanır. IP sayacı BİLEREK sıfırlanmaz — yalnızca zaman penceresiyle kendiliğinden düşer (bkz. plan). */
export async function resetAttempts(key: string): Promise<void> {
  await prisma.loginThrottle.deleteMany({ where: { key } });
}
