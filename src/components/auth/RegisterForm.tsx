"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const initialState: AuthFormState = {};

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white";

type AccountType = "uye" | "danisman";

const accountTypeOptions: { value: AccountType; title: string; description: string }[] = [
  { value: "uye", title: "Bireysel Kullanıcı", description: "Favori ilanlar, danışmanla iletişim" },
  { value: "danisman", title: "Emlak Danışmanı", description: "İlan ekleme, danışman paneli" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const [accountType, setAccountType] = useState<AccountType>("uye");

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <span className="mb-1.5 block text-xs font-medium text-foreground/60">Hesap Türü</span>
        <div className="grid grid-cols-2 gap-2.5">
          {accountTypeOptions.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "cursor-pointer rounded-xl border p-3 transition-colors",
                accountType === opt.value ? "border-brand-700 bg-brand-50" : "border-black/10 hover:bg-cream-100",
              )}
            >
              <input
                type="radio"
                name="accountType"
                value={opt.value}
                checked={accountType === opt.value}
                onChange={() => setAccountType(opt.value)}
                className="sr-only"
              />
              <span className="block text-sm font-medium text-brand-950">{opt.title}</span>
              <span className="mt-0.5 block text-xs text-foreground/55">{opt.description}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-foreground/60">Ad Soyad</span>
        <input required name="name" autoComplete="name" placeholder="Ad Soyad" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-foreground/60">E-posta</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="ornek@eposta.com"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-foreground/60">Şifre</span>
        <input
          required
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="En az 8 karakter"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-foreground/45">
        Bu bir demo ortamıdır; girdiğiniz bilgiler veritabanına kaydedilir ve şifreniz geri
        döndürülemeyecek şekilde hash&apos;lenir.
      </p>
    </form>
  );
}
