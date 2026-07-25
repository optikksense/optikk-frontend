import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { SpanAttributes } from "@shared/traces/types/detail";
import { Database } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly spanAttributes: SpanAttributes;
}

function SpanDatabaseSectionComponent({ spanAttributes }: Props) {
  const { dbSystem, dbName, dbStatement, dbStatementNormalized } = spanAttributes;
  if (!dbSystem && !dbName && !dbStatement) return null;

  const query = dbStatementNormalized || dbStatement;

  return (
    <DrawerSection title="Database Query">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-secondary p-3.5 text-[12px]">
        <div className="flex items-center gap-2 font-mono text-[11.5px] text-foreground-muted">
          <Database size={13} /> {dbSystem || "db"} {dbName ? `· ${dbName}` : ""}
        </div>
        {query && (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded border border-border bg-background p-2.5 font-mono text-[11px] text-foreground">
            {query}
          </pre>
        )}
      </div>
    </DrawerSection>
  );
}

export const SpanDatabaseSection = memo(SpanDatabaseSectionComponent);
