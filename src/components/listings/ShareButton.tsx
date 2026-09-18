"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // kullanıcı paylaşımı iptal etti, sessizce geç
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // pano erişimi yoksa sessizce geç
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-brand-900 transition-colors hover:bg-brand-50",
        className,
      )}
      aria-label="İlanı paylaş"
    >
      {copied ? <Check className="h-5 w-5 text-brand-700" /> : <Share2 className="h-5 w-5" />}
    </button>
  );
}
