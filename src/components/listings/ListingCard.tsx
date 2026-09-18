import Link from "next/link";
import { Bed, MapPin, Square } from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Badge } from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { CompareToggleButton } from "@/components/listings/CompareToggleButton";
import { formatArea, formatPrice, formatRelativeDate } from "@/lib/utils/format";
import type { Listing } from "@/types/listing";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/ilanlar/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow hover:shadow-lg hover:shadow-brand-900/10"
    >
      <div className="relative">
        <PlaceholderImage
          seed={listing.id}
          category={listing.category}
          className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            <Badge tone="brand">{listing.status === "satilik" ? "Satılık" : "Kiralık"}</Badge>
            <Badge tone="cream">{listing.subCategory}</Badge>
            {listing.isFeatured && <Badge tone="gold">Öne Çıkan</Badge>}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <CompareToggleButton listingId={listing.id} size="sm" />
            <FavoriteButton listingId={listing.id} size="sm" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="font-serif text-lg font-semibold leading-tight text-brand-950">
          {formatPrice(listing.price)}
          {listing.status === "kiralik" && <span className="text-sm font-normal text-foreground/50"> /ay</span>}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium text-foreground/85">{listing.title}</h3>
        <p className="flex items-center gap-1.5 text-xs text-foreground/55">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {listing.district}, {listing.city}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-black/5 pt-3 text-xs text-foreground/60">
          <span className="flex items-center gap-1.5">
            <Square className="h-3.5 w-3.5" /> {formatArea(listing.area)}
          </span>
          {listing.roomCount && (
            <span className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" /> {listing.roomCount}
            </span>
          )}
          <span className="ml-auto">{formatRelativeDate(listing.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
