import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const fieldInputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-cream-50 px-3 text-sm text-brand-950 outline-none transition-colors placeholder:text-foreground/40 focus:border-brand-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50";

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-1 text-xs font-medium text-foreground/65">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-foreground/45">{hint}</p>}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-lg font-semibold text-brand-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-foreground/55">{description}</p>}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ChipCheckbox({
  label,
  name,
  value,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        checked
          ? "border-brand-800 bg-brand-800 text-cream-50 shadow-sm"
          : "border-black/10 text-foreground/60 hover:border-brand-300 hover:bg-cream-100",
      )}
    >
      <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </label>
  );
}

export function ToggleField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: "evet" | "hayir" | "";
  onChange: (value: "evet" | "hayir") => void;
}) {
  return (
    <FormField label={label}>
      <div className="flex gap-2">
        {(["evet", "hayir"] as const).map((opt) => (
          <label
            key={opt}
            className={cn(
              "flex h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold transition-colors",
              value === opt
                ? "border-brand-800 bg-brand-800 text-cream-50 shadow-sm"
                : "border-black/10 text-foreground/55 hover:border-brand-300 hover:bg-cream-100",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {value === opt &&
              (opt === "evet" ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : (
                <X className="h-4 w-4" strokeWidth={3} />
              ))}
            {opt === "evet" ? "Evet" : "Hayır"}
          </label>
        ))}
      </div>
    </FormField>
  );
}
