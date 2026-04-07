import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

function Command({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive>) {
  return (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)]',
      className
    )}
    {...props}
  />
  );
}

function CommandInput({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.Input>) {
  return (
  <div className="flex items-center gap-[10px] border-b border-border px-4 py-3">
    <Search size={16} className="text-muted-foreground shrink-0" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex-1 text-[15px] text-foreground bg-transparent outline-none border-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
    </div>
  );
}

function CommandList({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.List>) {
  return (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[340px] overflow-y-auto py-2', className)}
    {...props}
  />
  );
}

function CommandEmpty({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.Empty>) {
  return (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('text-center py-6 text-muted-foreground text-[13px]', className)}
    {...props}
  />
  );
}

function CommandGroup({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.Group>) {
  return (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden px-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.5px] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1',
      className
    )}
    {...props}
  />
  );
}

function CommandSeparator({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.Separator>) {
  return (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-[var(--border-color)]', className)}
    {...props}
  />
  );
}

function CommandItem({ className, ref, ...props }: React.ComponentPropsWithRef<typeof CommandPrimitive.Item>) {
  return (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'flex items-center gap-[10px] px-3 py-2 rounded-md cursor-pointer text-[13px] text-foreground transition-colors duration-100 aria-selected:bg-muted hover:bg-muted outline-none',
      className
    )}
    {...props}
  />
  );
}

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-50', className)} {...props} />
  );
}

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
