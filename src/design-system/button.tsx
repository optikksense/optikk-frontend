import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/platform/utils/cn"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode
  readonly variant?: "primary" | "secondary" | "ghost"
}

export function Button({ children, className, icon, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
        variant === "primary" && "border-accent bg-accent text-slate-950 hover:brightness-110",
        variant === "secondary" && "border-border bg-panelAlt text-text hover:border-accent",
        variant === "ghost" && "border-transparent bg-transparent text-muted hover:text-text",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
