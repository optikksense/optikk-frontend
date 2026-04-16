import { FileText, Share2 } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui";
import { PageHeader } from "@shared/components/ui";

type Props = {
  onCopyShareLink: () => void | Promise<void>;
  onExportViewJson: () => void | Promise<void>;
};

function LogsHubPageHeaderComponent({ onCopyShareLink, onExportViewJson }: Props) {
  return (
    <PageHeader
      title="Logs"
      icon={<FileText size={22} />}
      subtitle="Search, filter, and pivot through dense log streams without leaving the investigative thread."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Share2 size={14} />} onClick={onCopyShareLink}>
            Copy link
          </Button>
          <Button variant="ghost" size="sm" onClick={onExportViewJson}>
            Export JSON
          </Button>
        </div>
      }
    />
  );
}

export const LogsHubPageHeader = memo(LogsHubPageHeaderComponent);
