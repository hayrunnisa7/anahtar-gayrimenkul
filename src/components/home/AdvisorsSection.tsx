import Link from "next/link";
import { Phone } from "lucide-react";
import { getFeaturedAdvisors } from "@/lib/data/advisors";
import { getActiveListingsByAdvisor } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export async function AdvisorsSection() {
  const featuredAdvisors = await getFeaturedAdvisors(4);
  const advisors = await Promise.all(
    featuredAdvisors.map(async (advisor) => ({
      ...advisor,
      listingCount: (await getActiveListingsByAdvisor(advisor.id)).length,
    })),
  );

  return (
    <section className="bg-cream-100/60 py-16 sm:py-20">
      <Container>
        <SectionHeading
          eyebrow="Uzman Kadro"
          title="Danışmanlarımız"
          description="Bölgesinde uzman danışmanlarla doğrudan iletişime geçin."
          href="/danismanlar"
        />
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
              <p className="mt-2 text-xs text-brand-600">{advisor.listingCount} aktif ilan</p>
              <span className="mt-4 flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
                <Phone className="h-3.5 w-3.5" /> İletişime Geç
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
