import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getSaasPackages } from "@/lib/data/packages";
import { createSubscription } from "@/lib/data/subscriptions";
import { retrieveCheckoutForm } from "@/lib/payments/iyzico";

/**
 * GERÇEK iyzico Checkout Form akışının callback uç noktası — iyzico,
 * kullanıcı ödemeyi tamamladıktan (ya da iptal ettikten) sonra bu adrese
 * bir `token` ile POST isteği atar (`initializeCheckoutForm`'a verilen
 * `callbackUrl` bu route'un adresi olacak).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "danisman") {
    return NextResponse.redirect(new URL("/giris?next=/paketler", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.redirect(new URL("/paketler/odeme?hata=1", request.url), { status: 303 });
  }

  const result = await retrieveCheckoutForm(token);
  // basketId, initializeCheckoutForm çağrısında packageId olarak verilmişti —
  // conversationId'yi ayrıştırmaya göre daha güvenilir (packageId içinde "-" olabiliyor).
  const packageId = result.basketId ?? "";

  if (result.status !== "success" || !packageId) {
    const url = new URL("/paketler/odeme", request.url);
    if (packageId) url.searchParams.set("paket", packageId);
    url.searchParams.set("hata", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const packages = await getSaasPackages();
  const selectedPackage = packages.find((p) => p.id === packageId);
  if (!selectedPackage) {
    return NextResponse.redirect(new URL("/paketler", request.url), { status: 303 });
  }

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
