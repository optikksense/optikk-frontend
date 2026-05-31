import type { ReactNode } from "react";

interface Props {
  readonly label: string;
  readonly children: ReactNode;
}

export default function FieldRow({ label, children }: Props) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-4 border-border border-b py-2.5 last:border-0">
      <div className="text-foreground-muted text-xs">{label}</div>
      <div>{children}</div>
    </div>
  );
}
