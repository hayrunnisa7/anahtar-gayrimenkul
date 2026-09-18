import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isValidCsrfToken } from "@/lib/auth/csrf";
import { getSaasPackages } from "@/lib/data/packages";
import { createSubscription } from "@/lib/data/subscriptions";
import { createMockCheckout } from "@/lib/payments/iyzico";

/**
 * Mock SaaS paket ödeme uç noktası. Klasik Post/Redirect/Get deseni kullanır
 * (bu projedeki diğer mutasyon uç noktalarıyla aynı, kanıtlanmış yaklaşım).
 * Gerçek bir ödeme sağlayıcısına (iyzico) bağlanmaz — yalnızca
 * `createMockCheckout` ile simüle edilir.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "danisman") {
    return NextResponse.redirect(new URL("/giris?next=/paketler", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const packageId = String(formData.get("packageId") ?? "");
  const cardName = String(formData.get("cardName") ?? "").trim();
  const cardNumber = String(formData.get("cardNumber") ?? "").replace(/\s/g, "");
  const expiry = String(formData.get("expiry") ?? "").trim();
  const cvc = String(formData.get("cvc") ?? "").trim();

  const packages = await getSaasPackages();
  const selectedPackage = packages.find((p) => p.id === packageId && p.id !== "pkg-kurumsal");

  const isValid =
    isValidCsrfToken(formData, session) &&
    Boolean(selectedPackage) &&
    cardName.length >= 3 &&
    /^\d{16}$/.test(cardNumber) &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
    /^\d{3,4}$/.test(cvc);

  if (!selectedPackage || !isValid) {
    const url = new URL("/paketler/odeme", request.url);
    url.searchParams.set("paket", packageId);
    url.searchParams.set("hata", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  await createMockCheckout({
    packageId: selectedPackage.id,
    buyerName: session.name,
    buyerEmail: session.email,
    amount: selectedPackage.priceMonthly,
  });

  await createSubscription({
    packageId: selectedPackage.id,
    advisorId: session.id,
    buyerName: session.name,
    buyerEmail: session.email,
    amount: selectedPackage.priceMonthly,
  });

  const successUrl = new URL("/paketler/basarili", request.url);
  successUrl.searchParams.set("paket", selectedPackage.id);
  return NextResponse.redirect(successUrl, { status: 303 });
}
