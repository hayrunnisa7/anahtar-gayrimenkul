import { prisma } from "@/lib/db/prisma";
import type { Subscription as DbSubscription } from "@prisma/client";
import type { Subscription, SubscriptionStatus } from "@/lib/mock/subscriptions";

/**
 * Data-access layer for SaaS package subscriptions. Prisma/Supabase
 * üzerinden okur/yazar. `Subscription` tipi mock dosyasından import edilir
 * (yalnızca tip — çalışma zamanında mock diziye bağımlılık yoktur) ki admin
 * bileşenleri (`SubscriptionRow.tsx` vb.) tek bir tip tanımına bağlı kalsın.
 */

export interface NewSubscriptionInput {
  packageId: string;
  advisorId: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
}

function toAppSubscription(row: DbSubscription): Subscription {
  return {
    id: row.id,
    packageId: row.packageId,
    advisorId: row.advisorId,
    buyerName: row.buyerName,
    buyerEmail: row.buyerEmail,
    amount: row.amount,
    purchasedAt: row.purchasedAt.toISOString(),
    status: row.status as SubscriptionStatus,
  };
}

export async function createSubscription(input: NewSubscriptionInput): Promise<Subscription> {
  const row = await prisma.subscription.create({
    data: {
      packageId: input.packageId,
      advisorId: input.advisorId,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      amount: input.amount,
      status: "aktif",
    },
  });
  return toAppSubscription(row);
}

/** Admin panelindeki "Paketler" sekmesi için tüm abonelikler, en yeni önde. */
export async function getAllSubscriptions(): Promise<Subscription[]> {
  const rows = await prisma.subscription.findMany({ orderBy: { purchasedAt: "desc" } });
  return rows.map(toAppSubscription);
}

export async function cancelSubscription(id: string): Promise<Subscription | undefined> {
  try {
    const row = await prisma.subscription.update({ where: { id }, data: { status: "iptal" } });
    return toAppSubscription(row);
  } catch {
    return undefined;
  }
}
