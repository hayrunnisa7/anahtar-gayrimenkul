"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/format";

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white";

interface FormState {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function validate(state: FormState): Errors {
  const errors: Errors = {};

  if (state.cardName.trim().length < 3) {
    errors.cardName = "Kart üzerindeki ismi girin.";
  }

  const digitsOnly = state.cardNumber.replace(/\s/g, "");
  if (!/^\d{16}$/.test(digitsOnly)) {
    errors.cardNumber = "Kart numarası 16 haneli olmalı.";
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(state.expiry.trim())) {
    errors.expiry = "AA/YY biçiminde girin (örn. 09/28).";
  }

  if (!/^\d{3,4}$/.test(state.cvc.trim())) {
    errors.cvc = "Geçerli bir güvenlik kodu girin.";
  }

  return errors;
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function PaymentForm({
  packageId,
  priceMonthly,
  csrfToken,
}: {
  packageId: string;
  priceMonthly: number;
  csrfToken: string;
}) {
  const [state, setState] = useState<FormState>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const errs = validate(state);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      e.preventDefault();
    }
    // Hata yoksa native form gönderimi devam eder (Post/Redirect/Get).
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      method="POST"
      action="/api/paketler/checkout"
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-6"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="packageId" value={packageId} />

      <div className="flex items-center gap-2 text-sm font-semibold text-brand-950">
        <Lock className="h-4 w-4 text-brand-600" /> Ödeme Bilgileri (Demo)
      </div>

      {hasErrors && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Lütfen aşağıda işaretli alanları düzeltin.
        </div>
      )}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-foreground/65">Kart Üzerindeki İsim</span>
        <input
          name="cardName"
          value={state.cardName}
          onChange={(e) => setField("cardName", e.target.value)}
          placeholder="Ad Soyad"
          className={inputClass}
        />
        {errors.cardName && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.cardName}</p>}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-foreground/65">Kart Numarası</span>
        <input
          type="text"
          inputMode="numeric"
          name="cardNumber"
          value={state.cardNumber}
          onChange={(e) => setField("cardNumber", formatCardNumber(e.target.value))}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className={inputClass}
        />
        {errors.cardNumber && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.cardNumber}</p>}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/65">Son Kullanma (AA/YY)</span>
          <input
            type="text"
            inputMode="numeric"
            name="expiry"
            value={state.expiry}
            onChange={(e) => setField("expiry", e.target.value)}
            placeholder="09/28"
            maxLength={5}
            className={inputClass}
          />
          {errors.expiry && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.expiry}</p>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/65">CVC</span>
          <input
            type="text"
            inputMode="numeric"
            name="cvc"
            value={state.cvc}
            onChange={(e) => setField("cvc", e.target.value)}
            placeholder="123"
            maxLength={4}
            className={inputClass}
          />
          {errors.cvc && <p className="mt-1 text-[11px] font-medium text-red-600">{errors.cvc}</p>}
        </label>
      </div>

      <Button type="submit" className="w-full">
        Ödemeyi Tamamla — {formatPrice(priceMonthly)}/ay
      </Button>

      <p className="text-center text-[11px] text-foreground/45">
        Bu bir demo ödeme ekranıdır. Gerçek bir kart bilgisi işlenmez, iyzico&apos;ya bağlanılmaz.
      </p>
    </form>
  );
}
