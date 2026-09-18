import Link from "next/link";
import { Key, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "İlanlar",
    links: [
      { href: "/ilanlar?durum=satilik", label: "Satılık İlanlar" },
      { href: "/ilanlar?durum=kiralik", label: "Kiralık İlanlar" },
      { href: "/ilanlar?kategori=arsa", label: "Arsalar" },
      { href: "/ilanlar?kategori=isyeri", label: "İşyerleri" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { href: "/bolgeler", label: "Bölgeler" },
      { href: "/danismanlar", label: "Danışmanlarımız" },
      { href: "/paketler", label: "SaaS Paketleri" },
      { href: "/blog", label: "Blog" },
      { href: "/hakkimizda", label: "Hakkımızda" },
    ],
  },
  {
    title: "Araçlar",
    links: [
      { href: "/kredi-hesaplama", label: "Kredi Hesaplama" },
      { href: "/karsilastir", label: "İlan Karşılaştırma" },
      { href: "/favoriler", label: "Favorilerim" },
      { href: "/ai-arama", label: "AI ile Ev Bul" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/5 bg-brand-950 text-cream-100">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-brand-800">
              <Key className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-lg font-semibold text-cream-50">Anahtar Gayrimenkul</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-cream-100/60">
            Doğru ilan, doğru danışman, doğru zaman. Satılık ve kiralık gayrimenkul arayışınızda
            güvenilir dijital anahtarınız.
          </p>
          <div className="mt-6 space-y-2 text-sm text-cream-100/70">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> Levent Mahallesi, Büyükdere Cd. No:1, İstanbul
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> +90 212 000 00 00
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> info@anahtargayrimenkul.com
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cream-100/50">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream-100/75 hover:text-cream-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-cream-50/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-cream-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Anahtar Gayrimenkul. Tüm hakları saklıdır.</p>
          <p>Bu bir demo projedir — içerikler ve ilanlar örnek amaçlıdır.</p>
        </Container>
      </div>
    </footer>
  );
}
