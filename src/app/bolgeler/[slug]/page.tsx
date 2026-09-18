import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getRegionBySlug, getAllRegions } from "@/lib/data/regions";
import { getListingsByRegion } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { ListingCard } from "@/components/listings/ListingCard";
import { LinkButton } from "@/components/ui/Button";

export async function generateStaticParams() {
  const regions = await getAllRegions();
  return regions.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegionBySlug(slug);
  if (!region) return {};

  return {
    title: `${region.name} İlanları | Anahtar Gayrimenkul`,
    description: region.description,
  };
}

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = await getRegionBySlug(slug);
  if (!region) notFound();

  const listings = await getListingsByRegion(region.id);

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-white">
        <Container className="flex items-center gap-2 py-3 text-sm">
          <Link href="/bolgeler" className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Bölgelere Dön
          </Link>
        </Container>
      </div>

      <div className="border-b border-black/5 bg-brand-950 py-8 sm:py-10">
        <Container>
          <p className="text-xs font-medium uppercase tracking-wider text-gold-400">Konum</p>
          <h1 className="mt-1 flex items-center gap-2 font-serif text-2xl font-semibold text-cream-50 sm:text-3xl">
            <MapPin className="h-6 w-6 shrink-0 text-gold-400" /> {region.name}, {region.city}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cream-100/70 sm:text-base">{region.description}</p>
        </Container>
      </div>

      <Container className="py-8 sm:py-10">
        <p className="mb-5 text-sm text-foreground/60">
          <span className="font-semibold text-brand-950">{listings.length}</span> ilan bulundu
        </p>

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
            <p className="font-serif text-lg font-semibold text-brand-950">
              Bu bölgede henüz aktif ilan yok
            </p>
            <p className="mt-2 text-sm text-foreground/55">
              Diğer bölgelerdeki ilanlara göz atabilirsiniz.
            </p>
            <LinkButton href="/ilanlar" variant="primary" className="mt-5">
              Tüm İlanlara Göz At
            </LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
