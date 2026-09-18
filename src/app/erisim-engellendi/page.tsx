import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ROLE_LABELS } from "@/types/user";

export const metadata: Metadata = {
  title: "Erişim Engellendi | Anahtar Gayrimenkul",
};

export default async function ErisimEngellendiPage() {
  const session = await getSession();

  return (
    <div className="bg-cream-50 py-20 sm:py-28">
      <Container className="mx-auto max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-950">Erişim Engellendi</h1>
        <p className="mt-2 text-sm text-foreground/60">
          {session
            ? `Bu sayfa "${ROLE_LABELS[session.role]}" rolünüzle görüntülenemez.`
            : "Bu sayfayı görüntülemek için giriş yapmanız gerekiyor."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <LinkButton href="/" variant="primary">
            Ana Sayfaya Dön
          </LinkButton>
          {session && <LogoutButton />}
        </div>
      </Container>
    </div>
  );
}
