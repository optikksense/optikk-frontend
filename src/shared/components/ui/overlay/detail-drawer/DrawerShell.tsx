import type { ReactNode } from "react";

import { SidePanel } from "@shared/components/ui/layout/SidePanel";

interface DrawerShellProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly width?: number | string;
  readonly children: ReactNode;
  /** Optional sticky footer (action bar) pinned below the scroll region. */
  readonly footer?: ReactNode;
}

export function DrawerShell({ open, onClose, width = 560, children, footer }: DrawerShellProps) {
  return (
    <SidePanel
      open={open}
      onClose={onClose}
      mode="modal"
      width={width}
      className="top-0 right-0 bottom-0 left-auto z-[1100] h-full select-text overflow-hidden border-[var(--line)] border-l bg-[var(--bg-canvas)]"
    >
      <div className="flex h-full min-h-0 flex-col bg-[var(--bg-canvas)] text-[var(--fg-1)]">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        {footer ? (
          <div className="flex shrink-0 items-center gap-2 border-[var(--line)] border-t bg-[var(--bg-card)] px-[18px] py-2.5">
            {footer}
          </div>
        ) : null}
      </div>
    </SidePanel>
  );
}
