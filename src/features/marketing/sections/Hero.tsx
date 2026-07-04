import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";

import { Reveal } from "../motion/Reveal";

interface HeroCta {
  readonly label: string;
  readonly path: string;
  readonly variant?: "primary" | "secondary" | "grad";
}

interface HeroProps {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly primaryCta?: HeroCta;
  readonly secondaryCta?: HeroCta;
  readonly meta?: readonly string[];
  readonly visual?: ReactNode;
}

function btnClassFor(variant: HeroCta["variant"]) {
  switch (variant) {
    case "grad":
      return "m-btn m-btn-grad";
    case "secondary":
      return "m-btn m-btn-secondary";
    default:
      return "m-btn m-btn-primary";
  }
}

function HeroLink({ cta }: { readonly cta: HeroCta }) {
  const className = btnClassFor(cta.variant);
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

export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  meta,
  visual,
}: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotX = useSpring(rx, { stiffness: 80, damping: 14 });
  const rotY = useSpring(ry, { stiffness: 80, damping: 14 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
    const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
    rx.set(dy * -4);
    ry.set(dx * 6);
  }

  function onMouseLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <section className="m-hero">
      <div className="m-container">
        <div className="m-hero-inner">
          {eyebrow ? (
            <Reveal>
              <span className="m-eyebrow">
                <span className="m-eyebrow-dot" />
                {eyebrow}
              </span>
            </Reveal>
          ) : null}
          <Reveal delay={0.05}>
            <h1 className="m-h1 m-hero-title">{title}</h1>
          </Reveal>
          {subtitle ? (
            <Reveal delay={0.12}>
              <p className="m-hero-lede m-lede">{subtitle}</p>
            </Reveal>
          ) : null}
          {(primaryCta ?? secondaryCta) ? (
            <Reveal delay={0.2}>
              <div className="m-hero-ctas">
                {primaryCta ? <HeroLink cta={primaryCta} /> : null}
                {secondaryCta ? <HeroLink cta={secondaryCta} /> : null}
              </div>
            </Reveal>
          ) : null}
          {meta && meta.length > 0 ? (
            <Reveal delay={0.28}>
              <div className="m-hero-meta">
                {meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </Reveal>
          ) : null}
        </div>

        {visual ? (
          <Reveal delay={0.32}>
            <motion.div
              ref={ref}
              className="m-hero-art"
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{
                rotateX: prefersReducedMotion ? 0 : rotX,
                rotateY: prefersReducedMotion ? 0 : rotY,
                transformPerspective: 1400,
              }}
            >
              {visual}
            </motion.div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
