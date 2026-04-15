import type { HTMLAttributes } from "react"

import { cn } from "@/platform/utils/cn"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-panel/90 p-5 shadow-panel backdrop-blur",
        className,
      )}
      {...props}
    />
  )
}
