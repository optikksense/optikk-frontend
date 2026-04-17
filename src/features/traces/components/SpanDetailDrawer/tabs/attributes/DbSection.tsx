import { memo } from "react";

import type { SpanAttributes } from "../../../../types";

import { KVRow, Section } from "./Section";

function DbSectionComponent({ attrs }: { attrs: SpanAttributes }) {
  if (!attrs.dbSystem && !attrs.dbName && !attrs.dbStatement) return null;
  return (
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
  );
}

export const DbSection = memo(DbSectionComponent);
