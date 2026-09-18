import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Hash, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingFacts } from "@/components/listings/ListingFacts";
import { MapPlaceholder } from "@/components/listings/MapPlaceholder";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { CompareToggleButton } from "@/components/listings/CompareToggleButton";
import { ShareButton } from "@/components/listings/ShareButton";
import { AdvisorContactCard } from "@/components/listings/AdvisorContactCard";
import { CreditCalculator } from "@/components/listings/CreditCalculator";
import { SimilarListings } from "@/components/listings/SimilarListings";
import { getListingBySlug, getPublicListings } from "@/lib/data/listings";
import { getAdvisorById } from "@/lib/data/advisors";
import { formatArea, formatPrice, formatRelativeDate } from "@/lib/utils/format";

const categoryLabels: Record<string, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

export async function generateStaticParams() {
  const listings = await getPublicListings();
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};

  return {
    title: `${listing.title} | Anahtar Gayrimenkul`,
    description: listing.description.slice(0, 155),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  // Beklemede (admin onayı bekleyen) ve pasif ilanlar herkese açık değildir —
  // yalnızca ait olduğu danışmanın panelinde görünür.
  if (!listing || listing.publishStatus !== "aktif") notFound();

  const advisor = await getAdvisorById(listing.advisorId);

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-white">
        <Container className="flex items-center gap-2 py-3 text-sm">
          <Link href="/ilanlar" className="flex items-center gap-1.5 text-brand-700 hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> İlanlara Dön
          </Link>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <ListingGallery listingId={listing.id} category={listing.category} photoCount={listing.photoCount} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{listing.status === "satilik" ? "Satılık" : "Kiralık"}</Badge>
              <Badge tone="cream">
                {categoryLabels[listing.category]} · {listing.subCategory}
              </Badge>
              {listing.isFeatured && <Badge tone="gold">Öne Çıkan</Badge>}
            </div>

            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
                  {listing.title}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {listing.neighborhood}, {listing.district} / {listing.city}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CompareToggleButton listingId={listing.id} />
                <FavoriteButton listingId={listing.id} />
                <ShareButton title={listing.title} />
              </div>
            </div>

            <p className="mt-4 font-serif text-3xl font-semibold text-brand-950">
              {formatPrice(listing.price)}
              {listing.status === "kiralik" && (
                <span className="text-base font-normal text-foreground/50"> /ay</span>
              )}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/50">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> İlan No: {listing.listingNo}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Yayın Tarihi: {formatRelativeDate(listing.createdAt)}
              </span>
              <span>{formatArea(listing.area)}</span>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-lg font-semibold text-brand-950">İlan Detayları</h2>
            <ListingFacts listing={listing} />
          </div>

          <div>
            <h2 className="mb-3 font-serif text-lg font-semibold text-brand-950">Açıklama</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/75">
              {listing.description}
            </p>
          </div>

          {listing.features.length > 0 && (
            <div>
              <h2 className="mb-3 font-serif text-lg font-semibold text-brand-950">Özellikler</h2>
              <div className="flex flex-wrap gap-2">
                {listing.features.map((f) => (
                  <Badge key={f} tone="neutral">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 font-serif text-lg font-semibold text-brand-950">Konum</h2>
            <MapPlaceholder address={`${listing.address}, ${listing.district} / ${listing.city}`} />
          </div>

          {listing.status === "satilik" && listing.category === "konut" && (
            <div>
              <h2 className="mb-3 font-serif text-lg font-semibold text-brand-950">Kredi Hesaplama</h2>
              <CreditCalculator price={listing.price} />
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {advisor && <AdvisorContactCard advisor={advisor} listingTitle={listing.title} />}
        </aside>
      </Container>

      <SimilarListings listing={listing} />
    </div>
  );
}
