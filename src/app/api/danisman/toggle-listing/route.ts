import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { getListingById, setListingPublishStatus } from "@/lib/data/listings";

/**
 * Danışmanın kendi ilanının yayın durumunu (aktif/pasif) değiştirmesi için
 * klasik Post/Redirect/Get uç noktası. Bir Server Action yerine düz bir HTML
 * form POST'u olarak tasarlandı ki tarayıcı gerçek bir tam sayfa yenilemesi
 * yapsın — bu da danışman panelinin her zaman güncel veriyle gösterilmesini
 * garanti eder.
 *
 * Yetki kontrolü: "listingId" formdan geldiği için, bu ID'nin gerçekten
 * oturum sahibine (session.id) ait olduğu burada doğrulanır. Eşleşmezse
 * (başka bir danışmanın ilanı manipülasyonla gönderilmiş olsa bile) hiçbir
 * değişiklik yapılmadan panele geri dönülür.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const listingId = String(formData.get("listingId") ?? "");
  const nextStatus = formData.get("nextStatus");

  const session = await getSession();
  if (!session || session.role !== "danisman") {
    const loginUrl = new URL("/giris?next=/danisman/panel", request.url);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  if (isValidCsrfToken(formData, session) && (nextStatus === "aktif" || nextStatus === "pasif")) {
    const listing = await getListingById(listingId);
    if (listing && listing.advisorId === session.id) {
      await setListingPublishStatus(listingId, nextStatus);
    }
  }

  return NextResponse.redirect(new URL("/danisman/panel", request.url), { status: 303 });
}
