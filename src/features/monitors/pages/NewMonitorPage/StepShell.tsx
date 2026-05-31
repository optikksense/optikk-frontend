import type { ReactNode } from "react";

interface Props {
  readonly n: number;
  readonly title: string;
  readonly sub: string;
  readonly children: ReactNode;
}

export default function StepShell({ n, title, sub, children }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-sm text-white">
          {n}
        </div>
        <div>
          <div className="font-semibold text-foreground text-sm">{title}</div>
          <div className="text-[11px] text-foreground-muted">{sub}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
