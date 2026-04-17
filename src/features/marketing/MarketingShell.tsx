import { useEffect } from "react"

import content from "./content.json"
import {
  CTA,
  CodeBlock,
  FAQ,
  FeatureGrid,
  Hero,
  type MarketingSection,
  Split,
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
    default:
      return null
  }
}

export function MarketingShell({ path }: { readonly path: string }) {
  const page = PAGES.find((entry) => entry.path === path) ?? PAGES[0]

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
    <main className="marketing-main">
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
