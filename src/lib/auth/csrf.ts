import type { SessionUser } from "@/lib/auth/session-cookie";

/**
 * Düz `<form method="POST">` mutasyon uç noktaları için CSRF koruması.
 * `SameSite=Lax` çerez ayarı zaten çoğu cross-site POST saldırısını
 * engeller; bu, ek bir savunma katmanıdır (defense in depth).
 *
 * Yöntem: her oturumun kendine özgü, tahmin edilemez bir `csrf` değeri
 * vardır (imzalı oturum çerezinin içinde taşınır — bkz. session-cookie.ts).
 * Her form bu değeri gizli bir alan olarak gönderir; sunucu, formdan gelen
 * değeri oturumdakiyle karşılaştırır. Saldırganın sitesi kurbanın oturum
 * çerezini OKUYAMAYACAĞI için (tarayıcı origin izolasyonu), doğru `csrf`
 * değerini forma gömemez.
 */

/** Oturum başına bir kez, girişte üretilir. */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

/** Formdan gelen `csrfToken` alanının, oturumdaki değerle eşleşip eşleşmediğini kontrol eder. */
export function isValidCsrfToken(formData: FormData, session: SessionUser): boolean {
  return formData.get("csrfToken") === session.csrf;
}
