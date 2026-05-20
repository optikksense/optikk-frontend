import type { ReactNode } from "react";

interface LogoStripProps {
  readonly label?: string;
  readonly items: readonly { readonly name: string; readonly icon?: ReactNode }[];
}

export function LogoStrip({ label, items }: LogoStripProps) {
  const doubled = [...items, ...items];

  return (
    <section className="m-logos m-logos-fade">
      <div className="m-container">
        {label ? <div className="m-logos-label">{label}</div> : null}
      </div>
      <div className="m-logos-track" aria-hidden="true">
        {doubled.map((item, idx) => (
          <span key={`${item.name}-${idx}`} className="m-logos-item">
            {item.icon ? item.icon : null}
            {item.name}
          </span>
        ))}
      </div>
    </section>
  );
}
