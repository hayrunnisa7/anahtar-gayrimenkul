"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "h-10 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white";

export function ContactForm({ defaultMessage }: { defaultMessage: string }) {
  const [isSent, setIsSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Demo modu: gerçek bir servise gönderim yapılmaz, yalnızca yerel geri bildirim gösterilir.
    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-6 text-center">
        <CheckCircle2 className="h-6 w-6 text-brand-700" />
        <p className="text-sm font-medium text-brand-900">Mesajınız alındı (demo)</p>
        <p className="text-xs text-foreground/55">Danışman en kısa sürede sizinle iletişime geçecek.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <input required placeholder="Ad Soyad" className={inputClass} />
      <input required type="tel" placeholder="Telefon" className={inputClass} />
      <input type="email" placeholder="E-posta (opsiyonel)" className={inputClass} />
      <textarea
        required
        rows={3}
        defaultValue={defaultMessage}
        className="w-full resize-none rounded-lg border border-black/10 bg-cream-50 px-3 py-2 text-sm text-brand-950 outline-none focus:border-brand-400 focus:bg-white"
      />
      <Button type="submit" className="w-full">
        Mesaj Gönder
      </Button>
    </form>
  );
}
