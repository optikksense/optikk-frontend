import type { InputHTMLAttributes } from "react"

import { cn } from "@/platform/utils/cn"

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-panelAlt px-3 py-2 text-sm text-text outline-none transition focus:border-accent",
        className,
      )}
      {...props}
    />
  )
}
