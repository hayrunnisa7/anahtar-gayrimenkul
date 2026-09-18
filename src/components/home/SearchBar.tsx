"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import type { ListingStatus, PropertyCategory } from "@/types/listing";

const statusTabs: { value: ListingStatus; label: string }[] = [
  { value: "satilik", label: "Satılık" },
  { value: "kiralik", label: "Kiralık" },
];

const categories: { value: PropertyCategory; label: string }[] = [
  { value: "konut", label: "Konut" },
  { value: "arsa", label: "Arsa" },
  { value: "isyeri", label: "İşyeri" },
];

export function SearchBar() {
  const [status, setStatus] = useState<ListingStatus>("satilik");
  const [category, setCategory] = useState<PropertyCategory>("konut");

  return (
    <div className="w-full rounded-2xl bg-white/95 p-3 shadow-xl shadow-brand-950/10 backdrop-blur sm:p-4">
      <div className="mb-3 flex gap-1.5">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              status === tab.value ? "bg-brand-800 text-cream-50" : "text-brand-900/60 hover:bg-brand-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form
        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PropertyCategory)}
          className="h-12 rounded-xl border border-black/10 bg-cream-50 px-4 text-sm text-brand-950 outline-none focus:border-brand-400"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Şehir, ilçe veya semt ara"
          className="h-12 rounded-xl border border-black/10 bg-cream-50 px-4 text-sm text-brand-950 outline-none placeholder:text-foreground/40 focus:border-brand-400"
        />

        <Button type="submit" size="lg" className="h-12 w-full sm:w-auto">
          <Search className="h-4 w-4" />
          Ara
        </Button>
      </form>
    </div>
  );
}
