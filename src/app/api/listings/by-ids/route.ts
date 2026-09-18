import { NextResponse } from "next/server";
import { getListingById } from "@/lib/data/listings";

/**
 * Karşılaştırma listesi tarayıcının localStorage'ında (client-only) tutulur,
 * bu yüzden ilgili ilan detaylarını sunucudan çekmek için hafif bir uç nokta
 * gerekir. `ids` sırası korunur.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 10);

  const found = await Promise.all(ids.map((id) => getListingById(id)));
  const listings = ids
    .map((id) => found.find((l) => l?.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return NextResponse.json({ listings });
}
