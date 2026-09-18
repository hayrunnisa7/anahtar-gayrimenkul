import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
  title: "Hesabım | Anahtar Gayrimenkul",
};

export default async function HesabimPage() {
  const session = await getSession();
  if (!session) redirect("/giris?next=/hesabim");
  if (session.role !== "uye") redirect("/erisim-engellendi");

  return (
    <div className="bg-cream-50 py-16 sm:py-20">
      <Container className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-black/5 bg-white p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">Üye Paneli</p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-950">
            Hoş geldiniz, {session.name}
          </h1>
          <p className="mt-1 text-sm text-foreground/55">{session.email}</p>

          <p className="mt-6 text-sm leading-relaxed text-foreground/70">
            Bu sayfa demo amaçlıdır. İlerleyen aşamalarda favori ilanlarınız, kayıtlı aramalarınız ve
            danışmanlarla mesajlaşma geçmişiniz burada yer alacak.
          </p>

          <LogoutButton className="mt-6" />
        </div>
      </Container>
    </div>
  );
}
