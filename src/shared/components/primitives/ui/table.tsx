import { cn } from "@/lib/utils";

function Table({ className, ref, ...props }: React.ComponentPropsWithRef<"table">) {
  return (
    <table ref={ref} className={cn("w-full caption-bottom text-[12px]", className)} {...props} />
  );
}

function TableHeader({ className, ref, ...props }: React.ComponentPropsWithRef<"thead">) {
  return <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ref, ...props }: React.ComponentPropsWithRef<"tbody">) {
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ref, ...props }: React.ComponentPropsWithRef<"tfoot">) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-[var(--border-color)] border-t bg-[var(--color-primary-subtle-05)] font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ref, ...props }: React.ComponentPropsWithRef<"tr">) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-[var(--border-color)] border-b transition-colors hover:bg-[var(--color-primary-subtle-05)] data-[state=selected]:bg-[var(--color-primary-subtle-08)] [&:nth-child(even)]:bg-[rgba(255,255,255,0.012)]",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ref, ...props }: React.ComponentPropsWithRef<"th">) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-9 px-3 py-2 text-left align-middle font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-[0.06em] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ref, ...props }: React.ComponentPropsWithRef<"td">) {
  return (
    <td
      ref={ref}
      className={cn("px-3 py-2 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ref, ...props }: React.ComponentPropsWithRef<"caption">) {
  return (
    <caption
      ref={ref}
      className={cn("mt-3 text-[12px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
