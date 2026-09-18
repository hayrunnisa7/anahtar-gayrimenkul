import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSaasPackages } from "@/lib/data/packages";
import { Container } from "@/components/ui/Container";
import { PaymentForm } from "@/components/packages/PaymentForm";
import { IyzicoCheckoutEmbed } from "@/components/packages/IyzicoCheckoutEmbed";
import { formatPrice } from "@/lib/utils/format";
import { isIyzicoConfigured, initializeCheckoutForm } from "@/lib/payments/iyzico";

export const metadata: Metadata = {
  title: "Ödeme | Anahtar Gayrimenkul",
};

export default async function PaketOdemePage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string; hata?: string }>;
}) {
  const { paket, hata } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/giris?next=${encodeURIComponent(`/paketler/odeme?paket=${paket ?? ""}`)}`);
  if (session.role !== "danisman") redirect("/erisim-engellendi");

  const packages = await getSaasPackages();
  const selectedPackage = packages.find((p) => p.id === paket && p.id !== "pkg-kurumsal");
  if (!selectedPackage) redirect("/paketler");

  const useRealCheckout = isIyzicoConfigured();
  let checkoutFormContent: string | null = null;
  let initError: string | null = null;

  if (useRealCheckout) {
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/paketler/iyzico-callback`;
    const initResult = await initializeCheckoutForm({
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      amount: selectedPackage.priceMonthly,
      buyerId: session.id,
      buyerName: session.name,
      buyerEmail: session.email,
      callbackUrl,
    });

    if (initResult.status === "success" && initResult.checkoutFormContent) {
      checkoutFormContent = initResult.checkoutFormContent;
    } else {
      initError = initResult.errorMessage ?? "Ödeme formu başlatılamadı.";
    }
  }

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container className="mx-auto max-w-4xl">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Danışman Paneli</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">Ödeme</h1>
        <p className="mt-1 text-sm text-foreground/55">
          {selectedPackage.name} paketine geçiş yapıyorsunuz.
        </p>

        {hata && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Ödeme bilgilerinde bir sorun oluştu, lütfen formu kontrol edip tekrar deneyin.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="h-fit rounded-2xl border border-black/5 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/45">
              Sipariş Özeti
            </p>
            <h2 className="mt-2 font-serif text-xl font-semibold text-brand-950">
              {selectedPackage.name}
            </h2>
            <p className="mt-1 text-sm text-foreground/55">{selectedPackage.description}</p>
            <p className="mt-4 font-serif text-2xl font-semibold text-brand-950">
              {formatPrice(selectedPackage.priceMonthly)}
              <span className="text-sm font-normal text-foreground/50"> /ay</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {selectedPackage.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <span className="text-foreground/75">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {useRealCheckout ? (
            initError || !checkoutFormContent ? (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Ödeme formu şu anda başlatılamadı. Lütfen daha sonra tekrar deneyin.
              </div>
            ) : (
              <IyzicoCheckoutEmbed checkoutFormContent={checkoutFormContent} />
            )
          ) : (
            <PaymentForm
              packageId={selectedPackage.id}
              priceMonthly={selectedPackage.priceMonthly}
              csrfToken={session.csrf}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
