import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getAllRegions } from "@/lib/data/regions";
import { getListingsByRegion } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export const metadata: Metadata = {
  title: "Bölgeler | Anahtar Gayrimenkul",
  description: "Anahtar Gayrimenkul'ün ilan sunduğu popüler bölgeleri keşfedin.",
};

export default async function BolgelerPage() {
  const allRegions = await getAllRegions();
  const regionsWithLiveCounts = await Promise.all(
    allRegions.map(async (region) => ({
      ...region,
      listingCount: (await getListingsByRegion(region.id)).length,
    })),
  );
  const regions = regionsWithLiveCounts.sort((a, b) => b.listingCount - a.listingCount);

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Konum</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">Bölgeler</h1>
        <p className="mt-1 text-sm text-foreground/55">
          En çok ilan ve talep alan bölgelerimizi inceleyin.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <Link
              key={region.id}
              href={`/bolgeler/${region.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-900/10"
            >
              <PlaceholderImage seed={region.id} className="aspect-[16/9] w-full" iconClassName="h-10 w-10" />
              <div className="p-5">
                <p className="flex items-center gap-1.5 font-serif text-lg font-semibold text-brand-950">
                  {region.name}
                  <ArrowUpRight className="h-4 w-4 text-brand-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground/50">
                  <MapPin className="h-3.5 w-3.5" /> {region.city}
                </p>
                <p className="mt-3 text-sm text-foreground/60">{region.description}</p>
                <p className="mt-3 text-xs font-medium text-brand-600">{region.listingCount} ilan</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
