"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const examplePrompts = [
  "Kadıköy'de deniz manzaralı 3+1 satılık daire",
  "Bütçem 30.000 TL, Nilüfer'de kiralık daire arıyorum",
  "Yatırım için imarlı arsa arıyorum",
  "Beşiktaş'ta eşyalı kiralık ofis",
];

export function AISearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function runSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    startTransition(() => {
      router.push(`/ai-arama?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn. Kadıköy'de deniz manzaralı, 3 odalı bir ev arıyorum"
          className="h-12 flex-1 rounded-xl border border-cream-50/15 bg-cream-50/10 px-4 text-sm text-cream-50 outline-none placeholder:text-cream-100/40 focus:border-gold-400"
        />
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          disabled={isPending || query.trim().length === 0}
        >
          <Sparkles className="h-4 w-4" />
          {isPending ? "Aranıyor..." : "AI ile Ara"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => runSearch(prompt)}
            className="rounded-full border border-cream-50/15 px-3 py-1.5 text-xs text-cream-100/70 transition-colors hover:border-gold-400/50 hover:text-cream-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
