import { getFeaturedListings } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";

export async function FeaturedListings() {
  const listings = await getFeaturedListings(6);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Seçkin İlanlar"
          title="Öne çıkan ilanlar"
          description="Danışmanlarımızın özenle seçtiği, yüksek talep gören ilanlar."
          href="/ilanlar?sirala=one-cikan"
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </section>
  );
}
