import { ShieldBan, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS } from "@/types/user";
import type { MockUser } from "@/lib/mock/users";

const roleTone = {
  uye: "cream",
  danisman: "brand",
  admin: "gold",
} as const;

export function UserRow({ user, csrfToken }: { user: MockUser; csrfToken: string }) {
  const isBlocked = Boolean(user.isBlocked);

  return (
    <div
      data-testid="admin-user-row"
      data-user-email={user.email}
      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
    >

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={roleTone[user.role]}>{ROLE_LABELS[user.role]}</Badge>
          {isBlocked && <Badge tone="neutral">Askıya Alındı</Badge>}
        </div>
        <p className="mt-1.5 truncate text-sm font-medium text-brand-950">{user.name}</p>
        <p className="text-xs text-foreground/55">{user.email}</p>
      </div>

      {user.role === "admin" ? (
        <span className="text-xs text-foreground/40">Yönetici hesapları askıya alınamaz</span>
      ) : (
        <form method="POST" action="/api/admin/toggle-user-block" className="shrink-0">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="nextBlocked" value={isBlocked ? "0" : "1"} />
          <button
            type="submit"
            className={cnButton(isBlocked)}
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

function cnButton(isBlocked: boolean) {
  return isBlocked
    ? "flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-900 transition-colors hover:bg-brand-100"
    : "flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100";
}
