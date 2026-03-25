import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function Popover({ open, onOpenChange, trigger, children, className }: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-50 min-w-[12rem] rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 shadow-lg outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className,
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

const PopoverTrigger = ({
  children,
}: React.PropsWithChildren<Record<string, never>>) => <>{children}</>;

const PopoverContent = ({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) => (
  <div className={className}>{children}</div>
);

export { Popover, PopoverContent, PopoverTrigger };
