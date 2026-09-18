import { Check } from "lucide-react";
import { getSaasPackages } from "@/lib/data/packages";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export async function PackagesTeaser() {
  const packages = await getSaasPackages();

  return (
    <section className="bg-cream-100/60 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Danışmanlar İçin"
          title="SaaS paketleri"
          description="İşinizi büyütecek ilan ve vitrin paketlerinden birini seçin."
          href="/paketler"
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {packages.map((pkg) => (
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
              <h3 className={cn("font-serif text-xl font-semibold", pkg.highlighted ? "text-cream-50" : "text-brand-950")}>
                {pkg.name}
              </h3>
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
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", pkg.highlighted ? "text-gold-400" : "text-brand-500")} />
                    <span className={pkg.highlighted ? "text-cream-100/85" : "text-foreground/75"}>{f}</span>
                  </li>
                ))}
              </ul>

              <LinkButton
                href={pkg.id === "pkg-kurumsal" ? "/paketler" : `/paketler/odeme?paket=${pkg.id}`}
                variant={pkg.highlighted ? "secondary" : "outline"}
                className="mt-6"
              >
                {pkg.cta}
              </LinkButton>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
