import { AlertTriangle } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";
import { ErrorTrackingContent } from "@shared/errors/ErrorTrackingContent";

export default function ErrorTrackingPage(): JSX.Element {
  return (
    <PageShell>
      <PageHeader
        title="Error tracking"
        subtitle="Grouped error issues across all services, ordered by error count in the selected range. Click a row to inspect occurrences and the latest stack trace."
        icon={<AlertTriangle size={24} />}
      />

      <ErrorTrackingContent />
    </PageShell>
  );
}
