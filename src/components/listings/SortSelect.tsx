"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "en-yeni", label: "En Yeni" },
  { value: "fiyat-artan", label: "Fiyat: Düşükten Yükseğe" },
  { value: "fiyat-azalan", label: "Fiyat: Yüksekten Düşüğe" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sirala") ?? "en-yeni";

  function handleChange(value: string) {
    // Reads the live URL rather than the `searchParams` snapshot so this
    // doesn't clobber a filter change that was just pushed elsewhere.
    const params = new URLSearchParams(window.location.search);
    if (value === "en-yeni") params.delete("sirala");
    else params.set("sirala", value);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="h-10 shrink-0 rounded-lg border border-black/10 bg-white px-3 text-sm text-brand-950 outline-none focus:border-brand-400"
      aria-label="İlanları sırala"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
