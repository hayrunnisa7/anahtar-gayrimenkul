import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Giriş Yap | Anahtar Gayrimenkul",
};

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="bg-cream-50 py-16 sm:py-20">
      <Container className="mx-auto max-w-md">
        <div className="rounded-2xl border border-black/5 bg-white p-8">
          <h1 className="font-serif text-2xl font-semibold text-brand-950">Giriş Yap</h1>
          <p className="mt-1 text-sm text-foreground/60">Hesabınıza giriş yaparak devam edin.</p>

          <LoginForm next={next} />

          <p className="mt-6 text-center text-sm text-foreground/60">
            Hesabınız yok mu?{" "}
            <Link href="/kayit" className="font-medium text-brand-700 hover:text-brand-900">
              Kayıt olun
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
