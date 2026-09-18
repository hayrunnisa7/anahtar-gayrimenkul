import type { SaasPackage } from "@/types/package";

export const mockPackages: SaasPackage[] = [
  {
    id: "pkg-baslangic",
    name: "Başlangıç",
    priceMonthly: 499,
    description: "Bireysel danışmanlar için temel ilan yönetimi.",
    features: [
      "10 aktif ilan hakkı",
      "Temel ilan istatistikleri",
      "WhatsApp ile hızlı iletişim",
    ],
    listingLimit: 10,
    highlighted: false,
    cta: "Başlangıç ile devam et",
  },
  {
    id: "pkg-profesyonel",
    name: "Profesyonel",
    priceMonthly: 1299,
    description: "Aktif danışmanlar için öne çıkan ilan ve AI arama önceliği.",
    features: [
      "50 aktif ilan hakkı",
      "Öne çıkan ilan gösterimi",
      "AI arama sonuçlarında öncelik",
      "Detaylı performans raporları",
    ],
    listingLimit: 50,
    highlighted: true,
    cta: "Profesyonel'e geç",
  },
  {
    id: "pkg-kurumsal",
    name: "Kurumsal",
    priceMonthly: 3499,
    description: "Ofis ve plazalar için sınırsız ilan ve ekip yönetimi.",
    features: [
      "Sınırsız aktif ilan",
      "Çoklu danışman hesabı",
      "Marka özelinde vitrin sayfası",
      "Öncelikli destek",
    ],
    listingLimit: "sinirsiz",
    highlighted: false,
    cta: "Satış ekibiyle görüş",
  },
];
