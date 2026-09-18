import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getFavoriteListingIds, toggleFavorite } from "@/lib/data/favorites";

/**
 * Favoriler uç noktası. Sayfa yenilenmesi gerektirmediği (kart üzerindeki
 * kalp butonuna tıklamak listeleme sayfasında kalınmasını gerektirdiği) için
 * danışman/admin aksiyonlarındaki Post/Redirect/Get deseni yerine düz
 * JSON isteği + client tarafında optimistic güncelleme kullanılır.
 */

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ listingIds: [], count: 0 });

  const listingIds = await getFavoriteListingIds(session.id);
  return NextResponse.json({ listingIds, count: listingIds.length });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "giris-gerekli" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  if (!listingId) {
    return NextResponse.json({ error: "gecersiz-istek" }, { status: 400 });
  }

  const isFavorite = await toggleFavorite(session.id, listingId);
  const listingIds = await getFavoriteListingIds(session.id);
  return NextResponse.json({ isFavorite, count: listingIds.length });
}
