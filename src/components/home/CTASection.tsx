import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="pb-20">
      <Container>
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-brand-800 px-6 py-14 text-center sm:px-16">
          <h2 className="max-w-xl font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
            Emlak danışmanı mısınız? İlanlarınızı hemen yayınlamaya başlayın
          </h2>
          <p className="max-w-lg text-sm text-cream-100/70 sm:text-base">
            Danışman panelinden ilan ekleyin, performansınızı takip edin ve size uygun SaaS
            paketiyle işinizi büyütün.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/danisman/ilan-ver" variant="secondary" size="lg">
              Danışman Panelini Keşfet
            </LinkButton>
            <LinkButton
              href="/paketler"
              variant="outline"
              size="lg"
              className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10"
            >
              Paketleri İncele
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
