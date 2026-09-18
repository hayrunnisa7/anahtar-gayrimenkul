import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingFilterPanel } from "@/components/listings/ListingFilterPanel";
import { ActiveFilterChips } from "@/components/listings/ActiveFilterChips";
import { SortSelect } from "@/components/listings/SortSelect";
import {
  getFilteredListings,
  getListingFilterOptions,
  type ListingFilters,
  type ListingSort,
} from "@/lib/data/listings";
import type { ListingStatus, PropertyCategory } from "@/types/listing";

export const metadata: Metadata = {
  title: "İlanlar | Anahtar Gayrimenkul",
  description: "Satılık ve kiralık konut, arsa ve işyeri ilanlarını filtreleyerek arayın.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value?: string) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const validStatuses: ListingStatus[] = ["satilik", "kiralik"];
const validCategories: PropertyCategory[] = ["konut", "arsa", "isyeri"];
const validSorts: ListingSort[] = ["en-yeni", "fiyat-artan", "fiyat-azalan"];

export default async function IlanlarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const status = first(sp.durum);
  const category = first(sp.kategori);
  const sort = first(sp.sirala);

  const filters: ListingFilters = {
    status: validStatuses.includes(status as ListingStatus) ? (status as ListingStatus) : undefined,
    category: validCategories.includes(category as PropertyCategory)
      ? (category as PropertyCategory)
      : undefined,
    city: first(sp.il) || undefined,
    district: first(sp.ilce) || undefined,
    minPrice: toNumber(first(sp.fiyatMin)),
    maxPrice: toNumber(first(sp.fiyatMax)),
    minArea: toNumber(first(sp.m2Min)),
    maxArea: toNumber(first(sp.m2Max)),
    roomCount: first(sp.oda) || undefined,
    sort: validSorts.includes(sort as ListingSort) ? (sort as ListingSort) : "en-yeni",
  };

  const [listings, filterOptions] = await Promise.all([
    getFilteredListings(filters),
    getListingFilterOptions(),
  ]);

  return (
    <div className="bg-cream-50">
      <div className="border-b border-black/5 bg-brand-950 py-6 sm:py-7">
        <Container className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gold-400">İlanlar</p>
            <h1 className="mt-1 font-serif text-xl font-semibold text-cream-50 sm:text-2xl">
              Satılık ve kiralık ilanları keşfedin
            </h1>
          </div>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-8 py-8 sm:py-10 lg:grid-cols-[280px_1fr]">
        <ListingFilterPanel filterOptions={filterOptions} resultCount={listings.length} />

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-foreground/60">
              <span className="font-semibold text-brand-950">{listings.length}</span> ilan bulundu
            </p>
            <SortSelect />
          </div>

          <ActiveFilterChips />

          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
              <p className="font-serif text-lg font-semibold text-brand-950">Sonuç bulunamadı</p>
              <p className="mt-2 text-sm text-foreground/55">
                Filtrelerinizi değiştirerek tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
