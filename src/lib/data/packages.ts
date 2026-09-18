import { prisma } from "@/lib/db/prisma";
import type { SaasPackage as DbSaasPackage } from "@prisma/client";
import type { SaasPackage } from "@/types/package";

/** Paket kartlarının gösterim sırası (Başlangıç → Profesyonel → Kurumsal). */
const displayOrder: Record<string, number> = {
  "pkg-baslangic": 0,
  "pkg-profesyonel": 1,
  "pkg-kurumsal": 2,
};

function toAppPackage(row: DbSaasPackage): SaasPackage {
  return {
    id: row.id,
    name: row.name,
    priceMonthly: row.priceMonthly,
    description: row.description,
    features: row.features,
    listingLimit: row.listingLimit ?? "sinirsiz",
    highlighted: row.highlighted,
    cta: row.cta,
  };
}

export async function getSaasPackages(): Promise<SaasPackage[]> {
  const rows = await prisma.saasPackage.findMany();
  return rows
    .map(toAppPackage)
    .sort((a, b) => (displayOrder[a.id] ?? 99) - (displayOrder[b.id] ?? 99));
}
