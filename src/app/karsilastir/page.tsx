import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CompareTable } from "@/components/compare/CompareTable";

export const metadata: Metadata = {
  title: "İlan Karşılaştırma | Anahtar Gayrimenkul",
};

export default function KarsilastirPage() {
  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Karşılaştırma</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          İlan Karşılaştırma
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          En fazla 4 ilanı yan yana karşılaştırabilirsiniz.
        </p>

        <div className="mt-8">
          <CompareTable />
        </div>
      </Container>
    </div>
  );
}
