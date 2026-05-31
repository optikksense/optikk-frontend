import type { CreateMonitorPayload } from "../../api/monitorsApi";

import StepShell from "./StepShell";
import APMQuery from "./queryForms/APMQuery";
import LogQuery from "./queryForms/LogQuery";
import MetricQuery from "./queryForms/MetricQuery";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

function titleForType(t: string): { title: string; sub: string } {
  switch (t) {
    case "metric":
      return {
        title: "Pick the metric",
        sub: "Define what you want to evaluate",
      };
    case "apm":
      return {
        title: "Pick a service & resource",
        sub: "Choose the service and which signal to watch",
      };
    case "log":
      return {
        title: "Define a log query",
        sub: "Match logs with a search query and group them",
      };
    default:
      return { title: "Query", sub: "" };
  }
}

export default function WizardQueryStep({ draft, setDraft }: Props) {
  const { title, sub } = titleForType(draft.type);
  return (
    <StepShell n={2} title={title} sub={sub}>
      {draft.type === "metric" && <MetricQuery draft={draft} setDraft={setDraft} />}
      {draft.type === "apm" && <APMQuery draft={draft} setDraft={setDraft} />}
      {draft.type === "log" && <LogQuery draft={draft} setDraft={setDraft} />}
    </StepShell>
  );
}
