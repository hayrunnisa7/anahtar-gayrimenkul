import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getSaasPackages } from "@/lib/data/packages";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "SaaS Paketleri | Anahtar Gayrimenkul",
  description: "Emlak danışmanları için ilan ve vitrin paketleri.",
};

export default async function PaketlerPage() {
  const packages = await getSaasPackages();

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Danışmanlar İçin</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          SaaS Paketleri
        </h1>
        <p className="mt-1 max-w-xl text-sm text-foreground/55">
          İşinizi büyütecek ilan ve vitrin paketlerinden birini seçin. Ödeme adımı demo amaçlıdır,
          gerçek bir tahsilat yapılmaz.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {packages.map((pkg) => {
            const isEnterprise = pkg.id === "pkg-kurumsal";
            return (
              <div
                key={pkg.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-6",
                  pkg.highlighted
                    ? "border-brand-800 bg-brand-900 text-cream-50 shadow-xl shadow-brand-900/20"
                    : "border-black/5 bg-white",
                )}
              >
                {pkg.highlighted && (
                  <span className="mb-3 w-fit rounded-full bg-gold-400 px-2.5 py-1 text-xs font-medium text-brand-950">
                    En çok tercih edilen
                  </span>
                )}
                <h2
                  className={cn(
                    "font-serif text-xl font-semibold",
                    pkg.highlighted ? "text-cream-50" : "text-brand-950",
                  )}
                >
                  {pkg.name}
                </h2>
                <p className={cn("mt-1 text-sm", pkg.highlighted ? "text-cream-100/70" : "text-foreground/55")}>
                  {pkg.description}
                </p>
                <p className="mt-4">
                  <span className="font-serif text-3xl font-semibold">{formatPrice(pkg.priceMonthly)}</span>
                  <span className={cn("text-sm", pkg.highlighted ? "text-cream-100/60" : "text-foreground/50")}>
                    {" "}
                    /ay
                  </span>
                </p>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          pkg.highlighted ? "text-gold-400" : "text-brand-500",
                        )}
                      />
                      <span className={pkg.highlighted ? "text-cream-100/85" : "text-foreground/75"}>{f}</span>
                    </li>
                  ))}
                </ul>

                {isEnterprise ? (
                  <a
                    href="mailto:satis@anahtargayrimenkul.com?subject=Kurumsal%20Paket%20Bilgi%20Talebi"
                    className={cn(
                      "mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors",
                      pkg.highlighted
                        ? "bg-cream-200 text-brand-900 hover:bg-cream-300"
                        : "border border-brand-800/20 text-brand-800 hover:bg-brand-50",
                    )}
                  >
                    {pkg.cta}
                  </a>
                ) : (
                  <LinkButton
                    href={`/paketler/odeme?paket=${pkg.id}`}
                    variant={pkg.highlighted ? "secondary" : "outline"}
                    className="mt-6"
                  >
                    {pkg.cta}
                  </LinkButton>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
