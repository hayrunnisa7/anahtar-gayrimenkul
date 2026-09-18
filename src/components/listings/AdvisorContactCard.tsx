"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/listings/ContactForm";
import type { Advisor } from "@/types/advisor";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AdvisorContactCard({ advisor, listingTitle }: { advisor: Advisor; listingTitle: string }) {
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Merhaba, "${listingTitle}" ilanı hakkında bilgi almak istiyorum.`,
  );

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <Link href={`/danismanlar/${advisor.slug}`} className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-800 font-serif text-lg font-semibold text-cream-50">
          {initials(advisor.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-brand-950">{advisor.name}</p>
          <p className="truncate text-xs text-foreground/55">{advisor.title}</p>
        </div>
      </Link>

      <div className="mt-4 space-y-2">
        {isPhoneRevealed ? (
          <a
            href={`tel:${advisor.phone.replace(/\s/g, "")}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-800 text-sm font-medium text-cream-50 transition-colors hover:bg-brand-700"
          >
            <Phone className="h-4 w-4" />
            {advisor.phone}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setIsPhoneRevealed(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-800 text-sm font-medium text-cream-50 transition-colors hover:bg-brand-700"
          >
            <Phone className="h-4 w-4" />
            Telefonu Göster
          </button>
        )}

        <a
          href={`https://wa.me/${advisor.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp ile Yaz
        </a>
      </div>

      <div className="mt-5 border-t border-black/5 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground/45">
          İletişim Formu
        </p>
        <ContactForm defaultMessage={`${listingTitle} ilanı hakkında bilgi almak istiyorum.`} />
      </div>
    </div>
  );
}
