import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ComponentType, ReactNode } from "react";


import { Stagger, StaggerItem } from "../motion/Stagger";

interface FeatureItem {
  readonly icon?: ComponentType<{ size?: number }>;
  readonly title: ReactNode;
  readonly body: ReactNode;
  readonly link?: { readonly label: string; readonly path: string };
  readonly variant?: "wide" | "tall" | "grad" | "ink";
}

interface FeatureGridProps {
  readonly items: readonly FeatureItem[];
}

function variantClass(variant?: FeatureItem["variant"]) {
  switch (variant) {
    case "wide":
      return "is-wide";
    case "tall":
      return "is-tall";
    case "grad":
      return "is-grad";
    case "ink":
      return "is-ink";
    default:
      return "";
  }
}

function FeatureLink({ link }: { readonly link: FeatureItem["link"] }) {
  if (!link) return null;
  if (link.path.startsWith("http") || link.path.includes("#")) {
    return (
      <a className="m-bento-link" href={link.path}>
        {link.label} <ArrowRight size={14} />
      </a>
    );
  }
  return (
    <Link className="m-bento-link" to={(link.path as string & {})}>
      {link.label} <ArrowRight size={14} />
    </Link>
  );
}

export function FeatureGrid({ items }: FeatureGridProps) {
  return (
    <Stagger className="m-bento">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <StaggerItem
            key={idx}
            as="article"
            className={`m-bento-card ${variantClass(item.variant)}`}
          >
            {Icon ? (
              <span className="m-bento-icon">
                <Icon size={20} />
              </span>
            ) : null}
            <h3 className="m-h3">{item.title}</h3>
            <p className="m-body">{item.body}</p>
            <FeatureLink link={item.link} />
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
