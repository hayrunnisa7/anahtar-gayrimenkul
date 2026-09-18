"use client";

import { useState } from "react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils/cn";
import type { PropertyCategory } from "@/types/listing";

export function ListingGallery({
  listingId,
  category,
  photoCount,
}: {
  listingId: string;
  category: PropertyCategory;
  photoCount: number;
}) {
  const count = Math.max(1, Math.min(photoCount, 8));
  const [active, setActive] = useState(0);

  return (
    <div>
      <PlaceholderImage
        seed={`${listingId}-${active}`}
        category={category}
        className="aspect-[16/10] w-full rounded-2xl"
        iconClassName="h-14 w-14"
      />
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${i + 1}. fotoğrafı göster`}
            className={cn(
              "overflow-hidden rounded-lg outline-offset-2 transition-opacity",
              active === i ? "opacity-100 ring-2 ring-brand-600" : "opacity-70 hover:opacity-100",
            )}
          >
            <PlaceholderImage seed={`${listingId}-${i}`} category={category} className="aspect-[4/3] w-full" iconClassName="h-4 w-4" />
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-foreground/45">
        {photoCount} fotoğraf · Görseller demo amaçlıdır
      </p>
    </div>
  );
}
