import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "cream" | "gold" | "neutral";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-800 text-cream-50",
  cream: "bg-cream-200 text-brand-900",
  gold: "bg-gold-400 text-brand-950",
  neutral: "bg-black/5 text-foreground/70",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
