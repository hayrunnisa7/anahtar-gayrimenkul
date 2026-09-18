"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { formatArea, formatPrice } from "@/lib/utils/format";

const statusLabels: Record<string, string> = {
  satilik: "Satılık",
  kiralik: "Kiralık",
};

const categoryLabels: Record<string, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

interface Chip {
  label: string;
  keys: string[];
}

export function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: Chip[] = [];

  const durum = searchParams.get("durum");
  if (durum) chips.push({ label: statusLabels[durum] ?? durum, keys: ["durum"] });

  const kategori = searchParams.get("kategori");
  if (kategori) chips.push({ label: categoryLabels[kategori] ?? kategori, keys: ["kategori"] });

  const il = searchParams.get("il");
  if (il) chips.push({ label: il, keys: ["il", "ilce"] });

  const ilce = searchParams.get("ilce");
  if (ilce) chips.push({ label: ilce, keys: ["ilce"] });

  const oda = searchParams.get("oda");
  if (oda) chips.push({ label: `${oda} oda`, keys: ["oda"] });

  const fiyatMin = searchParams.get("fiyatMin");
  const fiyatMax = searchParams.get("fiyatMax");
  if (fiyatMin || fiyatMax) {
    const label = `${fiyatMin ? formatPrice(Number(fiyatMin)) : "0"} – ${
      fiyatMax ? formatPrice(Number(fiyatMax)) : "∞"
    }`;
    chips.push({ label, keys: ["fiyatMin", "fiyatMax"] });
  }

  const m2Min = searchParams.get("m2Min");
  const m2Max = searchParams.get("m2Max");
  if (m2Min || m2Max) {
    const label = `${m2Min ? formatArea(Number(m2Min)) : "0 m²"} – ${
      m2Max ? formatArea(Number(m2Max)) : "∞"
    }`;
    chips.push({ label, keys: ["m2Min", "m2Max"] });
  }

  if (chips.length === 0) return null;

  function removeKeys(keys: string[]) {
    const params = new URLSearchParams(window.location.search);
    keys.forEach((k) => params.delete(k));
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.keys.join("-")}
          type="button"
          onClick={() => removeKeys(chip.keys)}
          className="group flex items-center gap-1.5 rounded-full border border-brand-800/15 bg-brand-50 py-1.5 pl-3 pr-2 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100"
        >
          {chip.label}
          <X className="h-3.5 w-3.5 text-brand-600 transition-colors group-hover:text-brand-900" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-foreground/50 underline-offset-2 hover:text-foreground/80 hover:underline"
        >
          Tümünü temizle
        </button>
      )}
    </div>
  );
}
