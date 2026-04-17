import { Input, Skeleton } from "@/components/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useMemo, useRef, useState } from "react";

import type { SpanAttributes } from "../../../types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sdd-section">
      <div className="sdd-section__title">{title}</div>
      {children}
    </div>
  );
}

function KVRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="sdd-kv">
      <span className="sdd-kv__label">{label}</span>
      <span className={`sdd-kv__value ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function VirtualizedAttrTable({ attrs }: { attrs: [string, string][] }) {
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
        <div className="sdd-attr-table__header">
          <span className="sdd-attr-table__col-key">Key</span>
          <span className="sdd-attr-table__col-val">Value</span>
        </div>
        <div className="sdd-empty">No matching attributes</div>
      </div>
    );
  }

  return (
    <div className="sdd-attr-table">
      <div className="sdd-attr-table__header">
        <span className="sdd-attr-table__col-key">Key</span>
        <span className="sdd-attr-table__col-val">Value</span>
      </div>
      <div
        ref={parentRef}
        className="sdd-attr-table__body"
        style={{ maxHeight: 400, overflow: "auto" }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const [k, v] = attrs[virtualRow.index];
            return (
              <div
                key={k}
                className="sdd-attr-table__row"
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  width: "100%",
                  height: virtualRow.size,
                }}
              >
                <span className="sdd-attr-table__col-key font-mono text-xs">{k}</span>
                <span className="sdd-attr-table__col-val break-word font-mono text-xs">{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AttributesTabComponent({
  attrs,
  loading,
}: {
  attrs: SpanAttributes | null;
  loading: boolean;
}) {
  const [attrSearch, setAttrSearch] = useState("");

  const filteredAttrs = useMemo(() => {
    if (!attrs) return [] as [string, string][];
    const entries = Object.entries(attrs.attributes ?? {});
    const q = attrSearch.toLowerCase();
    if (q === "") return entries;
    return entries.filter(
      ([k, v]) => k.toLowerCase().includes(q) || (v ?? "").toLowerCase().includes(q)
    );
  }, [attrs, attrSearch]);

  if (loading)
    return (
      <div className="sdd-center">
        <Skeleton count={4} />
      </div>
    );
  if (!attrs) return <div className="sdd-center sdd-empty">Select a span to view attributes</div>;

  const hasHTTP =
    attrs.attributesString?.["http.method"] ||
    attrs.attributesString?.["http.url"] ||
    attrs.attributesString?.["http.status_code"];
  const hasDB = attrs.dbSystem || attrs.dbName || attrs.dbStatement;
  const hasRPC = attrs.attributesString?.["rpc.system"] || attrs.attributesString?.["rpc.service"];

  return (
    <div>
      <Section title="Core">
        <KVRow label="Span ID" value={attrs.spanId} mono />
        <KVRow label="Trace ID" value={attrs.traceId} mono />
        <KVRow label="Service" value={attrs.serviceName} />
        <KVRow label="Operation" value={attrs.operationName} />
      </Section>

      {attrs.exceptionType && (
        <Section title="Exception">
          <KVRow label="Type" value={attrs.exceptionType} />
          <KVRow label="Message" value={attrs.exceptionMessage} />
          {attrs.exceptionStacktrace && (
            <pre className="sdd-stacktrace sdd-stacktrace--error">{attrs.exceptionStacktrace}</pre>
          )}
        </Section>
      )}

      {hasHTTP && (
        <Section title="HTTP">
          <KVRow label="Method" value={attrs.attributesString?.["http.method"]} />
          <KVRow
            label="URL"
            value={attrs.attributesString?.["http.url"] || attrs.attributesString?.["url.full"]}
            mono
          />
          <KVRow
            label="Status Code"
            value={
              attrs.attributesString?.["http.status_code"] ||
              attrs.attributesString?.["http.response.status_code"]
            }
          />
          <KVRow label="Route" value={attrs.attributesString?.["http.route"]} />
        </Section>
      )}

      {hasDB && (
        <Section title="Database">
          <KVRow label="System" value={attrs.dbSystem} />
          <KVRow label="Database" value={attrs.dbName} />
          <KVRow label="Operation" value={attrs.attributesString?.["db.operation"]} />
          {attrs.dbStatement && (
            <div className="mt-xs">
              <div className="sdd-sublabel">Statement</div>
              <pre className="sdd-codeblock">{attrs.dbStatement}</pre>
            </div>
          )}
          {attrs.dbStatementNormalized && attrs.dbStatementNormalized !== attrs.dbStatement && (
            <div className="mt-xs">
              <div className="sdd-sublabel">Normalized</div>
              <pre className="sdd-codeblock sdd-codeblock--info">{attrs.dbStatementNormalized}</pre>
            </div>
          )}
        </Section>
      )}

      {hasRPC && (
        <Section title="RPC">
          <KVRow label="System" value={attrs.attributesString?.["rpc.system"]} />
          <KVRow label="Service" value={attrs.attributesString?.["rpc.service"]} />
          <KVRow label="Method" value={attrs.attributesString?.["rpc.method"]} />
          <KVRow label="gRPC Status" value={attrs.attributesString?.["rpc.grpc.status_code"]} />
        </Section>
      )}

      {Object.keys(attrs.resourceAttributes ?? {}).length > 0 && (
        <Section title="Resource Attributes">
          {Object.entries(attrs.resourceAttributes).map(([k, v]) => (
            <KVRow key={k} label={k} value={v} mono />
          ))}
        </Section>
      )}

      <Section title="All Attributes">
        <Input
          placeholder="Search attributes..."
          value={attrSearch}
          onChange={(e) => setAttrSearch(e.target.value)}
          variant="search"
          className="mb-xs"
        />
        <VirtualizedAttrTable attrs={filteredAttrs} />
      </Section>
    </div>
  );
}

export const AttributesTab = memo(AttributesTabComponent);
