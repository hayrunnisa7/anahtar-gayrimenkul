import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { cancelSubscription } from "@/lib/data/subscriptions";

/**
 * Bir aboneliği iptal eder. Klasik Post/Redirect/Get deseni kullanır (bu
 * projedeki diğer mutasyon uç noktalarıyla aynı, kanıtlanmış yaklaşım).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/giris?next=/admin", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const subscriptionId = String(formData.get("subscriptionId") ?? "");

  if (subscriptionId && isValidCsrfToken(formData, session)) {
    await cancelSubscription(subscriptionId);
  }

  return NextResponse.redirect(new URL("/admin?tab=paketler", request.url), { status: 303 });
}
