import { Input } from "@/components/ui";
import { memo, useMemo, useState } from "react";

import type { SpanAttributes } from "../../../../types";

import { Section } from "./Section";
import { VirtualizedAttrTable } from "./VirtualizedAttrTable";

function AllAttributesSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const entries = Object.entries(attrs.attributes ?? {});
    const q = query.toLowerCase();
    if (q === "") return entries as [string, string][];
    return entries.filter(
      ([k, v]) => k.toLowerCase().includes(q) || (v ?? "").toLowerCase().includes(q)
    ) as [string, string][];
  }, [attrs, query]);

  return (
    <Section title="All Attributes">
      <Input
        placeholder="Search attributes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="search"
        className="mb-xs"
      />
      <VirtualizedAttrTable attrs={filtered} />
    </Section>
  );
}

export const AllAttributesSection = memo(AllAttributesSectionComponent);
