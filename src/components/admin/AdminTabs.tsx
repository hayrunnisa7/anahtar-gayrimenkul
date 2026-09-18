import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type AdminTab = "genel-bakis" | "kullanicilar" | "danismanlar" | "paketler";

const tabs: { value: AdminTab; label: string }[] = [
  { value: "genel-bakis", label: "Genel Bakış" },
  { value: "kullanicilar", label: "Kullanıcılar" },
  { value: "danismanlar", label: "Danışmanlar" },
  { value: "paketler", label: "Paketler" },
];

export function AdminTabs({ active }: { active: AdminTab }) {
  return (
    <div
      data-testid="admin-tabs"
      className="mt-8 flex gap-2 overflow-x-auto border-b border-black/5 pb-px"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={tab.value === "genel-bakis" ? "/admin" : `/admin?tab=${tab.value}`}
          className={cn(
            "shrink-0 rounded-t-lg border-b-2 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            active === tab.value
              ? "border-brand-800 text-brand-900"
              : "border-transparent text-foreground/50 hover:text-brand-800",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
