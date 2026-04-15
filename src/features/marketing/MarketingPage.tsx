import { Button } from "@/design-system/button"
import { Card } from "@/design-system/card"
import content from "@/features/marketing/content.json"

export function MarketingPage({ path }: { readonly path: string }) {
  const page = content.pages.find((entry) => entry.path === path) ?? content.pages[0]

  return (
    <div className="space-y-6">
      <Card className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-accent">{page.eyebrow}</div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">{page.title}</h1>
          <p className="max-w-2xl text-base text-muted">{page.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button>{page.cta}</Button>
            <Button variant="secondary">Book a Demo</Button>
          </div>
        </div>
        <Card className="grid gap-3 bg-panelAlt">
          <div className="text-sm text-muted">Why this rewrite</div>
          <div className="text-sm">
            New product shell, compatibility-safe URLs, virtualized explorers, uPlot charts, and a
            stricter architecture budget from the first commit.
          </div>
        </Card>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Logs and traces stay navigable at high cardinality.",
          "AI workflows become first-class instead of bolted on.",
          "Everything remains URL-shareable and route compatible.",
        ].map((item) => (
          <Card key={item} className="text-sm text-muted">
            {item}
          </Card>
        ))}
      </div>
    </div>
  )
}
