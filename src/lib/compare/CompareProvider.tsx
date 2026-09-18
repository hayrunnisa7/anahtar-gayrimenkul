"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "anahtar-karsilastirma";
export const MAX_COMPARE = 4;

interface CompareContextValue {
  ids: string[];
  count: number;
  isFull: boolean;
  isSelected: (listingId: string) => boolean;
  toggle: (listingId: string) => void;
  remove: (listingId: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

/**
 * Karşılaştırma listesi, favorilerin aksine hesaba bağlı DEĞİLDİR: giriş
 * gerektirmeden çalışması için yalnızca tarayıcının localStorage'ında
 * tutulur. Bu, çoğu emlak sitesindeki "karşılaştır" davranışıyla tutarlıdır
 * (favoriler kalıcı/hesaba bağlı, karşılaştırma geçici/cihaza bağlı).
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage okuma senkron bir işlem; state güncellemesini bir
    // microtask'a erteleyerek harici bir sistemden (localStorage) veri
    // alıp callback içinde state güncelleyen kabul edilen desene uyuyoruz.
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setIds(JSON.parse(raw));
      } catch {
        /* localStorage kullanılamıyor (gizli sekme vb.) — boş listeyle devam et */
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* yoksay */
    }
  }, [ids, hydrated]);

  const toggle = useCallback((listingId: string) => {
    setIds((prev) => {
      if (prev.includes(listingId)) return prev.filter((id) => id !== listingId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, listingId];
    });
  }, []);

  const remove = useCallback((listingId: string) => {
    setIds((prev) => prev.filter((id) => id !== listingId));
  }, []);

  const clear = useCallback(() => setIds([]), []);
  const isSelected = useCallback((listingId: string) => ids.includes(listingId), [ids]);

  return (
    <CompareContext.Provider
      value={{ ids, count: ids.length, isFull: ids.length >= MAX_COMPARE, isSelected, toggle, remove, clear }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare, CompareProvider içinde kullanılmalıdır.");
  return ctx;
}
