import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { Advisor } from "@/types/advisor";

/**
 * Data-access layer for advisors. Prisma/Supabase üzerinden okur.
 * `listingCount` artık bir tablo sütunu değil — her zaman canlı olarak
 * ("aktif" ilan sayısı) hesaplanır, böylece asla bayatlamaz.
 */

const withActiveListingCount = {
  include: { _count: { select: { listings: { where: { publishStatus: "aktif" as const } } } } },
} satisfies Prisma.AdvisorDefaultArgs;

type DbAdvisorWithCount = Prisma.AdvisorGetPayload<typeof withActiveListingCount>;

function toAppAdvisor(row: DbAdvisorWithCount): Advisor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    bio: row.bio,
    regions: row.regions,
    listingCount: row._count.listings,
  };
}

export async function getFeaturedAdvisors(limit = 4): Promise<Advisor[]> {
  const rows = await prisma.advisor.findMany({
    orderBy: { id: "asc" },
    take: limit,
    ...withActiveListingCount,
  });
  return rows.map(toAppAdvisor);
}

export async function getAllAdvisors(): Promise<Advisor[]> {
  const rows = await prisma.advisor.findMany({ ...withActiveListingCount });
  return rows.map(toAppAdvisor).sort((a, b) => b.listingCount - a.listingCount);
}

export async function getAdvisorBySlug(slug: string): Promise<Advisor | undefined> {
  const row = await prisma.advisor.findUnique({ where: { slug }, ...withActiveListingCount });
  return row ? toAppAdvisor(row) : undefined;
}

export async function getAdvisorById(id: string): Promise<Advisor | undefined> {
  const row = await prisma.advisor.findUnique({ where: { id }, ...withActiveListingCount });
  return row ? toAppAdvisor(row) : undefined;
}
