import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

function Command({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        className
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-[10px] border-border border-b px-4 py-3">
      <Search size={16} className="shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex-1 border-none bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[340px] overflow-y-auto py-2", className)}
      {...props}
    />
  );
}

function CommandEmpty({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn("py-6 text-center text-[13px] text-muted-foreground", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.5px]",
        className
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 h-px bg-[var(--border-color)]", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ref,
  ...props
}: React.ComponentPropsWithRef<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center gap-[10px] rounded-md px-3 py-2 text-[13px] text-foreground outline-none transition-colors duration-100 hover:bg-muted aria-selected:bg-muted",
        className
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("ml-auto text-xs tracking-widest opacity-50", className)} {...props} />
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
