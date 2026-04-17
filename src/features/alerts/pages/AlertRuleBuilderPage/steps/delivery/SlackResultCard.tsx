import { Badge, Card } from "@/components/ui";
import type { AlertSlackTestResult } from "@/features/alerts/types";

interface Props {
  result: AlertSlackTestResult;
}

export function SlackResultCard({ result }: Props) {
  return (
    <Card className="border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={result.delivered ? "success" : "error"}>
          {result.delivered ? "Delivered" : "Failed"}
        </Badge>
        <span className="text-[12px] text-[var(--text-secondary)]">Latest Slack test</span>
      </div>
      <div className="font-medium text-[13px] text-[var(--text-primary)]">
        {result.notification.title}
      </div>
      <pre className="mt-2 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
        {result.notification.body}
      </pre>
    </Card>
  );
}
