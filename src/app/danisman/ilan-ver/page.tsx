import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getListingBySlug } from "@/lib/data/listings";
import { Container } from "@/components/ui/Container";
import { ListingForm } from "@/components/danisman/form/ListingForm";

export const metadata: Metadata = {
  title: "İlan Ver | Anahtar Gayrimenkul",
};

export default async function IlanVerPage({
  searchParams,
}: {
  searchParams: Promise<{ ilan?: string; hata?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris?next=/danisman/ilan-ver");
  if (session.role !== "danisman") redirect("/erisim-engellendi");

  const { ilan, hata } = await searchParams;

  const listing = ilan ? await getListingBySlug(ilan) : undefined;
  // Başka bir danışmanın ilanı düzenlenmeye çalışılırsa sessizce yeni ilan
  // formuna düşmek yerine erişimi reddet.
  if (ilan && (!listing || listing.advisorId !== session.id)) {
    redirect("/erisim-engellendi");
  }

  const isEditing = Boolean(listing);

  return (
    <div className="bg-cream-50 py-8 sm:py-10">
      <Container className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
            Danışman Paneli
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
            {isEditing ? "İlanı Düzenle" : "Yeni İlan Ekle"}
          </h1>
          <p className="mt-1 text-sm text-foreground/55">
            {isEditing
              ? "Değişiklikleriniz kaydedildiğinde yayın durumu ve ilan bağlantısı aynı kalır."
              : 'İlanınız gönderildikten sonra admin onayına düşer ve "Beklemede" olarak İlanlarım bölümünde görünür.'}
          </p>
        </div>

        {hata && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Gönderilen bilgilerde bir sorun oluştu, lütfen formu kontrol edip tekrar deneyin.
          </div>
        )}

        <ListingForm advisorId={session.id} listing={listing} csrfToken={session.csrf} />
      </Container>
    </div>
  );
}
