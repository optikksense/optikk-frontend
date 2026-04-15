import type { HTMLAttributes } from "react"

import { cn } from "@/platform/utils/cn"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: "default" | "accent" | "success" | "warning" | "danger"
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "default" && "bg-panelAlt text-muted",
        tone === "accent" && "bg-accentSoft text-accent",
        tone === "success" && "bg-emerald-400/15 text-success",
        tone === "warning" && "bg-amber-400/15 text-warning",
        tone === "danger" && "bg-rose-400/15 text-danger",
        className,
      )}
      {...props}
    />
  )
}
