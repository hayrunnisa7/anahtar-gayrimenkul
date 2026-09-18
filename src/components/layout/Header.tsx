"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Key, LogOut, Menu, Scale, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/lib/auth/actions";
import { useFavorites } from "@/lib/favorites/FavoritesProvider";
import { useCompare } from "@/lib/compare/CompareProvider";
import type { SessionUser } from "@/lib/auth/session-cookie";

const navLinks = [
  { href: "/ilanlar?durum=satilik", label: "Satılık" },
  { href: "/ilanlar?durum=kiralik", label: "Kiralık" },
  { href: "/danismanlar", label: "Danışmanlar" },
  { href: "/blog", label: "Blog" },
  { href: "/paketler", label: "SaaS Paketleri" },
];

const roleMeta: Record<SessionUser["role"], { label: string; href: string }> = {
  uye: { label: "Hesabım", href: "/hesabim" },
  danisman: { label: "Danışman Paneli", href: "/danisman/panel" },
  admin: { label: "Admin Paneli", href: "/admin" },
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const pathname = usePathname();
  const { count: favoriteCount } = useFavorites();
  const { count: compareCount } = useCompare();

  useEffect(() => {
    let active = true;
    fetch("/api/session")
      .then((res) => res.json())
      .then((data: { session: SessionUser | null }) => {
        if (active) setSession(data.session);
      })
      .catch(() => {
        if (active) setSession(null);
      });
    return () => {
      active = false;
    };
    // Sunucu action'ları sonrası oturum değişebileceği ve Header layout'ta
    // kalıcı olduğu için her rota geçişinde oturumu tazeliyoruz.
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-cream-50/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 text-cream-50">
            <Key className="h-4.5 w-4.5" strokeWidth={2} />
          </span>
          <span className="font-serif text-lg font-semibold text-brand-950 sm:text-xl">
            Anahtar <span className="text-brand-600">Gayrimenkul</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-brand-900/80 transition-colors hover:text-brand-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/karsilastir"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-900/70 transition-colors hover:bg-brand-50 hover:text-brand-900"
            aria-label="İlanları karşılaştır"
          >
            <Scale className="h-5 w-5" />
            {compareCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-800 px-1 text-[10px] font-medium leading-none text-cream-50">
                {compareCount}
              </span>
            )}
          </Link>
          <Link
            href="/favoriler"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-900/70 transition-colors hover:bg-brand-50 hover:text-brand-900"
            aria-label="Favorilerim"
          >
            <Heart className="h-5 w-5" />
            {favoriteCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-800 px-1 text-[10px] font-medium leading-none text-cream-50">
                {favoriteCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-1">
              <LinkButton href={roleMeta[session.role].href} variant="ghost" size="sm">
                {roleMeta[session.role].label}
              </LinkButton>
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Çıkış Yap"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-brand-900/60 transition-colors hover:bg-brand-50 hover:text-brand-900"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <LinkButton href="/giris" variant="ghost" size="sm">
              Giriş Yap
            </LinkButton>
          )}
          <LinkButton href="/danisman/ilan-ver" variant="primary" size="sm">
            İlan Ver
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-brand-900 lg:hidden"
          aria-label="Menüyü aç/kapat"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      <div
        className={cn(
          "overflow-hidden border-t border-black/5 bg-cream-50 transition-[max-height] duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "max-h-[28rem]" : "max-h-0 border-t-0",
        )}
      >
        <Container className="flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-900/80 hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-3 border-t border-black/5 px-3 pt-4">
            <Link href="/favoriler" className="flex items-center gap-1.5 text-sm text-brand-900/70">
              <Heart className="h-4 w-4" /> Favoriler{favoriteCount > 0 ? ` (${favoriteCount})` : ""}
            </Link>
            <Link href="/karsilastir" className="flex items-center gap-1.5 text-sm text-brand-900/70">
              <Scale className="h-4 w-4" /> Karşılaştır{compareCount > 0 ? ` (${compareCount})` : ""}
            </Link>
          </div>
          <div className="mt-3 flex flex-col gap-2 px-3">
            {session ? (
              <>
                <LinkButton href={roleMeta[session.role].href} variant="outline" size="sm">
                  {roleMeta[session.role].label}
                </LinkButton>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-black/10 py-2.5 text-sm font-medium text-brand-900/80 hover:bg-brand-50"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </button>
                </form>
              </>
            ) : (
              <LinkButton href="/giris" variant="outline" size="sm">
                Giriş Yap
              </LinkButton>
            )}
            <LinkButton href="/danisman/ilan-ver" variant="primary" size="sm">
              İlan Ver
            </LinkButton>
          </div>
        </Container>
      </div>
    </header>
  );
}
