import { HeroArt } from "../svg/HeroArt"
import { CTALink, type CtaLinkData } from "./CTALink"

export interface HeroSection {
  readonly kind: "hero"
  readonly eyebrow?: string
  readonly title: string
  readonly body?: string
  readonly primaryCta?: CtaLinkData
  readonly secondaryCta?: CtaLinkData
  /** Disable the decorative hero art (e.g. on dense copy-heavy pages). */
  readonly plain?: boolean
}

export function Hero({ eyebrow, title, body, primaryCta, secondaryCta, plain }: HeroSection) {
  return (
    <section className={plain ? "marketing-hero" : "marketing-hero marketing-hero-with-art"}>
      <div className="marketing-hero-copy">
        {eyebrow ? <div className="marketing-eyebrow">{eyebrow}</div> : null}
        <h1 className="marketing-h1">{title}</h1>
        {body ? <p className="marketing-lede">{body}</p> : null}
        {(primaryCta || secondaryCta) && (
          <div className="marketing-hero-ctas">
            {primaryCta ? <CTALink cta={primaryCta} variant="primary" /> : null}
            {secondaryCta ? <CTALink cta={secondaryCta} variant="secondary" /> : null}
          </div>
        )}
      </div>
      {!plain ? <HeroArt /> : null}
    </section>
  )
}
