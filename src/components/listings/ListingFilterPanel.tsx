"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import type { ListingFilterOptions } from "@/lib/data/listings";

const statusOptions = [
  { value: "", label: "Tümü" },
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
];

const categoryOptions = [
  { value: "", label: "Tümü" },
  { value: "konut", label: "Konut" },
  { value: "arsa", label: "Arsa" },
  { value: "isyeri", label: "İşyeri" },
];

const inputClass =
  "h-10 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white";

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/45">
        {label}
      </p>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, "disabled:cursor-not-allowed disabled:opacity-50")}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function ListingFilterPanel({
  filterOptions,
  resultCount,
}: {
  filterOptions: ListingFilterOptions;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentCity = searchParams.get("il") ?? "";
  const districts = currentCity ? filterOptions.districtsByCity[currentCity] ?? [] : [];

  const [priceMin, setPriceMin] = useState(searchParams.get("fiyatMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("fiyatMax") ?? "");
  const [areaMin, setAreaMin] = useState(searchParams.get("m2Min") ?? "");
  const [areaMax, setAreaMax] = useState(searchParams.get("m2Max") ?? "");

  // router.push() updates the URL asynchronously (there's a real gap before
  // useSearchParams()/window.location reflect it), so two quick consecutive
  // filter changes built from either would race and clobber each other.
  // Track the pending params in a ref that's updated synchronously instead.
  const paramsRef = useRef(new URLSearchParams(searchParams.toString()));
  useEffect(() => {
    paramsRef.current = new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  function buildParams() {
    return new URLSearchParams(paramsRef.current);
  }

  function pushParams(params: URLSearchParams) {
    paramsRef.current = params;
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function setParam(key: string, value: string) {
    const params = buildParams();
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "il") params.delete("ilce");
    pushParams(params);
  }

  function handleApplyRange(e: FormEvent) {
    e.preventDefault();
    const params = buildParams();
    const set = (key: string, val: string) => (val ? params.set(key, val) : params.delete(key));
    set("fiyatMin", priceMin);
    set("fiyatMax", priceMax);
    set("m2Min", areaMin);
    set("m2Max", areaMax);
    pushParams(params);
    setIsOpen(false);
  }

  function handleClear() {
    setPriceMin("");
    setPriceMax("");
    setAreaMin("");
    setAreaMax("");
    router.push(pathname);
    setIsOpen(false);
  }

  const activeCount = Array.from(searchParams.keys()).filter((k) => k !== "sirala").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-4 flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-brand-900 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filtreler
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-800 px-2 py-0.5 text-xs text-cream-50">{activeCount}</span>
          )}
        </span>
        <span className="text-foreground/50">{resultCount} ilan</span>
      </button>

      <aside
        className={cn(
          "fixed inset-0 z-50 bg-black/40 lg:static lg:z-auto lg:block lg:bg-transparent",
          isOpen ? "block" : "hidden",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
      >
        <div className="ml-auto flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-cream-50 lg:sticky lg:top-24 lg:ml-0 lg:h-auto lg:w-full lg:max-w-none lg:rounded-2xl lg:border lg:border-black/5 lg:bg-white lg:shadow-sm">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="hidden h-4 w-4 text-brand-600 lg:block" />
              <p className="font-serif text-lg font-semibold text-brand-950">Filtreler</p>
              {activeCount > 0 && (
                <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 lg:inline-block">
                  {activeCount} aktif
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Filtreleri kapat"
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="divide-y divide-black/5 px-5">
            <div className="space-y-4 py-5">
              <FilterGroup label="İlan Tipi">
                <SelectField
                  value={searchParams.get("durum") ?? ""}
                  onChange={(v) => setParam("durum", v)}
                  options={statusOptions}
                />
              </FilterGroup>

              <FilterGroup label="Kategori">
                <SelectField
                  value={searchParams.get("kategori") ?? ""}
                  onChange={(v) => setParam("kategori", v)}
                  options={categoryOptions}
                />
              </FilterGroup>
            </div>

            <div className="space-y-4 py-5">
              <FilterGroup label="İl">
                <SelectField
                  value={currentCity}
                  onChange={(v) => setParam("il", v)}
                  options={[
                    { value: "", label: "Tüm iller" },
                    ...filterOptions.cities.map((c) => ({ value: c, label: c })),
                  ]}
                />
              </FilterGroup>

              <FilterGroup label="İlçe">
                <SelectField
                  value={searchParams.get("ilce") ?? ""}
                  onChange={(v) => setParam("ilce", v)}
                  disabled={!currentCity}
                  options={[
                    { value: "", label: currentCity ? "Tüm ilçeler" : "Önce il seçin" },
                    ...districts.map((d) => ({ value: d, label: d })),
                  ]}
                />
              </FilterGroup>
            </div>

            <div className="py-5">
              <FilterGroup label="Oda Sayısı">
                <SelectField
                  value={searchParams.get("oda") ?? ""}
                  onChange={(v) => setParam("oda", v)}
                  options={[
                    { value: "", label: "Tümü" },
                    ...filterOptions.roomCounts.map((r) => ({ value: r, label: r })),
                  ]}
                />
              </FilterGroup>
            </div>

            <form onSubmit={handleApplyRange} className="space-y-4 py-5">
              <FilterGroup label="Fiyat Aralığı (₺)">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-foreground/30">–</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </FilterGroup>

              <FilterGroup label="Alan (m²)">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Min"
                    value={areaMin}
                    onChange={(e) => setAreaMin(e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-foreground/30">–</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="Max"
                    value={areaMax}
                    onChange={(e) => setAreaMax(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </FilterGroup>

              <Button type="submit" className="w-full">
                Uygula
              </Button>
            </form>

            <div className="py-4">
              <Button type="button" variant="outline" onClick={handleClear} className="w-full">
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
