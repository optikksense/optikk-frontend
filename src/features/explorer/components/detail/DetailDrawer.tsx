import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode, memo } from "react";

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
          className="fixed top-0 right-0 z-50 flex h-full flex-col border-border border-l bg-background shadow-2xl"
        >
          <header className="flex shrink-0 items-center justify-between border-border border-b px-4 py-3">
            <Dialog.Title className="min-w-0 truncate font-medium text-[13px] text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close detail"
              className="rounded p-1 text-foreground-muted hover:text-foreground"
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
