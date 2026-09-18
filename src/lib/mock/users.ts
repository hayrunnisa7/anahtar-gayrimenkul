import type { AuthenticatedRole } from "@/types/user";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  /** DEMO AMAÇLIDIR — düz metin şifre. Gerçek uygulamada asla kullanılmaz (hash + gerçek kimlik doğrulama servisi gerekir). */
  password: string;
  role: AuthenticatedRole;
  /** Admin tarafından askıya alınan hesaplar giriş yapamaz. */
  isBlocked?: boolean;
}

const initialMockUsers: MockUser[] = [
  {
    id: "user-1",
    name: "Ayşe Kaya",
    email: "kullanici@demo.com",
    password: "demo1234",
    role: "uye",
  },
  {
    // Mock danışman verisiyle (adv-1) eşleşir, ileride danışman paneli bu
    // kimliği üzerinden ilanlarını/istatistiklerini çekebilir.
    id: "adv-1",
    name: "Elif Yıldız",
    email: "danisman@demo.com",
    password: "demo1234",
    role: "danisman",
  },
  {
    id: "admin-1",
    name: "Sistem Yöneticisi",
    email: "admin@demo.com",
    password: "demo1234",
    role: "admin",
  },
];

declare global {
  var __anahtarMockUsers: MockUser[] | undefined;
}

/**
 * Demo/mock kullanıcı deposu. Bu dizi yalnızca sunucu sürecinin belleğinde
 * yaşar; /kayit üzerinden eklenen yeni kullanıcılar da buraya eklenir ama
 * sunucu yeniden başladığında sıfırlanır. İleride gerçek PostgreSQL tabanlı
 * bir kullanıcı tablosuyla değiştirilecektir.
 *
 * `globalThis` üzerinde tutulur ki Next.js dev sunucusunda Server Action'lar
 * farklı modül grafiklerinde derlense bile hep aynı tekil diziye yazsın/okusun.
 */
export const mockUsers: MockUser[] = (globalThis.__anahtarMockUsers ??= initialMockUsers);
