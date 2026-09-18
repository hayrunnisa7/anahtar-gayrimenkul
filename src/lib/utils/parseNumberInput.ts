/**
 * Kullanıcının doğal olarak yazabileceği sayısal girdileri ("9.500.000",
 * "9,500,000", "9500000", " 150 ") normalize ederek parse eder.
 *
 * Bu proje HTML `<input type="number">` KULLANMAZ: tarayıcıların native
 * sayı doğrulaması, kullanıcı binlik ayraçlı bir değer ("9.500.000") yazdığı
 * anda alanı geçersiz sayıp formun SESSİZCE gönderilmesini engelliyor (React
 * onSubmit hiç tetiklenmiyor, hiçbir hata mesajı gösterilmiyor). Bunun yerine
 * düz metin alanları + bu yardımcı fonksiyon kullanılır ki geçersiz bir değer
 * her zaman kendi Türkçe hata mesajımızla kullanıcıya gösterilebilsin.
 */
export function parseNumberInput(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/[.,\s]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}
