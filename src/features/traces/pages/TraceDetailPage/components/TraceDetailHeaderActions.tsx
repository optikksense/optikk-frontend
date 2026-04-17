import { Button } from "@/components/ui";
import { ArrowLeft, FileText } from "lucide-react";
import { memo } from "react";

interface Props {
  onOpenInLogs: () => void;
  onBack: () => void;
}

function TraceDetailHeaderActionsComponent({ onOpenInLogs, onBack }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" icon={<FileText size={16} />} onClick={onOpenInLogs}>
        Open in log explorer
      </Button>
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
        Back to Traces
      </Button>
    </div>
  );
}

export const TraceDetailHeaderActions = memo(TraceDetailHeaderActionsComponent);
