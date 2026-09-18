import { SearchBar } from "@/components/home/SearchBar";
import { Container } from "@/components/ui/Container";

const stats = [
  { value: "12.400+", label: "Aktif İlan" },
  { value: "340+", label: "Danışman" },
  { value: "48", label: "Şehir" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(199,162,83,0.15),transparent_40%)]" />
      <Container className="relative flex flex-col items-start gap-8 py-16 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-gold-400">
            Anahtar Gayrimenkul
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-cream-50 sm:text-4xl lg:text-5xl">
            Size uygun evi bulmanın güvenilir yolu
          </h1>
          <p className="mt-4 max-w-xl text-base text-cream-100/70 sm:text-lg">
            Binlerce satılık ve kiralık ilanı filtreleyin, danışmanlarımızla iletişime geçin ya
            da yapay zekaya sadece ihtiyacınızı anlatın, sizin için arasın.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <SearchBar />
        </div>

        <div className="flex flex-wrap gap-8 pt-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-2xl font-semibold text-cream-50">{stat.value}</p>
              <p className="text-sm text-cream-100/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
