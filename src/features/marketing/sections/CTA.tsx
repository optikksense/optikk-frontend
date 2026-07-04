import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";


import { Reveal } from "../motion/Reveal";

interface CtaAction {
  readonly label: string;
  readonly path: string;
  readonly variant?: "primary" | "secondary";
}

interface CTAProps {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly primary?: CtaAction;
  readonly secondary?: CtaAction;
}

function CtaLink({ cta }: { readonly cta: CtaAction }) {
  const className = `m-btn ${cta.variant === "secondary" ? "m-btn-secondary" : "m-btn-primary"}`;
  if (cta.path.startsWith("http") || cta.path.includes("#")) {
    return (
      <a className={className} href={cta.path}>
        {cta.label}
        <ArrowRight size={16} />
      </a>
    );
  }
  return (
    <Link to={(cta.path as string & {})} className={className}>
      {cta.label}
      <ArrowRight size={16} />
    </Link>
  );
}

export function CTA({ eyebrow, title, subtitle, primary, secondary }: CTAProps) {
  return (
    <section className="m-section m-section--tight">
      <div className="m-container">
        <Reveal>
          <div className="m-cta">
            {eyebrow ? (
              <span className="m-eyebrow">
                <span className="m-eyebrow-dot" />
                {eyebrow}
              </span>
            ) : null}
            <h2 className="m-h2">{title}</h2>
            {subtitle ? <p className="m-lede">{subtitle}</p> : null}
            {(primary ?? secondary) ? (
              <div className="m-cta-actions">
                {primary ? <CtaLink cta={primary} /> : null}
                {secondary ? <CtaLink cta={secondary} /> : null}
              </div>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
