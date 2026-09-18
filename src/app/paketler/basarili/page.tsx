import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSaasPackages } from "@/lib/data/packages";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { isIyzicoConfigured } from "@/lib/payments/iyzico";

export const metadata: Metadata = {
  title: "Ödeme Başarılı | Anahtar Gayrimenkul",
};

export default async function PaketBasariliPage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "danisman") redirect("/erisim-engellendi");

  const { paket } = await searchParams;
  const packages = await getSaasPackages();
  const selectedPackage = packages.find((p) => p.id === paket);
  const usedRealCheckout = isIyzicoConfigured();

  return (
    <div className="bg-cream-50 py-16 sm:py-20">
      <Container className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-950">
          Ödeme Alındı {usedRealCheckout ? "(Sandbox)" : "(Demo)"}
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          {selectedPackage
            ? `${selectedPackage.name} paketine (${formatPrice(selectedPackage.priceMonthly)}/ay) geçişiniz tamamlandı.`
            : "Paket geçişiniz tamamlandı."}
        </p>
        <p className="mt-2 text-xs text-foreground/45">
          {usedRealCheckout
            ? "Bu bir iyzico sandbox (test) ortamıdır — iyzico'nun test altyapısı kullanıldı, gerçek para veya gerçek kart bilgisi işlenmedi."
            : "Bu bir demo ortamıdır — gerçek bir ödeme alınmadı ve iyzico'ya bağlanılmadı."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <LinkButton href="/danisman/panel" variant="primary">
            Danışman Paneline Dön
          </LinkButton>
          <LinkButton href="/paketler" variant="outline">
            Paketleri Görüntüle
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
