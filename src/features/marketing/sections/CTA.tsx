import { CTALink, type CtaLinkData } from "./CTALink"

export interface CtaSection {
  readonly kind: "cta"
  readonly title: string
  readonly body?: string
  readonly primaryCta: CtaLinkData
  readonly secondaryCta?: CtaLinkData
}

export function CTA({ title, body, primaryCta, secondaryCta }: CtaSection) {
  return (
    <section className="marketing-section reveal">
      <div className="marketing-cta-card">
        <h2 className="marketing-h2">{title}</h2>
        {body ? <p className="marketing-body max-w-xl" style={{ marginInline: "auto" }}>{body}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <CTALink cta={primaryCta} variant="primary" />
          {secondaryCta ? <CTALink cta={secondaryCta} variant="secondary" /> : null}
        </div>
      </div>
    </section>
  )
}
