import { SignJWT, jwtVerify } from "jose";
import type { AuthenticatedRole } from "@/types/user";

/**
 * Bu dosya `next/headers` gibi sunucuya özel API'lara bağımlı DEĞİLDİR,
 * böylece hem middleware (Edge runtime) hem de Server Component/Action
 * tarafında güvenle kullanılabilir.
 *
 * Oturum çerezi artık `jose` ile kriptografik olarak imzalanmış bir JWT'dir
 * (HS256). İmza, gizli bir anahtarla (`SESSION_SECRET`) üretilir — bu
 * anahtarı bilmeyen biri geçerli görünen bir oturum çerezi ÜRETEMEZ.
 * Böylece tarayıcıdan çerezi elle değiştirmek (ör. rolü "admin" yapmak)
 * imzayı geçersiz kılar ve oturum reddedilir.
 */

export const SESSION_COOKIE_NAME = "ag_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AuthenticatedRole;
  /**
   * Oturum başına üretilen, tahmin edilemez rastgele değer. Mutasyon yapan
   * düz `<form method="POST">` uç noktaları için CSRF koruması sağlar —
   * imzalı çerezin içinde taşındığı için sahte bir istek bu değeri asla
   * doğru tahmin edemez (bkz. `lib/auth/csrf.ts`).
   */
  csrf: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET ortam değişkeni tanımlı değil — oturum çerezleri imzalanamaz.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function serializeSession(user: SessionUser): Promise<string> {
  return new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role, csrf: user.csrf })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_COOKIE_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function parseSessionCookie(raw: string | undefined | null): Promise<SessionUser | null> {
  if (!raw) return null;

  try {
    const { payload } = await jwtVerify(raw, getSecretKey());
    if (
      typeof payload.id === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string" &&
      typeof payload.csrf === "string" &&
      (payload.role === "uye" || payload.role === "danisman" || payload.role === "admin")
    ) {
      return { id: payload.id, name: payload.name, email: payload.email, role: payload.role, csrf: payload.csrf };
    }
  } catch {
    // Geçersiz imza, bozulmuş token veya süresi dolmuş — oturum yok say.
  }

  return null;
}
