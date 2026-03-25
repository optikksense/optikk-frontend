import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-auto', className)}
      {...props}
    />
  ),
);

ScrollArea.displayName = 'ScrollArea';

const ScrollBar = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('hidden', className)}
      {...props}
    />
  ),
);

ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };
