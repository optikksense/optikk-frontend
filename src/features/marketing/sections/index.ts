import type { CtaSection } from "./CTA"
import type { CodeBlockSection } from "./CodeBlock"
import type { FaqSection } from "./FAQ"
import type { FeatureGridSection } from "./FeatureGrid"
import type { HeroSection } from "./Hero"
import type { MetricsStripSection } from "./MetricsStrip"
import type { SplitSection } from "./Split"

export { CTA } from "./CTA"
export { CodeBlock } from "./CodeBlock"
export { FAQ } from "./FAQ"
export { FeatureGrid } from "./FeatureGrid"
export { Hero } from "./Hero"
export { MetricsStrip } from "./MetricsStrip"
export { Split } from "./Split"

export type MarketingSection =
  | HeroSection
  | FeatureGridSection
  | SplitSection
  | CtaSection
  | FaqSection
  | CodeBlockSection
  | MetricsStripSection
