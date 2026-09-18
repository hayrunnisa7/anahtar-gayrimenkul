import type { Region } from "@/types/region";

export const mockRegions: Region[] = [
  {
    id: "reg-1",
    slug: "istanbul-kadikoy",
    name: "Kadıköy",
    city: "İstanbul",
    listingCount: 184,
    description: "Sahil hattı, sosyal yaşam ve ulaşım avantajıyla öne çıkan bölge.",
  },
  {
    id: "reg-2",
    slug: "istanbul-besiktas",
    name: "Beşiktaş",
    city: "İstanbul",
    listingCount: 142,
    description: "Boğaz manzaralı konutlar ve merkezi iş alanlarının kesişimi.",
  },
  {
    id: "reg-3",
    slug: "ankara-cankaya",
    name: "Çankaya",
    city: "Ankara",
    listingCount: 97,
    description: "Başkentin köklü ve prestijli yerleşim bölgesi.",
  },
  {
    id: "reg-4",
    slug: "izmir-karsiyaka",
    name: "Karşıyaka",
    city: "İzmir",
    listingCount: 76,
    description: "Deniz kıyısı yaşamı ve ferah caddeleriyle tanınan semt.",
  },
  {
    id: "reg-5",
    slug: "bursa-nilufer",
    name: "Nilüfer",
    city: "Bursa",
    listingCount: 63,
    description: "Yeni gelişen sitelerin ve aile odaklı yaşamın merkezi.",
  },
  {
    id: "reg-6",
    slug: "antalya-konyaalti",
    name: "Konyaaltı",
    city: "Antalya",
    listingCount: 58,
    description: "Tatil ve yatırım amaçlı taleplerin yoğunlaştığı sahil bölgesi.",
  },
];
