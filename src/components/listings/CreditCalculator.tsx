"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";

const termOptions = [12, 24, 36, 60, 84, 120];

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none focus:border-brand-400 focus:bg-white";

export function CreditCalculator({ price = 5_000_000 }: { price?: number }) {
  const [propertyPrice, setPropertyPrice] = useState(price);
  const [downPayment, setDownPayment] = useState(Math.round(price * 0.2));
  const [termMonths, setTermMonths] = useState(120);
  const [monthlyRate, setMonthlyRate] = useState(3.5);

  const result = useMemo(() => {
    const loanAmount = Math.max(propertyPrice - downPayment, 0);
    const rate = monthlyRate / 100;

    if (loanAmount <= 0 || termMonths <= 0) {
      return { loanAmount: 0, monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
    }

    const monthlyPayment =
      rate === 0
        ? loanAmount / termMonths
        : (loanAmount * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);

    const totalPayment = monthlyPayment * termMonths;

    return {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest: totalPayment - loanAmount,
    };
  }, [propertyPrice, downPayment, termMonths, monthlyRate]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Calculator className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-serif text-lg font-semibold text-brand-950">Kredi Hesaplama</p>
          <p className="text-xs text-foreground/50">Demo amaçlıdır, banka koşullarını yansıtmaz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/60">Konut Fiyatı (₺)</span>
          <input
            type="number"
            min={0}
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/60">Peşinat (₺)</span>
          <input
            type="number"
            min={0}
            max={propertyPrice}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/60">Vade (Ay)</span>
          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            className={inputClass}
          >
            {termOptions.map((t) => (
              <option key={t} value={t}>
                {t} ay
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/60">Aylık Faiz Oranı (%)</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={monthlyRate}
            onChange={(e) => setMonthlyRate(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-brand-950 p-5 text-cream-50 sm:grid-cols-3">
        <div>
          <p className="text-xs text-cream-100/60">Aylık Taksit</p>
          <p className="font-serif text-xl font-semibold">{formatPrice(Math.round(result.monthlyPayment))}</p>
        </div>
        <div>
          <p className="text-xs text-cream-100/60">Toplam Geri Ödeme</p>
          <p className="font-serif text-xl font-semibold">{formatPrice(Math.round(result.totalPayment))}</p>
        </div>
        <div>
          <p className="text-xs text-cream-100/60">Toplam Faiz</p>
          <p className="font-serif text-xl font-semibold">{formatPrice(Math.round(result.totalInterest))}</p>
        </div>
      </div>
    </div>
  );
}
