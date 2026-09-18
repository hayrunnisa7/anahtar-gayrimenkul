import type { Listing, ListingStatus, PropertyCategory, UsageStatus } from "@/types/listing";
import { categoryFieldVisibility, subCategoryOptions } from "@/components/danisman/form/formOptions";
import { parseNumberInput } from "@/lib/utils/parseNumberInput";

export type YesNo = "evet" | "hayir" | "";

export interface ListingFormState {
  status: ListingStatus;
  category: PropertyCategory;
  subCategory: string;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  area: string;
  netArea: string;
  roomCount: string;
  bathroomCount: string;
  buildingAge: string;
  floorCurrent: string;
  floorTotal: string;
  heating: string;
  balconyCount: string;
  isFurnished: YesNo;
  hasParking: YesNo;
  inComplex: YesNo;
  dues: string;
  facade: string[];
  titleDeedStatus: string;
  loanEligible: YesNo;
  usageStatus: UsageStatus | "";
  features: string[];
}

export const initialListingFormState: ListingFormState = {
  status: "satilik",
  category: "konut",
  subCategory: subCategoryOptions.konut[0],
  title: "",
  description: "",
  price: "",
  city: "",
  district: "",
  neighborhood: "",
  address: "",
  area: "",
  netArea: "",
  roomCount: "",
  bathroomCount: "",
  buildingAge: "",
  floorCurrent: "",
  floorTotal: "",
  heating: "",
  balconyCount: "",
  isFurnished: "",
  hasParking: "",
  inComplex: "",
  dues: "",
  facade: [],
  titleDeedStatus: "",
  loanEligible: "",
  usageStatus: "",
  features: [],
};

export type ListingFormErrors = Partial<Record<keyof ListingFormState, string>>;

export function validateListingForm(state: ListingFormState): ListingFormErrors {
  const errors: ListingFormErrors = {};
  const visibility = categoryFieldVisibility[state.category];

  if (state.title.trim().length < 10) {
    errors.title = "Başlık en az 10 karakter olmalı.";
  } else if (state.title.trim().length > 120) {
    errors.title = "Başlık en fazla 120 karakter olabilir.";
  }

  if (state.description.trim().length < 30) {
    errors.description = "Açıklama en az 30 karakter olmalı.";
  }

  const price = parseNumberInput(state.price);
  if (price === undefined || price <= 0) {
    errors.price = "Geçerli bir fiyat girin.";
  } else if (price > 1_000_000_000) {
    errors.price = "Fiyat çok yüksek görünüyor, lütfen kontrol edin.";
  }

  if (!state.city.trim()) errors.city = "İl zorunludur.";
  if (!state.district.trim()) errors.district = "İlçe zorunludur.";
  if (!state.neighborhood.trim()) errors.neighborhood = "Mahalle zorunludur.";
  if (!state.address.trim()) errors.address = "Açık adres zorunludur.";

  const area = parseNumberInput(state.area);
  if (area === undefined || area <= 0) {
    errors.area = "Geçerli bir brüt m² girin.";
  } else if (area > 1_000_000) {
    errors.area = "Brüt m² değeri çok yüksek görünüyor, lütfen kontrol edin.";
  }

  if (visibility.netArea && state.category === "konut" && !state.netArea) {
    errors.netArea = "Net alan zorunludur.";
  } else if (visibility.netArea && state.netArea) {
    const netArea = parseNumberInput(state.netArea);
    if (netArea === undefined || netArea <= 0) {
      errors.netArea = "Geçerli bir net m² girin.";
    } else if (area !== undefined && area > 0 && netArea > area) {
      errors.netArea = "Net m², brüt m²'den büyük olamaz.";
    }
  }

  if (!state.subCategory) {
    errors.subCategory = "Alt kategori seçin.";
  }

  if (visibility.roomCount && !state.roomCount) {
    errors.roomCount = "Oda sayısı seçin.";
  }

  if (state.buildingAge) {
    const age = parseNumberInput(state.buildingAge);
    if (age === undefined || age < 0 || age > 100) {
      errors.buildingAge = "Bina yaşı 0-100 arasında olmalı.";
    }
  }

  if (visibility.floor && state.floorCurrent && state.floorTotal) {
    const current = parseNumberInput(state.floorCurrent);
    const total = parseNumberInput(state.floorTotal);
    if (current !== undefined && total !== undefined && current > total) {
      errors.floorTotal = "Toplam kat, bulunduğu kattan küçük olamaz.";
    }
  }

  if (state.dues) {
    const dues = parseNumberInput(state.dues);
    if (dues === undefined || dues < 0) {
      errors.dues = "Geçerli bir aidat tutarı girin.";
    }
  }

  if (state.bathroomCount) {
    const count = parseNumberInput(state.bathroomCount);
    if (count === undefined || count < 0 || count > 20) {
      errors.bathroomCount = "Geçerli bir banyo sayısı girin.";
    }
  }

  if (state.balconyCount) {
    const count = parseNumberInput(state.balconyCount);
    if (count === undefined || count < 0 || count > 20) {
      errors.balconyCount = "Geçerli bir balkon sayısı girin.";
    }
  }

  return errors;
}

function toBool(value: YesNo): boolean | undefined {
  if (value === "") return undefined;
  return value === "evet";
}

function fromBool(value: boolean | undefined): YesNo {
  if (value === undefined) return "";
  return value ? "evet" : "hayir";
}

/** Var olan bir ilanı, düzenleme formunu önceden doldurmak için form
 * state'ine çevirir. `buildPreviewListing`'in tersi yönde çalışır. */
export function listingToFormState(listing: Listing): ListingFormState {
  const [floorCurrent, floorTotal] = listing.floor?.split("/") ?? ["", ""];

  return {
    status: listing.status,
    category: listing.category,
    subCategory: listing.subCategory,
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    city: listing.city,
    district: listing.district,
    neighborhood: listing.neighborhood,
    address: listing.address,
    area: String(listing.area),
    netArea: listing.netArea !== undefined ? String(listing.netArea) : "",
    roomCount: listing.roomCount ?? "",
    bathroomCount: listing.bathroomCount !== undefined ? String(listing.bathroomCount) : "",
    buildingAge: listing.buildingAge !== undefined ? String(listing.buildingAge) : "",
    floorCurrent: floorCurrent ?? "",
    floorTotal: floorTotal ?? "",
    heating: listing.heating ?? "",
    balconyCount: listing.balconyCount !== undefined ? String(listing.balconyCount) : "",
    isFurnished: fromBool(listing.isFurnished),
    hasParking: fromBool(listing.hasParking),
    inComplex: fromBool(listing.inComplex),
    dues: listing.dues !== undefined ? String(listing.dues) : "",
    facade: listing.facade ?? [],
    titleDeedStatus: listing.titleDeedStatus ?? "",
    loanEligible: fromBool(listing.loanEligible),
    usageStatus: listing.usageStatus ?? "",
    features: listing.features,
  };
}

/** Form state'inden, önizleme bileşenlerinin (ListingFacts vb.) yeniden
 * kullanılabilmesi için geçici, henüz kaydedilmemiş bir `Listing` nesnesi
 * üretir. Yalnızca client tarafında önizleme amaçlıdır. */
export function buildPreviewListing(state: ListingFormState, advisorId: string): Listing {
  const visibility = categoryFieldVisibility[state.category];
  const floor =
    visibility.floor && state.floorCurrent
      ? state.floorTotal
        ? `${state.floorCurrent}/${state.floorTotal}`
        : state.floorCurrent
      : undefined;

  return {
    id: "preview",
    listingNo: "AG-ÖNİZLEME",
    slug: "onizleme",
    title: state.title.trim(),
    description: state.description.trim(),
    status: state.status,
    category: state.category,
    subCategory: state.subCategory,
    price: parseNumberInput(state.price) ?? 0,
    currency: "TRY",
    area: parseNumberInput(state.area) ?? 0,
    netArea: visibility.netArea ? parseNumberInput(state.netArea) : undefined,
    roomCount: visibility.roomCount ? state.roomCount || undefined : undefined,
    floor,
    buildingAge: visibility.buildingAge ? parseNumberInput(state.buildingAge) : undefined,
    bathroomCount: visibility.bathroomCount ? parseNumberInput(state.bathroomCount) : undefined,
    balconyCount: visibility.balconyCount ? parseNumberInput(state.balconyCount) : undefined,
    heating: visibility.heating ? state.heating || undefined : undefined,
    isFurnished: visibility.isFurnished ? toBool(state.isFurnished) : undefined,
    titleDeedStatus: state.titleDeedStatus || undefined,
    loanEligible: toBool(state.loanEligible),
    hasParking: visibility.hasParking ? toBool(state.hasParking) : undefined,
    inComplex: visibility.inComplex ? toBool(state.inComplex) : undefined,
    dues: visibility.dues ? parseNumberInput(state.dues) : undefined,
    facade: state.facade.length > 0 ? state.facade : undefined,
    usageStatus: state.usageStatus || undefined,
    city: state.city.trim(),
    district: state.district.trim(),
    neighborhood: state.neighborhood.trim(),
    address: state.address.trim(),
    photoCount: 0,
    isFeatured: false,
    createdAt: new Date().toISOString().slice(0, 10),
    advisorId,
    regionId: "",
    features: state.features,
    publishStatus: "beklemede",
    viewCount: 0,
  };
}
