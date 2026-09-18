import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { ListingFacts } from "@/components/listings/ListingFacts";
import { formatPrice } from "@/lib/utils/format";
import type { Listing } from "@/types/listing";

const categoryLabels: Record<string, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

export function ListingPreview({
  listing,
  photoCount,
  coverPhotoName,
}: {
  listing: Listing;
  photoCount: number;
  coverPhotoName?: string;
}) {
  const location = [listing.neighborhood, listing.district, listing.city].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-sm text-brand-900">
        Bu bir <strong>önizlemedir</strong> — ilan henüz gönderilmedi. Yayınlandığında{" "}
        <strong>Beklemede</strong> durumunda oluşturulacak ve admin onayı sonrası aktifleşecektir.
      </div>

      <div>
        <PlaceholderImage
          seed={listing.id}
          category={listing.category}
          className="aspect-[16/10] w-full rounded-2xl"
          iconClassName="h-14 w-14"
        />
        <p className="mt-2 text-xs text-foreground/50">
          {photoCount > 0
            ? `${photoCount} fotoğraf seçildi${coverPhotoName ? ` · Kapak: ${coverPhotoName}` : ""} (önizlemede yer tutucu gösterilir)`
            : "Henüz fotoğraf seçilmedi"}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{listing.status === "satilik" ? "Satılık" : "Kiralık"}</Badge>
          <Badge tone="cream">
            {categoryLabels[listing.category]}
            {listing.subCategory ? ` · ${listing.subCategory}` : ""}
          </Badge>
          <Badge tone="gold">Beklemede</Badge>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-950 sm:text-3xl">
          {listing.title || "(Başlık girilmedi)"}
        </h1>
        {location && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-foreground/60">
            <MapPin className="h-4 w-4 shrink-0" /> {location}
          </p>
        )}
        <p className="mt-4 font-serif text-3xl font-semibold text-brand-950">
          {listing.price ? formatPrice(listing.price) : "—"}
          {listing.status === "kiralik" && listing.price > 0 && (
            <span className="text-base font-normal text-foreground/50"> /ay</span>
          )}
        </p>
      </div>

      <div>
        <h2 className="mb-4 font-serif text-lg font-semibold text-brand-950">İlan Detayları</h2>
        <ListingFacts listing={listing} />
      </div>

      <div>
        <h2 className="mb-2 font-serif text-lg font-semibold text-brand-950">Açıklama</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/75">
          {listing.description || "—"}
        </p>
      </div>

      {listing.features.length > 0 && (
        <div>
          <h2 className="mb-2 font-serif text-lg font-semibold text-brand-950">Özellikler</h2>
          <div className="flex flex-wrap gap-2">
            {listing.features.map((f) => (
              <Badge key={f} tone="neutral">
                {f}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
