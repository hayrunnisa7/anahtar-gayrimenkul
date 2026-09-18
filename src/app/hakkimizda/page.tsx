import type { Metadata } from "next";
import { Eye, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hakkımızda | Anahtar Gayrimenkul",
  description: "Anahtar Gayrimenkul'ün hikayesi, misyonu ve değerleri.",
};

const stats = [
  { value: "12.400+", label: "Aktif İlan" },
  { value: "340+", label: "Danışman" },
  { value: "48", label: "Şehir" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Güven",
    description: "Her ilan ve danışman, platformumuzda yayınlanmadan önce doğrulama sürecinden geçer.",
  },
  {
    icon: Eye,
    title: "Şeffaflık",
    description: "Fiyat, konum ve ilan detaylarını olduğu gibi paylaşırız — gizli maliyet ya da bilgi yok.",
  },
  {
    icon: Sparkles,
    title: "Teknoloji",
    description: "Yapay zeka destekli arama ve dijital araçlarla doğru evi bulmayı kolaylaştırırız.",
  },
  {
    icon: Users,
    title: "Müşteri Odaklılık",
    description: "Danışmanlarımız, alıcı ve satıcının ihtiyacını önceliklendiren bir yaklaşımla çalışır.",
  },
];

export default function HakkimizdaPage() {
  return (
    <div className="bg-cream-50">
      <div className="relative overflow-hidden bg-brand-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(199,162,83,0.15),transparent_40%)]" />
        <Container className="relative py-14 sm:py-20">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gold-400">
            Hakkımızda
          </p>
          <h1 className="max-w-2xl font-serif text-3xl font-semibold leading-tight text-cream-50 sm:text-4xl">
            Doğru ilan, doğru danışman, doğru zaman
          </h1>
          <p className="mt-4 max-w-xl text-sm text-cream-100/70 sm:text-base">
            Anahtar Gayrimenkul, satılık ve kiralık gayrimenkul arayışını kolaylaştırmak için
            kuruldu. Doğrulanmış ilanları, uzman danışman kadromuzu ve yapay zeka destekli arama
            teknolojimizi tek bir çatı altında topluyoruz.
          </p>

          <div className="mt-10 flex flex-wrap gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl font-semibold text-cream-50">{stat.value}</p>
                <p className="text-sm text-cream-100/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="py-14 sm:py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Misyonumuz</p>
            <p className="mt-3 font-serif text-xl font-semibold text-brand-950">
              Gayrimenkul kararlarını kolaylaştırmak
            </p>
            <p className="mt-3 text-sm text-foreground/60">
              Alıcı, satıcı ve kiracıların doğru bilgiye kolayca ulaşmasını sağlayarak, gayrimenkul
              alım-satım ve kiralama sürecindeki belirsizliği azaltmayı hedefliyoruz.
            </p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Vizyonumuz</p>
            <p className="mt-3 font-serif text-xl font-semibold text-brand-950">
              Türkiye&apos;nin güvenilir dijital emlak anahtarı olmak
            </p>
            <p className="mt-3 text-sm text-foreground/60">
              Teknolojiyi ve yerel uzmanlığı bir araya getirerek, her bölgede danışmanlarımız
              aracılığıyla en doğru gayrimenkul deneyimini sunmayı amaçlıyoruz.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Değerlerimiz</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
            Bizi biz yapan ilkeler
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-black/5 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <value.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-medium text-brand-950">{value.title}</p>
                <p className="mt-1.5 text-sm text-foreground/55">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-3xl bg-brand-900 px-6 py-10 text-center sm:px-12 sm:py-14">
          <h2 className="font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
            Uzman kadromuzla tanışın
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cream-100/65 sm:text-base">
            Bölgenizdeki danışmanlarımızla iletişime geçin ya da hemen ilanları keşfetmeye başlayın.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/danismanlar" variant="secondary" size="lg">
              Danışmanlarımız
            </LinkButton>
            <LinkButton
              href="/ilanlar"
              variant="ghost"
              size="lg"
              className="text-cream-50 hover:bg-cream-50/10"
            >
              İlanları Keşfet
            </LinkButton>
          </div>
        </div>
      </Container>
    </div>
  );
}
