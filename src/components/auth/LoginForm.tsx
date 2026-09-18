"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

const initialState: AuthFormState = {};

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </Button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />

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
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />

      <div className="rounded-xl bg-cream-100 p-3 text-xs text-foreground/60">
        <p className="mb-1 font-medium text-foreground/70">Demo hesaplar</p>
        <p>kullanici@demo.com / demo1234 — Üye</p>
        <p>danisman@demo.com / demo1234 — Danışman</p>
        <p>admin@demo.com / demo1234 — Admin</p>
      </div>
    </form>
  );
}
