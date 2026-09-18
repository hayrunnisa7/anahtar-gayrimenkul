"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { USAGE_STATUS_LABELS, type Listing, type PropertyCategory, type UsageStatus } from "@/types/listing";
import {
  FormField,
  FormSection,
  ToggleField,
  ChipCheckbox,
  fieldInputClass,
} from "@/components/danisman/form/FormField";
import { PhotoUploader } from "@/components/danisman/form/PhotoUploader";
import { ListingPreview } from "@/components/danisman/form/ListingPreview";
import {
  categoryFieldVisibility,
  facadeOptions,
  featureOptions,
  heatingOptions,
  roomCountOptions,
  subCategoryOptions,
  titleDeedOptions,
} from "@/components/danisman/form/formOptions";
import {
  buildPreviewListing,
  initialListingFormState,
  listingToFormState,
  validateListingForm,
  type ListingFormErrors,
  type ListingFormState,
} from "@/components/danisman/form/formState";

const categoryLabels: Record<PropertyCategory, string> = {
  konut: "Konut",
  arsa: "Arsa",
  isyeri: "İşyeri",
};

function toggleArrayValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ListingForm({
  advisorId,
  listing,
  csrfToken,
}: {
  advisorId: string;
  /** Verilirse form düzenleme modunda açılır ve mevcut ilan verileriyle önceden doldurulur. */
  listing?: Listing;
  csrfToken: string;
}) {
  const isEditing = Boolean(listing);
  const [state, setState] = useState<ListingFormState>(
    listing ? listingToFormState(listing) : initialListingFormState,
  );
  const [errors, setErrors] = useState<ListingFormErrors>({});
  const [mode, setMode] = useState<"form" | "preview">("form");
  const [photoInfo, setPhotoInfo] = useState<{ count: number; coverName?: string }>({
    count: listing?.photoCount ?? 0,
  });

  const visibility = categoryFieldVisibility[state.category];
  const formRef = useRef<HTMLFormElement>(null);

  function setField<K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(category: PropertyCategory) {
    setState((prev) => ({ ...prev, category, subCategory: subCategoryOptions[category][0] }));
  }

  function scrollTop() {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Hatalar her değiştiğinde (ve form görünümündeyken) sayfayı ilk hatalı
  // alana kaydırır. Bir efekt olarak çalışır ki setMode("form") ile bölümün
  // tekrar görünür hale gelmesi (display:none kalkması) DOM'a yansıdıktan
  // SONRA kaydırma denensin — aksi halde gizli bir öğeye kaydırmaya çalışılır.
  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0];
    if (mode !== "form" || !firstErrorKey || !formRef.current) return;

    const field = formRef.current.querySelector<HTMLElement>(`[name="${firstErrorKey}"]`);
    if (field) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof (field as HTMLInputElement).focus === "function") {
        (field as HTMLInputElement).focus({ preventScroll: true });
      }
    } else {
      scrollTop();
    }
  }, [errors, mode]);

  function handlePreviewClick() {
    const errs = validateListingForm(state);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setMode("preview");
      scrollTop();
    } else {
      setMode("form");
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const errs = validateListingForm(state);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
      setMode("form");
    }
    // Hata yoksa native form gönderimi devam eder (Post/Redirect/Get).
  }

  const hasErrors = Object.keys(errors).length > 0;
  const previewListing = buildPreviewListing(state, advisorId);

  return (
    <form
      ref={formRef}
      method="POST"
      action={isEditing ? "/api/danisman/update-listing" : "/api/danisman/create-listing"}
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="space-y-5 pb-28"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {isEditing && <input type="hidden" name="listingId" value={listing!.id} />}

      {mode === "form" && hasErrors && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          Lütfen aşağıda işaretli alanları düzeltin.
        </div>
      )}

      <div className={cn("space-y-5", mode === "preview" && "hidden")}>
        <FormSection title="İlan Tipi ve Kategori" description="İlanınızın türünü ve kategorisini seçin.">
          <FormField label="İlan Tipi" required>
            <div className="flex gap-2">
              {(
                [
                  { value: "satilik", label: "Satılık" },
                  { value: "kiralik", label: "Kiralık" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                    state.status === opt.value
                      ? "border-brand-700 bg-brand-50 text-brand-900"
                      : "border-black/10 text-foreground/60 hover:bg-cream-100",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={state.status === opt.value}
                    onChange={() => setField("status", opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Kategori" required>
            <div className="flex gap-2">
              {(Object.keys(categoryLabels) as PropertyCategory[]).map((cat) => (
                <label
                  key={cat}
                  className={cn(
                    "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                    state.category === cat
                      ? "border-brand-700 bg-brand-50 text-brand-900"
                      : "border-black/10 text-foreground/60 hover:bg-cream-100",
                  )}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={state.category === cat}
                    onChange={() => handleCategoryChange(cat)}
                    className="sr-only"
                  />
                  {categoryLabels[cat]}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Alt Kategori" required error={errors.subCategory}>
            <select
              name="subCategory"
              value={state.subCategory}
              onChange={(e) => setField("subCategory", e.target.value)}
              className={fieldInputClass}
            >
              {subCategoryOptions[state.category].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FormField>
        </FormSection>

        <FormSection title="Temel Bilgiler" description="İlanınızı özetleyen başlık ve açıklama.">
          <FormField label="İlan Başlığı" required error={errors.title} className="sm:col-span-2">
            <input
              name="title"
              value={state.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Örn. Deniz Manzaralı 3+1 Satılık Daire"
              maxLength={120}
              className={fieldInputClass}
            />
          </FormField>

          <FormField
            label="Açıklama"
            required
            error={errors.description}
            hint="En az 30 karakter — konumu, öne çıkan özellikleri ve yaşam avantajlarını anlatın."
            className="sm:col-span-2"
          >
            <textarea
              name="description"
              value={state.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={5}
              className={cn(fieldInputClass, "h-auto resize-none py-2.5")}
            />
          </FormField>
        </FormSection>

        <FormSection title="Konum" description="İlanın bulunduğu konum bilgileri.">
          <FormField label="İl" required error={errors.city}>
            <input
              name="city"
              value={state.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="Örn. İstanbul"
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="İlçe" required error={errors.district}>
            <input
              name="district"
              value={state.district}
              onChange={(e) => setField("district", e.target.value)}
              placeholder="Örn. Kadıköy"
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Mahalle" required error={errors.neighborhood}>
            <input
              name="neighborhood"
              value={state.neighborhood}
              onChange={(e) => setField("neighborhood", e.target.value)}
              placeholder="Örn. Caferağa"
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Açık Adres" required error={errors.address}>
            <input
              name="address"
              value={state.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Sokak, cadde, bina no"
              className={fieldInputClass}
            />
          </FormField>
        </FormSection>

        <FormSection title="Fiyat ve Alan" description="Fiyat ile brüt/net alan bilgileri.">
          <FormField
            label={state.status === "kiralik" ? "Aylık Kira (₺)" : "Satış Fiyatı (₺)"}
            required
            error={errors.price}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Örn. 9500000"
              name="price"
              value={state.price}
              onChange={(e) => setField("price", e.target.value)}
              className={fieldInputClass}
            />
          </FormField>
          <FormField label="Brüt Alan (m²)" required error={errors.area}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Örn. 140"
              name="area"
              value={state.area}
              onChange={(e) => setField("area", e.target.value)}
              className={fieldInputClass}
            />
          </FormField>
          {visibility.netArea && (
            <FormField label="Net Alan (m²)" required={state.category === "konut"} error={errors.netArea}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Örn. 120"
                name="netArea"
                value={state.netArea}
                onChange={(e) => setField("netArea", e.target.value)}
                className={fieldInputClass}
              />
            </FormField>
          )}
        </FormSection>

        {(visibility.roomCount ||
          visibility.bathroomCount ||
          visibility.buildingAge ||
          visibility.floor ||
          visibility.heating ||
          visibility.balconyCount ||
          visibility.isFurnished ||
          visibility.hasParking ||
          visibility.inComplex ||
          visibility.dues) && (
          <FormSection title="Yapı Detayları" description="Kategorinize göre gösterilen alanlar.">
            {visibility.roomCount && (
              <FormField label="Oda Sayısı" required error={errors.roomCount}>
                <select
                  name="roomCount"
                  value={state.roomCount}
                  onChange={(e) => setField("roomCount", e.target.value)}
                  className={fieldInputClass}
                >
                  <option value="">Seçin</option>
                  {roomCountOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            {visibility.bathroomCount && (
              <FormField label="Banyo Sayısı" error={errors.bathroomCount}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="bathroomCount"
                  value={state.bathroomCount}
                  onChange={(e) => setField("bathroomCount", e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
            )}

            {visibility.buildingAge && (
              <FormField label="Bina Yaşı" error={errors.buildingAge}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="buildingAge"
                  value={state.buildingAge}
                  onChange={(e) => setField("buildingAge", e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
            )}

            {visibility.floor && (
              <FormField label="Bulunduğu Kat / Toplam Kat" error={errors.floorTotal}>
                <div className="flex items-center gap-2">
                  <input
                    name="floorCurrent"
                    value={state.floorCurrent}
                    onChange={(e) => setField("floorCurrent", e.target.value)}
                    placeholder="Örn. 4 veya Zemin"
                    className={fieldInputClass}
                  />
                  <span className="text-foreground/30">/</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="floorTotal"
                    value={state.floorTotal}
                    onChange={(e) => setField("floorTotal", e.target.value)}
                    placeholder="Toplam"
                    className={fieldInputClass}
                  />
                </div>
              </FormField>
            )}

            {visibility.heating && (
              <FormField label="Isıtma">
                <select
                  name="heating"
                  value={state.heating}
                  onChange={(e) => setField("heating", e.target.value)}
                  className={fieldInputClass}
                >
                  <option value="">Seçin</option>
                  {heatingOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            {visibility.balconyCount && (
              <FormField label="Balkon Sayısı" error={errors.balconyCount}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="balconyCount"
                  value={state.balconyCount}
                  onChange={(e) => setField("balconyCount", e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
            )}

            {visibility.isFurnished && (
              <ToggleField
                label="Eşyalı"
                name="isFurnished"
                value={state.isFurnished}
                onChange={(v) => setField("isFurnished", v)}
              />
            )}

            {visibility.hasParking && (
              <ToggleField
                label="Otopark"
                name="hasParking"
                value={state.hasParking}
                onChange={(v) => setField("hasParking", v)}
              />
            )}

            {visibility.inComplex && (
              <ToggleField
                label="Site İçerisinde"
                name="inComplex"
                value={state.inComplex}
                onChange={(v) => setField("inComplex", v)}
              />
            )}

            {visibility.dues && (
              <FormField label="Aidat (₺/ay)" error={errors.dues}>
                <input
                  type="text"
                  inputMode="numeric"
                  name="dues"
                  value={state.dues}
                  onChange={(e) => setField("dues", e.target.value)}
                  className={fieldInputClass}
                />
              </FormField>
            )}
          </FormSection>
        )}

        <FormSection title="Tapu ve Durum Bilgileri" description="Tüm kategoriler için geçerli bilgiler.">
          <FormField label="Cephe" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {facadeOptions.map((opt) => (
                <ChipCheckbox
                  key={opt}
                  label={opt}
                  name="facade"
                  value={opt}
                  checked={state.facade.includes(opt)}
                  onChange={() => setField("facade", toggleArrayValue(state.facade, opt))}
                />
              ))}
            </div>
          </FormField>

          <FormField label="Tapu Durumu">
            <select
              name="titleDeedStatus"
              value={state.titleDeedStatus}
              onChange={(e) => setField("titleDeedStatus", e.target.value)}
              className={fieldInputClass}
            >
              <option value="">Seçin</option>
              {titleDeedOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Kullanım Durumu">
            <select
              name="usageStatus"
              value={state.usageStatus}
              onChange={(e) => setField("usageStatus", e.target.value as UsageStatus)}
              className={fieldInputClass}
            >
              <option value="">Seçin</option>
              {(Object.entries(USAGE_STATUS_LABELS) as [UsageStatus, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          <ToggleField
            label="Krediye Uygunluk"
            name="loanEligible"
            value={state.loanEligible}
            onChange={(v) => setField("loanEligible", v)}
          />
        </FormSection>

        <FormSection title="İlan Özellikleri" description="İlanınızı öne çıkaran özellikleri seçin.">
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {featureOptions.map((opt) => (
              <ChipCheckbox
                key={opt}
                label={opt}
                name="features"
                value={opt}
                checked={state.features.includes(opt)}
                onChange={() => setField("features", toggleArrayValue(state.features, opt))}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Fotoğraflar"
          description={
            isEditing
              ? "Yeni fotoğraf eklemezseniz mevcut fotoğraf sayısı korunur."
              : "İlan fotoğraflarını yükleyin ve kapak fotoğrafını seçin."
          }
        >
          <div className="sm:col-span-2">
            {isEditing && photoInfo.count === (listing?.photoCount ?? 0) && (
              <p className="mb-3 text-xs text-foreground/55">
                Şu anda {listing?.photoCount ?? 0} fotoğraf kayıtlı. Değiştirmek için yeni fotoğraf
                seçin.
              </p>
            )}
            <PhotoUploader onChange={setPhotoInfo} />
          </div>
        </FormSection>
      </div>

      {mode === "preview" && (
        <div className="rounded-2xl border border-black/5 bg-cream-50 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => setMode("form")}
            className="mb-5 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            ← Düzenlemeye Dön
          </button>
          <ListingPreview
            listing={previewListing}
            photoCount={photoInfo.count}
            coverPhotoName={photoInfo.coverName}
          />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {mode === "form" ? (
            <>
              <Button type="button" variant="outline" onClick={handlePreviewClick}>
                İlanı Önizle
              </Button>
              <Button type="submit">{isEditing ? "Değişiklikleri Kaydet" : "İlanı Gönder"}</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setMode("form")}>
                Düzenlemeye Dön
              </Button>
              <Button type="submit">{isEditing ? "Değişiklikleri Kaydet" : "İlanı Gönder"}</Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
