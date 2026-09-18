import type { PropertyCategory } from "@/types/listing";

export const subCategoryOptions: Record<PropertyCategory, string[]> = {
  konut: ["Daire", "Müstakil Ev", "Villa", "Rezidans"],
  arsa: ["İmarlı Arsa", "Tarla", "Bağ/Bahçe"],
  isyeri: ["Ofis", "Dükkan", "Depo", "Fabrika"],
};

export const roomCountOptions = ["Stüdyo (1+0)", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1 ve üzeri"];

export const heatingOptions = [
  "Kombi (Doğalgaz)",
  "Merkezi Sistem (VRV)",
  "Yerden Isıtma",
  "Klima",
  "Soba",
  "Yok",
];

export const titleDeedOptions = [
  "Kat Mülkiyetli",
  "Kat İrtifaklı",
  "Hisseli Tapu",
  "Müstakil Tapulu",
  "Arsa Tapulu",
];

export const facadeOptions = ["Kuzey", "Güney", "Doğu", "Batı"];

export const featureOptions = [
  "Asansör",
  "Otopark",
  "Güvenlik",
  "Deniz Manzarası",
  "Yüzme Havuzu",
  "Çocuk Oyun Alanı",
  "Vale Hizmeti",
  "Toplantı Salonu",
  "Barbekü Alanı",
  "Vitrin Cepheli",
  "Yüksek Tavan",
  "Depo Alanı",
  "Jeneratör",
  "Metro'ya Yakın",
  "Yola Cepheli",
];

/** Kategoriye göre hangi alanların formda gösterileceğini belirler. */
export const categoryFieldVisibility: Record<
  PropertyCategory,
  {
    netArea: boolean;
    roomCount: boolean;
    bathroomCount: boolean;
    buildingAge: boolean;
    floor: boolean;
    heating: boolean;
    balconyCount: boolean;
    isFurnished: boolean;
    hasParking: boolean;
    inComplex: boolean;
    dues: boolean;
  }
> = {
  konut: {
    netArea: true,
    roomCount: true,
    bathroomCount: true,
    buildingAge: true,
    floor: true,
    heating: true,
    balconyCount: true,
    isFurnished: true,
    hasParking: true,
    inComplex: true,
    dues: true,
  },
  isyeri: {
    netArea: true,
    roomCount: false,
    bathroomCount: true,
    buildingAge: true,
    floor: true,
    heating: true,
    balconyCount: false,
    isFurnished: false,
    hasParking: true,
    inComplex: true,
    dues: true,
  },
  arsa: {
    netArea: false,
    roomCount: false,
    bathroomCount: false,
    buildingAge: false,
    floor: false,
    heating: false,
    balconyCount: false,
    isFurnished: false,
    hasParking: false,
    inComplex: false,
    dues: false,
  },
};
