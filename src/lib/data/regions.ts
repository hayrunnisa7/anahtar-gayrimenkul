import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { Region } from "@/types/region";

/**
 * Data-access layer for regions. Prisma/Supabase üzerinden okur.
 * `listingCount` artık bir tablo sütunu değil — her zaman canlı olarak
 * ("aktif" ilan sayısı) hesaplanır, böylece asla bayatlamaz.
 */

const withActiveListingCount = {
  include: { _count: { select: { listings: { where: { publishStatus: "aktif" as const } } } } },
} satisfies Prisma.RegionDefaultArgs;

type DbRegionWithCount = Prisma.RegionGetPayload<typeof withActiveListingCount>;

function toAppRegion(row: DbRegionWithCount): Region {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city,
    description: row.description,
    listingCount: row._count.listings,
  };
}

export async function getPopularRegions(limit = 6): Promise<Region[]> {
  const rows = await prisma.region.findMany({ ...withActiveListingCount });
  return rows
    .map(toAppRegion)
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, limit);
}

export async function getAllRegions(): Promise<Region[]> {
  const rows = await prisma.region.findMany({ ...withActiveListingCount });
  return rows.map(toAppRegion).sort((a, b) => b.listingCount - a.listingCount);
}

export async function getRegionBySlug(slug: string): Promise<Region | undefined> {
  const row = await prisma.region.findUnique({ where: { slug }, ...withActiveListingCount });
  return row ? toAppRegion(row) : undefined;
}
