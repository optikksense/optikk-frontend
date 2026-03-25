import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface ModalProps {
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
    <DialogPrimitive.Root open={open} onOpenChange={(v) => { if (!v && closable) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(8,10,16,0.72)] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[12vh] z-50 -translate-x-1/2 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
            className,
          )}
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
          onEscapeKeyDown={(e) => { if (!closable) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (!closable) e.preventDefault(); }}
          onInteractOutside={(e) => { if (!closable) e.preventDefault(); }}
        >
          {title || closable ? (
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
              {title ? (
                <DialogPrimitive.Title className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {title}
                </DialogPrimitive.Title>
              ) : null}
              {closable ? (
                <DialogPrimitive.Close className="ml-auto flex h-7 w-7 items-center justify-center rounded-[var(--card-radius)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
                  <X size={16} />
                </DialogPrimitive.Close>
              ) : null}
            </div>
          ) : null}
          <div className="px-4 py-4">{children}</div>
          {footer !== undefined && footer !== null ? (
            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] px-4 py-3">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Dialog(props: ModalProps) {
  return <Modal {...props} />;
}

function DialogContent({
  children,
}: React.PropsWithChildren<Record<string, never>>) {
  return <>{children}</>;
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-[15px] font-semibold', className)} {...props} />;
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-[12px] text-muted-foreground', className)} {...props} />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)} {...props} />
  );
}

const Sheet = Dialog;
const SheetContent = DialogContent;
const SheetHeader = DialogHeader;
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;
const SheetFooter = DialogFooter;

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Modal,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
};
