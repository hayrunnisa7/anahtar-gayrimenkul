import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { searchListingsWithNaturalLanguage } from "@/lib/ai/search";
import { Container } from "@/components/ui/Container";
import { AISearchBar } from "@/components/ai-search/AISearchBar";
import { ListingCard } from "@/components/listings/ListingCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "AI ile Ev Bul | Anahtar Gayrimenkul",
  description: "İhtiyacınızı kendi cümlelerinizle anlatın, yapay zeka destekli arama sizin için en uygun ilanları bulsun.",
};

export default async function AiAramaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const result = query ? await searchListingsWithNaturalLanguage(query) : null;

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-brand-950 py-10 sm:py-14">
        <Container>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/15 text-gold-400">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
            Bana uygun evi bul
          </h1>
          <p className="mt-2 max-w-xl text-sm text-cream-100/65 sm:text-base">
            İhtiyacınızı kendi cümlelerinizle anlatın, yapay zeka destekli arama sizin için en
            uygun ilanları bulsun. (Demo modu — örnek ilanlar üzerinde çalışır)
          </p>

          <div className="mt-6 max-w-2xl">
            <AISearchBar initialQuery={query} />
          </div>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        {!result ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
            <p className="font-serif text-lg font-semibold text-brand-950">
              Aramaya başlamak için bir şeyler yazın
            </p>
            <p className="mt-2 text-sm text-foreground/55">
              Yukarıdaki örnek aramalardan birini seçebilir ya da kendi cümlenizi yazabilirsiniz.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm text-foreground/70">
              {result.summary}
            </p>

            {result.matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
                <p className="font-serif text-lg font-semibold text-brand-950">Sonuç bulunamadı</p>
                <p className="mt-2 text-sm text-foreground/55">
                  Aramanızı sadeleştirmeyi deneyin ya da tüm ilanlara göz atın.
                </p>
                <LinkButton href="/ilanlar" variant="primary" className="mt-5">
                  Tüm İlanlara Göz At
                </LinkButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.matches.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
