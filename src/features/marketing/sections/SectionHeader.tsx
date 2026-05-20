import type { ReactNode } from "react";

import { Reveal } from "../motion/Reveal";

interface SectionHeaderProps {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  readonly align?: "left" | "center";
  readonly className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <Reveal>
      <div
        className={["m-section-head", align === "center" ? "is-center" : "", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {eyebrow ? (
          <span className="m-eyebrow">
            <span className="m-eyebrow-dot" />
            {eyebrow}
          </span>
        ) : null}
        <h2 className="m-h2">{title}</h2>
        {lede ? <p className="m-lede">{lede}</p> : null}
      </div>
    </Reveal>
  );
}
