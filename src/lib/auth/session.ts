import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, parseSessionCookie, type SessionUser } from "@/lib/auth/session-cookie";
import { prisma } from "@/lib/db/prisma";

export type { SessionUser };

/**
 * Server Component / Server Action içinde geçerli oturumu okur.
 *
 * İki aşamalı doğrulama yapar: (1) çerezin imzası ve süresi geçerli mi
 * (`parseSessionCookie`, Edge'de de çalışan hızlı kontrol — `proxy.ts` bunu
 * kullanır), (2) kullanıcı hâlâ var mı ve askıya alınmamış mı (veritabanı
 * sorgusu — yalnızca burada, Node ortamında yapılabilir). İkinci kontrol,
 * bir hesap admin tarafından askıya alındığında, o hesabın çerezi süresi
 * dolmadan da geçersiz olmasını sağlar.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const session = await parseSessionCookie(store.get(SESSION_COOKIE_NAME)?.value);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isBlocked: true },
  });
  if (!user || user.isBlocked) return null;

  return session;
}
