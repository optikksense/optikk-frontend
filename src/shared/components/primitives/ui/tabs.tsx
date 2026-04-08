import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export interface TabsProps {
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg" | "large";
  variant?: "page" | "compact";
  items: TabItem[];
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
    list: "flex gap-1 overflow-x-auto border-b border-[var(--border-color)] pb-1",
    item: "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-[var(--card-radius)] border border-transparent font-medium transition-[background-color,border-color,color] focus-visible:outline-none",
    active:
      "bg-[rgba(124,127,242,0.12)] text-[var(--text-primary)] border-[rgba(124,127,242,0.18)]",
    inactive: "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
  },
  compact: {
    list: "flex gap-1 border-b border-[var(--border-color)] pb-1",
    item: "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--card-radius)] border border-transparent font-medium transition-[background-color,border-color,color] focus-visible:outline-none",
    active:
      "bg-[rgba(124,127,242,0.12)] text-[var(--text-primary)] border-[rgba(124,127,242,0.18)]",
    inactive: "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
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
                <span className="absolute right-2 bottom-0 left-2 h-[2px] rounded-full bg-[var(--color-primary)]" />
              ) : null}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export { Tabs };
