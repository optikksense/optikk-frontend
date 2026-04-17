import { Link } from "@tanstack/react-router"

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
  const className = `marketing-cta-button marketing-cta-button-${variant}`

  if (isExternal) {
    return (
      <a className={className} href={cta.path} target="_blank" rel="noreferrer">
        {cta.label}
      </a>
    )
  }

  return (
    <Link to={dynamicTo(cta.path)} className={className}>
      {cta.label}
    </Link>
  )
}
