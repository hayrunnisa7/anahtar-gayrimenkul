import { getLatestListings } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";

export async function LatestListings() {
  const listings = await getLatestListings(8);

  return (
    <section className="bg-cream-100/60 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Güncel"
          title="Son eklenen ilanlar"
          description="Platforma en son eklenen satılık ve kiralık ilanlar."
          href="/ilanlar?sirala=en-yeni"
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
