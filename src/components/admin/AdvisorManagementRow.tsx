import { Mail, Phone, ShieldBan, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Advisor } from "@/types/advisor";
import type { MockUser } from "@/lib/mock/users";

export function AdvisorManagementRow({
  advisor,
  account,
  stats,
  csrfToken,
}: {
  advisor: Advisor;
  account?: MockUser;
  stats: { total: number; active: number; pending: number };
  csrfToken: string;
}) {
  const isBlocked = Boolean(account?.isBlocked);

  return (
    <div
      data-testid="admin-advisor-row"
      data-advisor-slug={advisor.slug}
      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{advisor.title}</Badge>
          <Badge tone="cream">{advisor.regions.join(", ")}</Badge>
          {account ? (
            isBlocked && <Badge tone="neutral">Askıya Alındı</Badge>
          ) : (
            <Badge tone="neutral">Hesap Yok (yalnızca dizin)</Badge>
          )}
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-brand-950">{advisor.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/55">
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {advisor.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> {advisor.phone}
          </span>
        </p>
        <p className="mt-1.5 text-xs text-foreground/55">
          {stats.total} ilan · {stats.active} aktif · {stats.pending} beklemede
        </p>
      </div>

      {account && (
        <form method="POST" action="/api/admin/toggle-user-block" className="shrink-0">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="userId" value={account.id} />
          <input type="hidden" name="nextBlocked" value={isBlocked ? "0" : "1"} />
          <button
            type="submit"
            className={
              isBlocked
                ? "flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-900 transition-colors hover:bg-brand-100"
                : "flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
            }
          >
            {isBlocked ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> Askıyı Kaldır
              </>
            ) : (
              <>
                <ShieldBan className="h-3.5 w-3.5" /> Hesabı Askıya Al
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
