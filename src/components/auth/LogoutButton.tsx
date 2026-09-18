import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-brand-900 transition-colors hover:bg-brand-50",
          className,
        )}
      >
        <LogOut className="h-4 w-4" /> Çıkış Yap
      </button>
    </form>
  );
}
