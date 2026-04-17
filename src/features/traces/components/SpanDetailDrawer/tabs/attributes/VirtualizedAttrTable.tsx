import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useRef } from "react";

function AttrTableHeader() {
  return (
    <div className="sdd-attr-table__header">
      <span className="sdd-attr-table__col-key">Key</span>
      <span className="sdd-attr-table__col-val">Value</span>
    </div>
  );
}

function AttrRow({ k, v, top, size }: { k: string; v: string; top: number; size: number }) {
  return (
    <div
      className="sdd-attr-table__row"
      style={{ position: "absolute", top, width: "100%", height: size }}
    >
      <span className="sdd-attr-table__col-key font-mono text-xs">{k}</span>
      <span className="sdd-attr-table__col-val break-word font-mono text-xs">{v}</span>
    </div>
  );
}

function VirtualizedAttrTableComponent({ attrs }: { attrs: [string, string][] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: attrs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  if (attrs.length === 0) {
    return (
      <div className="sdd-attr-table">
        <AttrTableHeader />
        <div className="sdd-empty">No matching attributes</div>
      </div>
    );
  }

  return (
    <div className="sdd-attr-table">
      <AttrTableHeader />
      <div
        ref={parentRef}
        className="sdd-attr-table__body"
        style={{ maxHeight: 400, overflow: "auto" }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const [k, v] = attrs[virtualRow.index];
            return (
              <AttrRow key={k} k={k} v={v} top={virtualRow.start} size={virtualRow.size} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const VirtualizedAttrTable = memo(VirtualizedAttrTableComponent);
