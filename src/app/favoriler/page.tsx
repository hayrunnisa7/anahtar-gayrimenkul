import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getFavoriteListings } from "@/lib/data/favorites";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { ListingCard } from "@/components/listings/ListingCard";

export const metadata: Metadata = {
  title: "Favorilerim | Anahtar Gayrimenkul",
};

export default async function FavorilerPage() {
  const session = await getSession();
  if (!session) redirect("/giris?next=/favoriler");

  const listings = await getFavoriteListings(session.id);

  return (
    <div className="bg-cream-50 py-10 sm:py-14">
      <Container>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Favorilerim</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          Favori İlanlarım
        </h1>
        <p className="mt-1 text-sm text-foreground/55">
          {listings.length > 0
            ? `${listings.length} ilanı favorilediniz.`
            : "Henüz favori ilanınız yok."}
        </p>

        {listings.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Heart className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="mt-4 font-serif text-lg font-semibold text-brand-950">
              Henüz favori ilanınız yok
            </p>
            <p className="mt-2 max-w-sm text-sm text-foreground/55">
              Beğendiğiniz ilanların üzerindeki kalp simgesine tıklayarak favorilerinize
              ekleyebilirsiniz.
            </p>
            <LinkButton href="/ilanlar" variant="primary" className="mt-6">
              İlanlara Göz At
            </LinkButton>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
