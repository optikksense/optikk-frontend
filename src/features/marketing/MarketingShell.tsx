import { useEffect } from "react"

import { useScrollReveal } from "./hooks/useScrollReveal"
import content from "./content.json"
import {
  CTA,
  ChangelogTeaser,
  CodeBlock,
  ComparisonTable,
  FAQ,
  FeatureGrid,
  Hero,
  IntegrationsGrid,
  InteractiveDemo,
  LogoStrip,
  type MarketingSection,
  MetricsStrip,
  PricingTable,
  ProductDemo,
  Split,
  Testimonial,
} from "./sections"

interface MarketingPageEntry {
  readonly path: string
  readonly title: string
  readonly description?: string
  readonly sections?: ReadonlyArray<MarketingSection>
}

const PAGES = content.pages as ReadonlyArray<MarketingPageEntry>

function renderSection(section: MarketingSection, index: number) {
  const key = `${section.kind}-${index}`
  switch (section.kind) {
    case "hero":
      return <Hero key={key} {...section} />
    case "feature-grid":
      return <FeatureGrid key={key} {...section} />
    case "split":
      return <Split key={key} {...section} />
    case "cta":
      return <CTA key={key} {...section} />
    case "faq":
      return <FAQ key={key} {...section} />
    case "code-block":
      return <CodeBlock key={key} {...section} />
    case "metrics-strip":
      return <MetricsStrip key={key} {...section} />
    case "product-demo":
      return <ProductDemo key={key} {...section} />
    case "comparison":
      return <ComparisonTable key={key} {...section} />
    case "testimonial":
      return <Testimonial key={key} {...section} />
    case "logo-strip":
      return <LogoStrip key={key} {...section} />
    case "integrations":
      return <IntegrationsGrid key={key} {...section} />
    case "pricing":
      return <PricingTable key={key} {...section} />
    case "changelog":
      return <ChangelogTeaser key={key} {...section} />
    case "interactive-demo":
      return <InteractiveDemo key={key} {...section} />
    default:
      return null
  }
}

export function MarketingShell({ path }: { readonly path: string }) {
  const page = PAGES.find((entry) => entry.path === path) ?? PAGES[0]
  const containerRef = useScrollReveal()

  useEffect(() => {
    if (!page) return
    document.title = `${page.title} — Optikk`
    if (page.description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (!meta) {
        meta = document.createElement("meta")
        meta.name = "description"
        document.head.appendChild(meta)
      }
      meta.content = page.description
    }
  }, [page])

  if (!page) return null

  return (
    <main className="marketing-main" ref={containerRef}>
      {page.sections && page.sections.length > 0
        ? page.sections.map(renderSection)
        : (
          <section className="marketing-hero">
            <h1 className="marketing-h1">{page.title}</h1>
            {page.description ? <p className="marketing-lede">{page.description}</p> : null}
          </section>
        )}
    </main>
  )
}
