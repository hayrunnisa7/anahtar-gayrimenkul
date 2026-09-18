import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { getAllAdvisors } from "@/lib/data/advisors";
import { getActiveListingsByAdvisor } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Danışmanlarımız | Anahtar Gayrimenkul",
  description: "Anahtar Gayrimenkul'ün uzman emlak danışmanlarıyla tanışın.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default async function DanismanlarPage() {
  const allAdvisors = await getAllAdvisors();
  const advisorsWithLiveCounts = await Promise.all(
    allAdvisors.map(async (advisor) => ({
      ...advisor,
      listingCount: (await getActiveListingsByAdvisor(advisor.id)).length,
    })),
  );
  const advisors = advisorsWithLiveCounts.sort((a, b) => b.listingCount - a.listingCount);

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Uzman Kadro</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          Danışmanlarımız
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          Bölgesinde uzman danışmanlarımızla doğrudan iletişime geçin.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {advisors.map((advisor) => (
            <Link
              key={advisor.id}
              href={`/danismanlar/${advisor.slug}`}
              className="flex flex-col items-center rounded-2xl border border-black/5 bg-white p-6 text-center transition-shadow hover:shadow-lg hover:shadow-brand-900/5"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-800 font-serif text-lg font-semibold text-cream-50">
                {initials(advisor.name)}
              </span>
              <p className="mt-4 font-medium text-brand-950">{advisor.name}</p>
              <p className="text-xs text-foreground/55">{advisor.title}</p>
              <p className="mt-2 flex items-center gap-1 text-xs text-foreground/50">
                <MapPin className="h-3.5 w-3.5" /> {advisor.regions.join(", ")}
              </p>
              <p className="mt-3 line-clamp-3 text-xs text-foreground/55">{advisor.bio}</p>
              <p className="mt-3 text-xs font-medium text-brand-600">{advisor.listingCount} aktif ilan</p>
              <span className="mt-4 flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
                <Phone className="h-3.5 w-3.5" /> İletişime Geç
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
