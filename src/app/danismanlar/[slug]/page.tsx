import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getAdvisorBySlug, getAllAdvisors } from "@/lib/data/advisors";
import { getActiveListingsByAdvisor } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { ListingCard } from "@/components/listings/ListingCard";
import { AdvisorContactPanel } from "@/components/advisors/AdvisorContactPanel";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export async function generateStaticParams() {
  const advisors = await getAllAdvisors();
  return advisors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const advisor = await getAdvisorBySlug(slug);
  if (!advisor) return {};

  return {
    title: `${advisor.name} | Anahtar Gayrimenkul`,
    description: advisor.bio,
  };
}

export default async function AdvisorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const advisor = await getAdvisorBySlug(slug);
  if (!advisor) notFound();

  const listings = await getActiveListingsByAdvisor(advisor.id);

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-white">
        <Container className="flex items-center gap-2 py-3 text-sm">
          <Link href="/danismanlar" className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Danışmanlara Dön
          </Link>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-800 font-serif text-2xl font-semibold text-cream-50">
              {initials(advisor.name)}
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
                {advisor.name}
              </h1>
              <p className="text-sm text-foreground/60">{advisor.title}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/50">
                <MapPin className="h-3.5 w-3.5" /> {advisor.regions.join(", ")}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-serif text-lg font-semibold text-brand-950">Hakkında</h2>
            <p className="text-sm leading-relaxed text-foreground/75">{advisor.bio}</p>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-brand-950">
                Aktif İlanları ({listings.length})
              </h2>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
                <p className="font-serif text-lg font-semibold text-brand-950">
                  Şu anda aktif ilanı yok
                </p>
                <p className="mt-2 text-sm text-foreground/55">
                  Yeni ilanlar eklendiğinde burada görünecek.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <AdvisorContactPanel advisor={advisor} />
        </aside>
      </Container>
    </div>
  );
}
