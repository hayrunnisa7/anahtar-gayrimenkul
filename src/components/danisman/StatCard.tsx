import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 sm:p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
      </span>
      <p className="mt-3 font-serif text-2xl font-semibold text-brand-950">{value}</p>
      <p className="text-xs text-foreground/55">{label}</p>
    </div>
  );
}
