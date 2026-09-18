"use client";

import { Scale } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCompare } from "@/lib/compare/CompareProvider";

export function CompareToggleButton({
  listingId,
  size = "lg",
  className,
}: {
  listingId: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const { isSelected, toggle, isFull } = useCompare();
  const active = isSelected(listingId);
  const disabled = isFull && !active;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        // Kart tamamı bir <Link> olabileceğinden tıklamanın ilana
        // gitmesini engelle — yalnızca karşılaştırma seçimi değişsin.
        e.preventDefault();
        e.stopPropagation();
        toggle(listingId);
      }}
      aria-pressed={active}
      aria-label={active ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
      title={disabled ? "En fazla 4 ilan karşılaştırabilirsiniz" : undefined}
      className={cn(
        "flex items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        size === "lg" ? "h-11 w-11" : "h-9 w-9",
        active
          ? "border-brand-800 bg-brand-800 text-cream-50"
          : "border-black/10 bg-white/90 text-brand-900 backdrop-blur hover:bg-white",
        className,
      )}
    >
      <Scale className={size === "lg" ? "h-5 w-5" : "h-4.5 w-4.5"} />
    </button>
  );
}
