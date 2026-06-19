import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DrawerIconButtonProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly onClick?: () => void;
  readonly accent?: boolean;
}

/** Small square icon button used in drawer headers / footers. */
export function DrawerIconButton({ icon, title, onClick, accent }: DrawerIconButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="inline-grid h-7 w-7 cursor-pointer place-items-center rounded-[6px] border border-[var(--line)] bg-[var(--bg-card)] text-[var(--fg-2)] hover:bg-[var(--bg-inset)] hover:text-[var(--fg-0)]"
      style={accent ? { color: "var(--accent-2)" } : undefined}
    >
      {icon}
    </button>
  );
}

interface DrawerHeaderProps {
  /** Leading slot: badges, title, meta. */
  readonly children: ReactNode;
  /** Trailing action cluster rendered before the close button. */
  readonly actions?: ReactNode;
  readonly onClose: () => void;
}

export function DrawerHeader({ children, actions, onClose }: DrawerHeaderProps) {
  return (
    <div className="flex shrink-0 items-start gap-3 border-[var(--line)] border-b px-[18px] pt-4 pb-3.5">
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 items-center gap-1.5">
        {actions}
        <DrawerIconButton icon={<X size={14} />} title="Close (Esc)" onClick={onClose} />
      </div>
    </div>
  );
}
