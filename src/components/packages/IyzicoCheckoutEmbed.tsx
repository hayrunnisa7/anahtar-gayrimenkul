"use client";

import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";

/**
 * iyzico'nun `checkoutFormInitialize`'dan dönen `checkoutFormContent` alanı
 * gömülebilir bir `<script>` bloğu — React bunu `dangerouslySetInnerHTML` ile
 * basarsa tarayıcı script'i ÇALIŞTIRMAZ (React/DOM güvenlik kısıtı). Bu yüzden
 * script'i elle oluşturup DOM'a ekliyoruz; bu, iyzico'nun React/SPA
 * entegrasyonları için belgelediği standart yöntemdir.
 */
export function IyzicoCheckoutEmbed({ checkoutFormContent }: { checkoutFormContent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.innerHTML = checkoutFormContent;

    Array.from(wrapper.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        container.appendChild(newScript);
      } else {
        container.appendChild(node);
      }
    });
  }, [checkoutFormContent]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-brand-950">
        <Lock className="h-4 w-4 text-brand-600" /> Ödeme Bilgileri (iyzico Sandbox)
      </div>
      <div id="iyzipay-checkout-form" className="responsive" ref={containerRef} />
      <p className="mt-4 text-center text-[11px] text-foreground/45">
        Bu bir sandbox (test) ödeme ekranıdır — iyzico&apos;nun resmi test kartlarıyla çalışır,
        gerçek para veya gerçek kart bilgisi işlenmez.
      </p>
    </div>
  );
}
