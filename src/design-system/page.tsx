import type { ReactNode } from "react"

import { Card } from "@/design-system/card"

export function PageFrame({
  actions,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  readonly actions?: ReactNode
  readonly children: ReactNode
  readonly eyebrow?: string
  readonly subtitle: string
  readonly title: string
}) {
  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <div className="text-xs uppercase tracking-[0.3em] text-accent">{eyebrow}</div>
          ) : null}
          <div className="text-3xl font-semibold tracking-tight">{title}</div>
          <p className="max-w-3xl text-sm text-muted">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </Card>
      {children}
    </div>
  )
}
