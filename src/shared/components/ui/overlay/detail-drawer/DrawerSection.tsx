import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

interface DrawerSectionProps {
  readonly title: ReactNode;
                                                                               
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function DrawerSection({ title, action, children, className }: DrawerSectionProps) {
  return (
    <section className={cn("mb-5", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-semibold text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
          {title}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
