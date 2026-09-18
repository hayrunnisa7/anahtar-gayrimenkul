"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/lib/compare/CompareProvider";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatArea, formatPrice } from "@/lib/utils/format";
import type { Listing, PropertyCategory } from "@/types/listing";

const categoryLabels: Record<PropertyCategory, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

function yesNo(value: boolean | undefined) {
  if (value === undefined) return "—";
  return value ? "Evet" : "Hayır";
}

interface CompareRow {
  label: string;
  render: (listing: Listing) => ReactNode;
}

const rows: CompareRow[] = [
  {
    label: "Fiyat",
    render: (l) => (
      <span className="font-semibold text-brand-800">
        {formatPrice(l.price)}
        {l.status === "kiralik" && <span className="font-normal text-foreground/50"> /ay</span>}
      </span>
    ),
  },
  { label: "İlan Tipi", render: (l) => (l.status === "satilik" ? "Satılık" : "Kiralık") },
  { label: "Kategori", render: (l) => `${categoryLabels[l.category]} · ${l.subCategory}` },
  { label: "Konum", render: (l) => `${l.district}, ${l.city}` },
  { label: "Brüt Alan", render: (l) => formatArea(l.area) },
  { label: "Net Alan", render: (l) => (l.netArea ? formatArea(l.netArea) : "—") },
  { label: "Oda Sayısı", render: (l) => l.roomCount ?? "—" },
  { label: "Bina Yaşı", render: (l) => (l.buildingAge !== undefined ? `${l.buildingAge} yıl` : "—") },
  { label: "Kat", render: (l) => l.floor ?? "—" },
  { label: "Isıtma", render: (l) => l.heating ?? "—" },
  { label: "Banyo Sayısı", render: (l) => l.bathroomCount ?? "—" },
  { label: "Balkon", render: (l) => l.balconyCount ?? "—" },
  { label: "Eşyalı", render: (l) => yesNo(l.isFurnished) },
  { label: "Otopark", render: (l) => yesNo(l.hasParking) },
  { label: "Site İçerisinde", render: (l) => yesNo(l.inComplex) },
  {
    label: "Aidat",
    render: (l) => (l.dues !== undefined ? (l.dues > 0 ? `${formatPrice(l.dues)}/ay` : "Yok") : "—"),
  },
  { label: "Tapu Durumu", render: (l) => l.titleDeedStatus ?? "—" },
  { label: "Krediye Uygunluk", render: (l) => yesNo(l.loanEligible) },
];

export function CompareTable() {
  const { ids, remove, clear } = useCompare();
  const key = ids.join(",");
  // Son tamamlanan isteğin hangi id kümesine ait olduğunu tutar; `isLoading`
  // ayrı bir state olarak SENKRON set edilmek yerine bu değerle KARŞILAŞTIRMA
  // üzerinden türetilir — böylece effect gövdesinde doğrudan bir setState
  // çağrısı olmaz (yalnızca fetch'in async callback'i içinde çağrılır).
  const [result, setResult] = useState<{ key: string; listings: Listing[] } | null>(null);

  useEffect(() => {
    if (ids.length === 0) return;

    let active = true;
    fetch(`/api/listings/by-ids?ids=${key}`)
      .then((res) => res.json())
      .then((data: { listings: Listing[] }) => {
        if (active) setResult({ key, listings: data.listings });
      });
    return () => {
      active = false;
    };
  }, [ids.length, key]);

  const displayListings = ids.length === 0 ? [] : result?.key === key ? result.listings : [];
  const displayLoading = ids.length > 0 && result?.key !== key;

  if (!displayLoading && displayListings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Scale className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <p className="mt-4 font-serif text-lg font-semibold text-brand-950">
          Henüz karşılaştırmaya ilan eklemediniz
        </p>
        <p className="mt-2 max-w-sm text-sm text-foreground/55">
          İlan kartlarındaki terazi simgesine tıklayarak en fazla 4 ilanı yan yana
          karşılaştırabilirsiniz.
        </p>
        <LinkButton href="/ilanlar" variant="primary" className="mt-6">
          İlanlara Göz At
        </LinkButton>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-foreground/55">{displayListings.length} / 4 ilan seçildi</p>
        {displayListings.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear}>
            Tümünü Temizle
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36 shrink-0 p-3 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-foreground/45">
                Özellik
              </th>
              {displayListings.map((listing) => (
                <th key={listing.id} className="min-w-[190px] p-3 text-left align-top">
                  <div className="relative">
                    <PlaceholderImage
                      seed={listing.id}
                      category={listing.category}
                      className="aspect-[4/3] w-full rounded-xl"
                      iconClassName="h-6 w-6"
                    />
                    <button
                      type="button"
                      onClick={() => remove(listing.id)}
                      aria-label="Karşılaştırmadan kaldır"
                      className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/ilanlar/${listing.slug}`}
                      className="mt-2 line-clamp-2 block text-sm font-medium text-brand-950 hover:underline"
                    >
                      {listing.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-black/5">
                <td className="p-3 text-xs font-semibold uppercase tracking-wide text-foreground/45">
                  {row.label}
                </td>
                {displayListings.map((listing) => (
                  <td key={listing.id} className="p-3 text-brand-950">
                    {row.render(listing)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
