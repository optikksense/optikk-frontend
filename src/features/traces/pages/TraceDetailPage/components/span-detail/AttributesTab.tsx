import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { AttributesTable } from "./AttributesTable";

interface Props {
  readonly spanAttributes: SpanAttributes | null;
  readonly onAddFilter?: (key: string, value: string) => void;
}

/** Full span + resource attribute list (the design's "Attributes" drawer tab). */
function AttributesTabComponent({ spanAttributes, onAddFilter }: Props) {
  return (
    <div className="p-4">
      <AttributesTable
        spanAttributes={spanAttributes?.attributesString ?? {}}
        resourceAttributes={spanAttributes?.resourceAttributes ?? {}}
        onAddFilter={onAddFilter}
      />
    </div>
  );
}

export const AttributesTab = memo(AttributesTabComponent);
