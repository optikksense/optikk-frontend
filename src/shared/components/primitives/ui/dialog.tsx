import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  closable?: boolean;
  className?: string;
  width?: number | string;
  children?: React.ReactNode;
  title?: string;
  footer?: React.ReactNode | null;
}

function Modal({
  open,
  onClose,
  closable = true,
  className,
  width = 480,
  children,
  title,
  footer,
}: ModalProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (!v && closable) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <DialogPrimitive.Content
          className={cn(
            "-translate-x-1/2 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 fixed top-[12vh] left-1/2 z-50 rounded-[var(--card-radius)] border border-border bg-secondary shadow-[var(--shadow-lg)] focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
            className
          )}
          style={{ width: typeof width === "number" ? `${width}px` : width }}
          onEscapeKeyDown={(e) => {
            if (!closable) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (!closable) e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (!closable) e.preventDefault();
          }}
        >
          {title || closable ? (
            <div className="flex items-center justify-between border-border border-b px-4 py-3">
              {title ? (
                <DialogPrimitive.Title className="font-semibold text-[15px] text-foreground">
                  {title}
                </DialogPrimitive.Title>
              ) : null}
              {closable ? (
                <DialogPrimitive.Close className="ml-auto flex h-7 w-7 items-center justify-center rounded-[var(--card-radius)] text-foreground-muted transition-colors hover:bg-accent hover:text-foreground">
                  <X size={16} />
                </DialogPrimitive.Close>
              ) : null}
            </div>
          ) : null}
          <div className="px-4 py-4">{children}</div>
          {footer !== undefined && footer !== null ? (
            <div className="flex items-center justify-end gap-2 border-border border-t px-4 py-3">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { Modal };
