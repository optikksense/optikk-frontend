import { CTALink, type CtaLinkData } from "./CTALink"

export interface HeroSection {
  readonly kind: "hero"
  readonly eyebrow?: string
  readonly title: string
  readonly body?: string
  readonly primaryCta?: CtaLinkData
  readonly secondaryCta?: CtaLinkData
}

export function Hero({ eyebrow, title, body, primaryCta, secondaryCta }: HeroSection) {
  return (
    <section className="marketing-hero">
      {eyebrow ? <div className="marketing-eyebrow">{eyebrow}</div> : null}
      <h1 className="marketing-h1">{title}</h1>
      {body ? <p className="marketing-lede">{body}</p> : null}
      {(primaryCta || secondaryCta) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {primaryCta ? <CTALink cta={primaryCta} variant="primary" /> : null}
          {secondaryCta ? <CTALink cta={secondaryCta} variant="secondary" /> : null}
        </div>
      )}
    </section>
  )
}
