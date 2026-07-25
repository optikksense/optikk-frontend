import { ArrowLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly rootService?: string;
  readonly rootOperation?: string;
  readonly httpMethod?: string;
  readonly httpStatus?: number;
  readonly onBack: () => void;
}

const iconBtn =
  "inline-flex place-items-center h-6 w-6 p-0 rounded border-0 bg-transparent text-foreground-muted cursor-pointer hover:bg-muted hover:text-foreground";
const crumbMute = "text-foreground-caption";
const crumbVal = "font-medium text-foreground";
const badgePill = "inline-flex items-center px-1.5 py-px rounded font-mono text-[10.5px]";

function TraceHeaderBreadcrumbsComponent({
  rootService,
  rootOperation,
  httpMethod,
  httpStatus,
  onBack,
}: Props) {
  const isErr = httpStatus != null && httpStatus >= 400;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-foreground-caption">
      <button type="button" className={iconBtn} onClick={onBack} title="Back" aria-label="Back">
        <ArrowLeft size={13} />
      </button>
      <span className={crumbMute}>Traces</span>
      <ChevronRight size={11} className="text-foreground-caption" />
      <span className={crumbVal}>{rootService || "Trace"}</span>
      {rootOperation && (
        <>
          <ChevronRight size={11} className="text-foreground-caption" />
          <span className="font-mono text-foreground">{rootOperation}</span>
        </>
      )}
      {httpMethod && (
        <span className={`${badgePill} bg-muted font-semibold text-foreground-secondary`}>
          {httpMethod}
        </span>
      )}
      {httpStatus != null && (
        <span
          className={`${badgePill} ${
            isErr ? "bg-error-subtle text-error" : "bg-success-subtle text-success"
          }`}
        >
          {httpStatus}
        </span>
      )}
    </div>
  );
}

export const TraceHeaderBreadcrumbs = memo(TraceHeaderBreadcrumbsComponent);
