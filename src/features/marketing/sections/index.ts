import type { ChangelogTeaserSection } from "./ChangelogTeaser"
import type { ComparisonTableSection } from "./ComparisonTable"
import type { CtaSection } from "./CTA"
import type { CodeBlockSection } from "./CodeBlock"
import type { FaqSection } from "./FAQ"
import type { FeatureGridSection } from "./FeatureGrid"
import type { HeroSection } from "./Hero"
import type { IntegrationsGridSection } from "./IntegrationsGrid"
import type { InteractiveDemoSection } from "./InteractiveDemo"
import type { LogoStripSection } from "./LogoStrip"
import type { MetricsStripSection } from "./MetricsStrip"
import type { PricingTableSection } from "./PricingTable"
import type { ProductDemoSection } from "./ProductDemo"
import type { SplitSection } from "./Split"
import type { TestimonialSection } from "./Testimonial"

export { CTA } from "./CTA"
export { ChangelogTeaser } from "./ChangelogTeaser"
export { CodeBlock } from "./CodeBlock"
export { ComparisonTable } from "./ComparisonTable"
export { FAQ } from "./FAQ"
export { FeatureGrid } from "./FeatureGrid"
export { Hero } from "./Hero"
export { IntegrationsGrid } from "./IntegrationsGrid"
export { InteractiveDemo } from "./InteractiveDemo"
export { LogoStrip } from "./LogoStrip"
export { MetricsStrip } from "./MetricsStrip"
export { PricingTable } from "./PricingTable"
export { ProductDemo } from "./ProductDemo"
export { Split } from "./Split"
export { Testimonial } from "./Testimonial"

export type MarketingSection =
  | HeroSection
  | FeatureGridSection
  | SplitSection
  | CtaSection
  | FaqSection
  | CodeBlockSection
  | MetricsStripSection
  | ProductDemoSection
  | ComparisonTableSection
  | TestimonialSection
  | LogoStripSection
  | IntegrationsGridSection
  | PricingTableSection
  | ChangelogTeaserSection
  | InteractiveDemoSection
