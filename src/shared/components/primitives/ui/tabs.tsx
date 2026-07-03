import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

interface TabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "large";
  variant?: "page" | "compact";
  items: readonly TabItem[];
  tabBarStyle?: React.CSSProperties;
}

const sizeClasses: Record<NonNullable<TabsProps["size"]>, string> = {
  sm: "text-[12px] px-2.5 py-2",
  md: "text-[13px] px-3.5 py-2.5",
  lg: "text-[14px] px-4 py-2.5",
  large: "text-[14px] px-4 py-2.5",
};

const variantClasses: Record<
  NonNullable<TabsProps["variant"]>,
  {
    list: string;
    item: string;
    active: string;
    inactive: string;
  }
> = {
  page: {
    list: "flex gap-1 overflow-x-auto border-b border-border pb-1",
    item: "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-[var(--card-radius)] border border-transparent font-medium transition-[background-color,border-color,color] focus-visible:outline-none",
    active:
      "bg-[var(--color-primary-subtle-12)] text-foreground border-[color-mix(in_oklch,var(--color-primary),transparent_65%)]",
    inactive: "text-foreground-muted hover:text-foreground",
  },
  compact: {
    list: "flex gap-1 border-b border-border pb-1",
    item: "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--card-radius)] border border-transparent font-medium transition-[background-color,border-color,color] focus-visible:outline-none",
    active:
      "bg-[var(--color-primary-subtle-12)] text-foreground border-[color-mix(in_oklch,var(--color-primary),transparent_65%)]",
    inactive: "text-foreground-muted hover:text-foreground",
  },
};

function Tabs({
  activeKey,
  onChange,
  className,
  size = "md",
  variant = "page",
  items,
  tabBarStyle,
}: TabsProps) {
  const config = variantClasses[variant];

  return (
    <TabsPrimitive.Root value={activeKey} onValueChange={onChange}>
      <TabsPrimitive.List className={cn(config.list, className)} style={tabBarStyle}>
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TabsPrimitive.Trigger
              key={item.key}
              value={item.key}
              className={cn(
                config.item,
                sizeClasses[size],
                isActive ? config.active : config.inactive
              )}
            >
              {item.icon}
              {item.label}
              {isActive ? (
                <span className="absolute right-2 bottom-0 left-2 h-[2px] rounded-full bg-primary" />
              ) : null}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export { Tabs };
