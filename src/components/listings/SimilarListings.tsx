import { getSimilarListings } from "@/lib/data/listings";
import { ListingCard } from "@/components/listings/ListingCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Listing } from "@/types/listing";

export async function SimilarListings({ listing }: { listing: Listing }) {
  const similar = await getSimilarListings(listing, 3);

  if (similar.length === 0) return null;

  return (
    <section className="border-t border-black/5 bg-cream-100/60 py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Keşfet" title="Benzer ilanlar" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    </section>
  );
}
