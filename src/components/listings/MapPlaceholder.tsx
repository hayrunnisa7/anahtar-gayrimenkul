import { MapPin } from "lucide-react";

export function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-brand-50">
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(18,53,36,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,53,36,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-800 text-cream-50 shadow-lg">
          <MapPin className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium text-brand-950">{address}</p>
        <p className="text-xs text-foreground/50">Harita önizlemesi (demo) — gerçek harita entegrasyonu ilerleyen aşamada eklenecek</p>
      </div>
    </div>
  );
}
