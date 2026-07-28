import type { ReactNode } from "react";

const fieldClass =
  "w-full rounded border border-border bg-surface px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-foreground-muted focus:border-primary";

export function Field({
  label,
  children,
}: { readonly label: string; readonly children: ReactNode }) {
  return (
                                                                                                                       
    <label className="flex flex-col gap-1">
      <span className="font-medium text-[11px] text-foreground-muted uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClass} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} font-mono`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={fieldClass} />;
}
