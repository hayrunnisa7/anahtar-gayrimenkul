import { XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatFullDate } from "@/lib/utils/format";
import type { Subscription } from "@/lib/mock/subscriptions";

export function SubscriptionRow({
  subscription,
  packageName,
  csrfToken,
}: {
  subscription: Subscription;
  packageName: string;
  csrfToken: string;
}) {
  const isActive = subscription.status === "aktif";

  return (
    <div
      data-testid="admin-subscription-row"
      data-subscription-id={subscription.id}
      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{packageName}</Badge>
          <Badge tone={isActive ? "gold" : "neutral"}>{isActive ? "Aktif" : "İptal Edildi"}</Badge>
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-brand-950">{subscription.buyerName}</p>
        <p className="text-xs text-foreground/55">{subscription.buyerEmail}</p>
        <p className="mt-1 text-xs text-foreground/55">
          {formatFullDate(subscription.purchasedAt)} · {formatPrice(subscription.amount)}/ay
        </p>
      </div>

      {isActive && (
        <form method="POST" action="/api/admin/cancel-subscription" className="shrink-0">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="subscriptionId" value={subscription.id} />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <XCircle className="h-3.5 w-3.5" /> Aboneliği İptal Et
          </button>
        </form>
      )}
    </div>
  );
}
