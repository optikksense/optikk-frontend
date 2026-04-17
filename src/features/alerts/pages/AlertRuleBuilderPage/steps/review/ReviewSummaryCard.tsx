import { Badge, Card } from "@/components/ui";
import type { AlertPreview, AlertRulePayload } from "@/features/alerts/types";

import { titleForPreset } from "../../constants";

type PreviewEngine = AlertPreview["engine"];

function EngineDetails({ engine }: { engine: PreviewEngine }) {
  return (
    <div className="mt-4 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[12px] text-[var(--text-secondary)]">
      <div>Engine type: {engine.condition_type}</div>
      <div>Operator: {engine.operator}</div>
      <div>Windows: {engine.windows.map((w) => `${w.name}:${w.secs}s`).join(", ")}</div>
      <div>Threshold: {engine.critical_threshold}</div>
      <div>Hold: {engine.for_secs}s</div>
      <div>No data: {engine.no_data_secs}s</div>
    </div>
  );
}

interface Props {
  payload: AlertRulePayload;
  summary?: string;
  engine?: PreviewEngine;
}

export function ReviewSummaryCard({ payload, summary, engine }: Props) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="info">{titleForPreset(payload.preset_kind)}</Badge>
        <Badge variant={payload.enabled ? "success" : "warning"}>
          {payload.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>
      <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">Summary</div>
      <div className="mt-2 text-[14px] text-[var(--text-primary)]">
        {summary ?? "Loading preview…"}
      </div>
      {engine ? <EngineDetails engine={engine} /> : null}
    </Card>
  );
}

export type { PreviewEngine };
