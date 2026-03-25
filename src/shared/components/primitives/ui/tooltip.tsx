import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode | string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
}

function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  if (!content) {
    return children;
  }

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={8}
            className={cn(
              'z-50 whitespace-nowrap rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--toast-bg)] px-3 py-2 text-[12px] text-[var(--toast-text)] shadow-[var(--shadow-md)]',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
            )}
            role="tooltip"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip };
