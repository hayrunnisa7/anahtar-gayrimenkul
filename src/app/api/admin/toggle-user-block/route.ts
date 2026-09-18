import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { setUserBlocked } from "@/lib/data/users";

/**
 * Bir hesabı askıya alır/askıyı kaldırır. Klasik Post/Redirect/Get deseni
 * kullanır (bu projedeki diğer mutasyon uç noktalarıyla aynı, kanıtlanmış
 * yaklaşım).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/giris?next=/admin", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "");
  const nextBlocked = formData.get("nextBlocked") === "1";

  if (userId && isValidCsrfToken(formData, session)) {
    await setUserBlocked(userId, nextBlocked);
  }

  return NextResponse.redirect(new URL("/admin?tab=kullanicilar", request.url), { status: 303 });
}
