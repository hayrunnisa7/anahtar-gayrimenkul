import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AISearchBar } from "@/components/ai-search/AISearchBar";

export function AISearchTeaser() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
              <Sparkles className="h-6 w-6" />
            </span>
            <h2 className="font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
              Bana uygun evi bul
            </h2>
            <p className="mt-3 text-sm text-cream-100/65 sm:text-base">
              İhtiyacınızı kendi cümlelerinizle anlatın, yapay zeka destekli arama sizin için en
              uygun ilanları bulsun. (Demo modu — örnek ilanlar üzerinde çalışır)
            </p>

            <div className="mt-6 text-left">
              <AISearchBar />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
