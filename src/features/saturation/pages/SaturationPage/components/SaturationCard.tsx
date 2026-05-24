import { type ReactNode, memo } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

function SaturationCardImpl({ title, subtitle, right, children }: Props): JSX.Element {
  return (
    <section className="sat-card">
      <header className="sat-card-h">
        <div className="sat-card-h-l">
          <div className="sat-card-t">{title}</div>
          {subtitle ? <div className="sat-card-s">{subtitle}</div> : null}
        </div>
        {right ? <div className="sat-card-h-r">{right}</div> : null}
      </header>
      <div className="sat-card-b">{children}</div>
    </section>
  );
}

export const SaturationCard = memo(SaturationCardImpl);
