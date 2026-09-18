import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Kayıt Ol | Anahtar Gayrimenkul",
};

export default function KayitPage() {
  return (
    <div className="bg-cream-50 py-16 sm:py-20">
      <Container className="mx-auto max-w-md">
        <div className="rounded-2xl border border-black/5 bg-white p-8">
          <h1 className="font-serif text-2xl font-semibold text-brand-950">Hesap Oluştur</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Birkaç saniyede ücretsiz hesabınızı oluşturun.
          </p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-foreground/60">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="font-medium text-brand-700 hover:text-brand-900">
              Giriş yapın
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
