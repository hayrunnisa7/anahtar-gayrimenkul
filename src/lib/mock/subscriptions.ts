export type SubscriptionStatus = "aktif" | "iptal";

export interface Subscription {
  id: string;
  packageId: string;
  advisorId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  purchasedAt: string;
  status: SubscriptionStatus;
}

const initialMockSubscriptions: Subscription[] = [];

declare global {
  var __anahtarMockSubscriptions: Subscription[] | undefined;
}

/**
 * Demo/mock abonelik deposu — `/paketler/odeme` üzerinden yapılan her başarılı
 * mock ödeme burada bir kayıt oluşturur. `globalThis` üzerinde tutulur ki
 * Turbopack farklı modül grafiklerinde derlese bile aynı tekil diziye
 * yazsın/okusun (create-listing ile aynı kanıtlanmış desen).
 */
export const mockSubscriptions: Subscription[] = (globalThis.__anahtarMockSubscriptions ??=
  initialMockSubscriptions);
