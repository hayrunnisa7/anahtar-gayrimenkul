import { Check, Eye, User, X } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Badge } from "@/components/ui/Badge";
import { formatArea, formatPrice, formatRelativeDate } from "@/lib/utils/format";
import type { Listing } from "@/types/listing";

const categoryLabels: Record<string, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

export function PendingListingRow({
  listing,
  advisorName,
  csrfToken,
}: {
  listing: Listing;
  advisorName: string;
  csrfToken: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
      <PlaceholderImage
        seed={listing.id}
        category={listing.category}
        className="h-32 w-full shrink-0 rounded-xl sm:h-20 sm:w-28"
        iconClassName="h-6 w-6"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{listing.status === "satilik" ? "Satılık" : "Kiralık"}</Badge>
          <Badge tone="cream">
            {categoryLabels[listing.category]} · {listing.subCategory}
          </Badge>
          <Badge tone="gold">Beklemede</Badge>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-brand-950">{listing.title}</p>
        <p className="text-xs text-foreground/55">
          {listing.district}, {listing.city} · {formatArea(listing.area)}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-800">{formatPrice(listing.price)}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/50">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {advisorName}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Gönderim: {formatRelativeDate(listing.createdAt)}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
        <form method="POST" action="/api/admin/moderate-listing">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="decision" value="onayla" />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-800 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-brand-700"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Onayla
          </button>
        </form>
        <form method="POST" action="/api/admin/moderate-listing">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="decision" value="reddet" />
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <X className="h-3.5 w-3.5" strokeWidth={3} /> Reddet
          </button>
        </form>
      </div>
    </div>
  );
}
