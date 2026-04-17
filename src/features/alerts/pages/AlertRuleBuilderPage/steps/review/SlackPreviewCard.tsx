import { Card } from "@/components/ui";
import type { AlertPreview } from "@/features/alerts/types";

interface Props {
  fallbackTitle?: string;
  notification?: AlertPreview["notification"];
}

export function SlackPreviewCard({ fallbackTitle, notification }: Props) {
  return (
    <Card className="p-4">
      <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
        Slack message preview
      </div>
      <div className="mt-2 font-medium text-[13px] text-[var(--text-primary)]">
        {notification?.title ?? fallbackTitle ?? "Alert preview"}
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
        {notification?.body ?? "Loading preview…"}
      </pre>
    </Card>
  );
}
