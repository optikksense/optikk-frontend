import { Link } from "@tanstack/react-router"

import { Button } from "@/design-system/button"
import { dynamicTo } from "@/shared/utils/navigation"

export interface CtaLinkData {
  readonly label: string
  readonly path: string
}

export function CTALink({
  cta,
  variant = "primary",
}: {
  readonly cta: CtaLinkData
  readonly variant?: "primary" | "secondary"
}) {
  const isExternal = /^https?:/i.test(cta.path)

  if (isExternal) {
    return (
      <a href={cta.path} target="_blank" rel="noreferrer">
        <Button variant={variant}>{cta.label}</Button>
      </a>
    )
  }

  return (
    <Link to={dynamicTo(cta.path)}>
      <Button variant={variant}>{cta.label}</Button>
    </Link>
  )
}
