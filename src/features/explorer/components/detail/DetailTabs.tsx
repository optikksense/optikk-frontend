import * as Tabs from "@radix-ui/react-tabs";
import { type ReactNode, memo } from "react";

export interface DetailTabDef {
  readonly key: string;
  readonly label: string;
  readonly content: ReactNode;
}

interface Props {
  readonly tabs: readonly DetailTabDef[];
  readonly value: string;
  readonly onChange: (next: string) => void;
}

function DetailTabsComponent({ tabs, value, onChange }: Props) {
  return (
    <Tabs.Root value={value} onValueChange={onChange} className="flex min-h-0 flex-1 flex-col">
      <Tabs.List className="flex shrink-0 items-center gap-2 border-border border-b px-3">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.key}
            value={tab.key}
            className="border-transparent border-b-2 px-1 py-2 font-medium text-[12px] text-foreground-secondary transition-colors data-[state=active]:border-[var(--accent)] data-[state=active]:text-foreground"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content key={tab.key} value={tab.key} className="min-h-0 flex-1 overflow-auto p-3">
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export const DetailTabs = memo(DetailTabsComponent);
