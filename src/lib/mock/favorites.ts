declare global {
  var __anahtarMockFavorites: Record<string, string[]> | undefined;
}

/**
 * Demo/mock favori deposu: kullanıcı id'sinden favorilediği ilan id'lerine
 * eşleme. Yalnızca sunucu sürecinin belleğinde yaşar, sunucu yeniden
 * başladığında sıfırlanır. İleride "favorites" adında gerçek bir Postgres
 * tablosuyla değiştirilecektir. `globalThis` üzerinde tutulur ki Next.js dev
 * sunucusunda farklı modül grafikleri arasında tekil kalsın.
 */
export const mockFavorites: Record<string, string[]> = (globalThis.__anahtarMockFavorites ??= {});
