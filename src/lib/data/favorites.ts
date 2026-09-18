import { prisma } from "@/lib/db/prisma";
import { getListingById } from "@/lib/data/listings";
import type { Listing } from "@/types/listing";

/**
 * Data-access layer for favorites. Prisma/Supabase üzerinden okur/yazar
 * (mock döneminde `Record<string, string[]>` olan yapı artık gerçek bir
 * `favorites` birleşim tablosu — fonksiyon imzaları değişmedi).
 */

export async function getFavoriteListingIds(userId: string): Promise<string[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { listingId: true },
  });
  return rows.map((r) => r.listingId);
}

export async function isFavorite(userId: string, listingId: string): Promise<boolean> {
  const row = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });
  return row !== null;
}

/** Favori durumunu tersine çevirir ve YENİ durumu döner (true = artık favori). */
export async function toggleFavorite(userId: string, listingId: string): Promise<boolean> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.favorite.create({ data: { userId, listingId } });
  return true;
}

export async function getFavoriteListings(userId: string): Promise<Listing[]> {
  const ids = await getFavoriteListingIds(userId);
  const listings = await Promise.all(ids.map((id) => getListingById(id)));
  return listings.filter((l): l is Listing => Boolean(l)).reverse();
}
