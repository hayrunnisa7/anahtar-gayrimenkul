import Link from "next/link";
import { Home, LandPlot, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";

const categories = [
  {
    href: "/ilanlar?kategori=konut",
    label: "Konut",
    description: "Daire, villa, müstakil ev",
    icon: Home,
    count: "8.240 ilan",
  },
  {
    href: "/ilanlar?kategori=arsa",
    label: "Arsa",
    description: "İmarlı arsa, tarla, arazi",
    icon: LandPlot,
    count: "1.860 ilan",
  },
  {
    href: "/ilanlar?kategori=isyeri",
    label: "İşyeri",
    description: "Ofis, dükkan, depo",
    icon: Store,
    count: "2.310 ilan",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-800 group-hover:text-cream-50">
                <cat.icon className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-serif text-lg font-semibold text-brand-950">{cat.label}</p>
                <p className="text-sm text-foreground/55">{cat.description}</p>
                <p className="mt-1 text-xs font-medium text-brand-600">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
