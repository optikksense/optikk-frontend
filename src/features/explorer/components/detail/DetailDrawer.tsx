import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { memo, type ReactNode } from "react";

interface Props {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly widthPx?: number;
}

/**
 * Right-side slide-in drawer. Uses Radix Dialog (portal-based, click-outside
 * dismiss). Full viewport height; width defaults to 600px.
 */
function DetailDrawerComponent({ open, onOpenChange, title, children, widthPx = 600 }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          style={{ width: widthPx }}
          className="fixed right-0 top-0 z-50 flex h-full flex-col border-l border-[var(--border-color)] bg-[var(--bg-primary)] shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
            <Dialog.Title className="min-w-0 truncate text-[13px] font-medium text-[var(--text-primary)]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close detail"
              className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </Dialog.Close>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const DetailDrawer = memo(DetailDrawerComponent);
