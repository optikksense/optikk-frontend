import type { ReactNode } from "react";

interface Props {
  readonly n: number;
  readonly title: string;
  readonly sub: string;
  readonly children: ReactNode;
}

export default function StepShell({ n, title, sub, children }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {n}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
          <div className="text-[11px] text-[var(--text-muted)]">{sub}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
