import { Building2, Home, LandPlot, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PropertyCategory } from "@/types/listing";

const gradients = [
  "from-brand-700 via-brand-800 to-brand-950",
  "from-brand-600 via-brand-800 to-brand-950",
  "from-brand-800 via-brand-900 to-brand-950",
  "from-brand-500 via-brand-700 to-brand-900",
];

const categoryIcon: Record<PropertyCategory, typeof Home> = {
  konut: Home,
  arsa: LandPlot,
  isyeri: Store,
};

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function PlaceholderImage({
  seed,
  category = "konut",
  icon,
  className,
  iconClassName,
}: {
  seed: string;
  category?: PropertyCategory;
  /** Kategoriye bağlı ikon yerine özel bir ikon kullanmak için (ör. blog kapak görseli). */
  icon?: LucideIcon;
  className?: string;
  iconClassName?: string;
}) {
  const gradient = gradients[hashSeed(seed) % gradients.length];
  const Icon = icon ?? categoryIcon[category] ?? Building2;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
      <Icon className={cn("relative h-10 w-10 text-cream-100/70", iconClassName)} strokeWidth={1.5} />
    </div>
  );
}
