import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { CreditCalculator } from "@/components/listings/CreditCalculator";

export const metadata: Metadata = {
  title: "Kredi Hesaplama | Anahtar Gayrimenkul",
  description: "Konut kredisi taksitlerinizi tahmini olarak hesaplayın.",
};

export default function KrediHesaplamaPage() {
  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Araçlar</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          Kredi Hesaplama
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          Konut fiyatı, peşinat ve vadeyi girin; tahmini aylık taksitinizi ve toplam geri ödeme
          tutarınızı görün.
        </p>

        <div className="mt-8">
          <CreditCalculator />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white/60 p-5 text-sm text-foreground/55">
          Bu hesaplama yalnızca bir öngörü sunar ve bankaların gerçek kredi koşullarını (faiz
          oranı, ekspertiz, dosya masrafı vb.) yansıtmaz. Net taksit tutarı için bankanızla ya da
          danışmanlarımızla görüşmenizi öneririz.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/ilanlar" variant="primary">
            İlanları Keşfet
          </LinkButton>
          <LinkButton href="/danismanlar" variant="outline">
            Danışmanlarımızla Görüşün
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
