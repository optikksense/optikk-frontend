import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { dynamicTo } from "@/shared/utils/navigation";

import { Stagger, StaggerItem } from "../motion/Stagger";

interface PricingTier {
  readonly name: string;
  readonly price: ReactNode;
  readonly priceUnit?: string;
  readonly description: ReactNode;
  readonly features: readonly string[];
  readonly cta: { readonly label: string; readonly path: string };
  readonly featured?: boolean;
  readonly badge?: string;
}

interface PricingTableProps {
  readonly tiers: readonly PricingTier[];
}

function CtaButton({
  cta,
  featured,
}: {
  readonly cta: PricingTier["cta"];
  readonly featured?: boolean;
}) {
  const className = `m-btn ${featured ? "m-btn-primary" : "m-btn-secondary"}`;
  if (cta.path.startsWith("http") || cta.path.includes("#")) {
    return (
      <a className={className} href={cta.path}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link to={dynamicTo(cta.path)} className={className}>
      {cta.label}
    </Link>
  );
}

export function PricingTable({ tiers }: PricingTableProps) {
  return (
    <Stagger className="m-price-grid">
      {tiers.map((tier) => (
        <StaggerItem
          key={tier.name}
          as="article"
          className={`m-price-card${tier.featured ? " is-featured" : ""}`}
        >
          {tier.badge ? <span className="m-price-badge">{tier.badge}</span> : null}
          <div>
            <div className="m-price-tier">{tier.name}</div>
            <div className="m-price-amount">
              <strong>{tier.price}</strong>
              {tier.priceUnit ? <span>{tier.priceUnit}</span> : null}
            </div>
            <p className="m-body-sm" style={{ marginTop: 10 }}>
              {tier.description}
            </p>
          </div>
          <ul className="m-price-list">
            {tier.features.map((feature) => (
              <li key={feature}>
                <Check size={16} strokeWidth={2.5} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <CtaButton cta={tier.cta} featured={tier.featured} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
