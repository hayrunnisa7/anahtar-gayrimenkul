import { Eye, EyeOff, RotateCcw, SquarePen } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { formatArea, formatPrice } from "@/lib/utils/format";
import { PUBLISH_STATUS_LABELS, type Listing } from "@/types/listing";

const publishBadgeTone = {
  aktif: "brand",
  beklemede: "gold",
  pasif: "neutral",
} as const;

export function AdvisorListingRow({ listing, csrfToken }: { listing: Listing; csrfToken: string }) {
  return (
    <div
      data-testid="advisor-listing-row"
      data-publish-status={listing.publishStatus}
      className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center"
    >
      <PlaceholderImage
        seed={listing.id}
        category={listing.category}
        className="h-32 w-full shrink-0 rounded-xl sm:h-20 sm:w-28"
        iconClassName="h-6 w-6"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={publishBadgeTone[listing.publishStatus]}>
            {PUBLISH_STATUS_LABELS[listing.publishStatus]}
          </Badge>
          <Badge tone="cream">{listing.status === "satilik" ? "Satılık" : "Kiralık"}</Badge>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-brand-950">{listing.title}</p>
        <p className="text-xs text-foreground/55">
          {listing.district}, {listing.city} · {formatArea(listing.area)}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-800">{formatPrice(listing.price)}</p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <span className="flex items-center gap-1.5 text-xs text-foreground/55">
          <Eye className="h-3.5 w-3.5" /> {listing.viewCount.toLocaleString("tr-TR")} görüntülenme
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <LinkButton href={`/danisman/ilan-ver?ilan=${listing.slug}`} variant="outline" size="sm">
            <SquarePen className="h-3.5 w-3.5" /> Düzenle
          </LinkButton>

          {listing.publishStatus === "beklemede" ? (
            <span className="rounded-full bg-gold-400/15 px-3 py-1.5 text-xs font-medium text-gold-500">
              Admin onayı bekleniyor
            </span>
          ) : (
            <form method="POST" action="/api/danisman/toggle-listing">
              <input type="hidden" name="csrfToken" value={csrfToken} />
              <input type="hidden" name="listingId" value={listing.id} />
              <input
                type="hidden"
                name="nextStatus"
                value={listing.publishStatus === "aktif" ? "pasif" : "aktif"}
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-900 transition-colors hover:bg-brand-50"
              >
                {listing.publishStatus === "aktif" ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Yayından Kaldır
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" /> Aktifleştir
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
