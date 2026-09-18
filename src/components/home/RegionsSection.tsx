import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPopularRegions } from "@/lib/data/regions";
import { getListingsByRegion } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export async function RegionsSection() {
  const popularRegions = await getPopularRegions(6);
  const regionsWithLiveCounts = await Promise.all(
    popularRegions.map(async (region) => ({
      ...region,
      listingCount: (await getListingsByRegion(region.id)).length,
    })),
  );
  const regions = regionsWithLiveCounts.sort((a, b) => b.listingCount - a.listingCount);

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Konum"
          title="Popüler bölgeler"
          description="En çok ilan ve talep alan bölgeleri keşfedin."
          href="/bolgeler"
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {regions.map((region) => (
            <Link
              key={region.id}
              href={`/bolgeler/${region.slug}`}
              className="group overflow-hidden rounded-xl border border-black/5"
            >
              <PlaceholderImage seed={region.id} className="aspect-square w-full" iconClassName="h-7 w-7" />
              <div className="bg-white p-3">
                <p className="flex items-center gap-1 text-sm font-medium text-brand-950">
                  {region.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
                <p className="text-xs text-foreground/50">{region.city} · {region.listingCount} ilan</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
