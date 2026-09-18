"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/listings/ContactForm";
import type { Advisor } from "@/types/advisor";

export function AdvisorContactPanel({ advisor }: { advisor: Advisor }) {
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Merhaba ${advisor.name}, hizmetleriniz hakkında bilgi almak istiyorum.`,
  );

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="space-y-2">
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
        <ContactForm
          defaultMessage={`Merhaba ${advisor.name}, hizmetleriniz hakkında bilgi almak istiyorum.`}
        />
      </div>
    </div>
  );
}
