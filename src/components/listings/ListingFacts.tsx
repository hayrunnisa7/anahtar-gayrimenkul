import {
  Bath,
  Building,
  Building2,
  Car,
  Compass,
  CreditCard,
  DoorOpen,
  FileCheck2,
  Flame,
  Maximize2,
  Ruler,
  Sofa,
  UserCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { formatArea, formatPrice } from "@/lib/utils/format";
import { USAGE_STATUS_LABELS, type Listing } from "@/types/listing";

interface Fact {
  icon: LucideIcon;
  label: string;
  value: string;
}

function formatFloor(floor?: string) {
  if (!floor) return undefined;
  if (floor === "Zemin") return "Zemin Kat";
  const [current, total] = floor.split("/");
  if (!total) return `${current}. Kat`;
  return `${current}. Kat / ${total} Katlı`;
}

function buildFacts(listing: Listing): Fact[] {
  const facts: (Fact | undefined)[] = [
    { icon: Ruler, label: "Brüt Alan", value: formatArea(listing.area) },
    listing.netArea !== undefined
      ? { icon: Maximize2, label: "Net Alan", value: formatArea(listing.netArea) }
      : undefined,
    listing.buildingAge !== undefined
      ? {
          icon: Building2,
          label: "Bina Yaşı",
          value: listing.buildingAge === 0 ? "Yeni Bina" : `${listing.buildingAge} yıl`,
        }
      : undefined,
    formatFloor(listing.floor) ? { icon: Building, label: "Kat", value: formatFloor(listing.floor)! } : undefined,
    listing.heating ? { icon: Flame, label: "Isıtma", value: listing.heating } : undefined,
    listing.bathroomCount !== undefined
      ? { icon: Bath, label: "Banyo Sayısı", value: `${listing.bathroomCount}` }
      : undefined,
    listing.balconyCount !== undefined
      ? { icon: DoorOpen, label: "Balkon", value: listing.balconyCount > 0 ? `${listing.balconyCount} adet` : "Yok" }
      : undefined,
    listing.isFurnished !== undefined
      ? { icon: Sofa, label: "Eşyalı", value: listing.isFurnished ? "Evet" : "Hayır" }
      : undefined,
    listing.titleDeedStatus
      ? { icon: FileCheck2, label: "Tapu Durumu", value: listing.titleDeedStatus }
      : undefined,
    listing.loanEligible !== undefined
      ? { icon: CreditCard, label: "Krediye Uygunluk", value: listing.loanEligible ? "Uygun" : "Uygun Değil" }
      : undefined,
    listing.hasParking !== undefined
      ? { icon: Car, label: "Otopark", value: listing.hasParking ? "Var" : "Yok" }
      : undefined,
    listing.inComplex !== undefined
      ? { icon: Building, label: "Site İçerisinde", value: listing.inComplex ? "Evet" : "Hayır" }
      : undefined,
    listing.dues !== undefined
      ? { icon: Wallet, label: "Aidat", value: listing.dues > 0 ? `${formatPrice(listing.dues)}/ay` : "Yok" }
      : undefined,
    listing.facade?.length ? { icon: Compass, label: "Cephe", value: listing.facade.join(", ") } : undefined,
    listing.usageStatus
      ? { icon: UserCheck, label: "Kullanım Durumu", value: USAGE_STATUS_LABELS[listing.usageStatus] }
      : undefined,
  ];

  return facts.filter((f): f is Fact => Boolean(f));
}

export function ListingFacts({ listing }: { listing: Listing }) {
  const facts = buildFacts(listing);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex items-start gap-2.5 rounded-xl border border-black/5 bg-white p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <fact.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-foreground/45">{fact.label}</p>
            <p className="text-sm font-medium leading-snug text-brand-950">{fact.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
