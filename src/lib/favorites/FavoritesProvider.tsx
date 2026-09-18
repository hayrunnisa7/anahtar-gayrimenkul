"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface FavoritesContextValue {
  count: number;
  isFavorite: (listingId: string) => boolean;
  toggle: (listingId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function flip(ids: Set<string>, listingId: string): Set<string> {
  const next = new Set(ids);
  if (next.has(listingId)) next.delete(listingId);
  else next.add(listingId);
  return next;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data: { listingIds: string[] }) => {
        if (active) setFavoriteIds(new Set(data.listingIds));
      })
      .catch(() => {
        /* sessizce yoksay — boş favori listesiyle devam edilir */
      });
    return () => {
      active = false;
    };
    // Header'daki oturum tazelemesiyle aynı mantık: her rota geçişinde
    // favori listesini tazele (ör. giriş/çıkış sonrası doğru veriyi göster).
  }, [pathname]);

  const toggle = useCallback(
    (listingId: string) => {
      // Optimistic güncelleme: anında yanıt hissi için önce yerel state'i çevir.
      setFavoriteIds((prev) => flip(prev, listingId));

      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
        .then(async (res) => {
          if (res.status === 401) {
            // Oturum yok: optimistic değişikliği geri al ve girişe yönlendir.
            setFavoriteIds((prev) => flip(prev, listingId));
            router.push(`/giris?next=${encodeURIComponent(pathname)}`);
            return;
          }
          if (!res.ok) throw new Error("İstek başarısız");

          const data: { isFavorite: boolean } = await res.json();
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (data.isFavorite) next.add(listingId);
            else next.delete(listingId);
            return next;
          });
        })
        .catch(() => {
          // Sunucu hatası: optimistic değişikliği geri al.
          setFavoriteIds((prev) => flip(prev, listingId));
        });
    },
    [pathname, router],
  );

  const isFavorite = useCallback((listingId: string) => favoriteIds.has(listingId), [favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ count: favoriteIds.size, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites, FavoritesProvider içinde kullanılmalıdır.");
  return ctx;
}
