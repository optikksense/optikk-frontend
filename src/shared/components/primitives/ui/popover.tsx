import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

interface PopoverProps {
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
            "z-50 min-w-[12rem] rounded-md border border-border bg-secondary p-2 shadow-lg outline-none",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=open]:animate-in",
            className
          )}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { Popover };
