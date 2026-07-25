import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { SpanAttributes } from "@shared/traces/types/detail";
import { AlertCircle } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly spanAttributes: SpanAttributes;
}

function SpanExceptionSectionComponent({ spanAttributes }: Props) {
  const { exceptionType, exceptionMessage, exceptionStacktrace } = spanAttributes;
  if (!exceptionType && !exceptionMessage && !exceptionStacktrace) return null;

  return (
    <DrawerSection title="Exception Details">
      <div className="flex flex-col gap-2 rounded-md border border-error-subtle bg-error-subtle/10 p-3 text-[12px]">
        <div className="flex items-center gap-2 font-mono font-semibold text-[12.5px] text-error">
          <AlertCircle size={14} /> {exceptionType || "Exception"}
        </div>
        {exceptionMessage && (
          <div className="font-mono text-[12px] text-foreground">{exceptionMessage}</div>
        )}
        {exceptionStacktrace && (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded border border-error-subtle bg-background p-2.5 font-mono text-[11px] text-foreground-secondary">
            {exceptionStacktrace}
          </pre>
        )}
      </div>
    </DrawerSection>
  );
}

export const SpanExceptionSection = memo(SpanExceptionSectionComponent);
