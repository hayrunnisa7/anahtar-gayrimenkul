import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { getListingById, setListingPublishStatus } from "@/lib/data/listings";

/**
 * Admin onayı için Post/Redirect/Get uç noktası (danışman panelindeki
 * yayın durumu değiştirme aksiyonuyla aynı, kanıtlanmış güvenilir yaklaşım).
 * Onayla → "aktif", Reddet → "pasif". Yalnızca "beklemede" durumundaki bir
 * ilan üzerinde işlem yapılabilir; yetki her zaman sunucudaki oturumdan
 * (admin rolü) doğrulanır.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/giris?next=/admin", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const listingId = String(formData.get("listingId") ?? "");
  const decision = formData.get("decision");

  if (isValidCsrfToken(formData, session) && (decision === "onayla" || decision === "reddet")) {
    const listing = await getListingById(listingId);
    if (listing && listing.publishStatus === "beklemede") {
      await setListingPublishStatus(listingId, decision === "onayla" ? "aktif" : "pasif");
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
