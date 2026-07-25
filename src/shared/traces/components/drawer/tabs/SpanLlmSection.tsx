import { DrawerSection } from "@shared/components/ui/overlay/detail-drawer";
import type { SpanAttributes } from "@shared/traces/types/detail";
import { formatNumber } from "@shared/utils/formatters";
import { Bot, Coins, Cpu, MessageSquare } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly spanAttributes: SpanAttributes;
}

function CodeBlock({ content }: { readonly content?: string | null }) {
  if (!content) return <div className="text-[12px] text-foreground-muted italic">—</div>;
  return (
    <pre className="max-h-60 min-h-12 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-secondary p-3 font-mono text-[11.5px] text-foreground-secondary leading-relaxed">
      {content}
    </pre>
  );
}

function SpanLlmSectionComponent({ spanAttributes }: Props) {
  const {
    llmPrompt,
    llmCompletion,
    llmVendor,
    llmModel,
    llmInputTokens,
    llmOutputTokens,
    llmCost,
    llmScores,
  } = spanAttributes;

  const hasLlmData =
    !!llmPrompt ||
    !!llmCompletion ||
    !!llmVendor ||
    !!llmModel ||
    llmInputTokens != null ||
    llmOutputTokens != null ||
    llmCost != null ||
    (llmScores?.length ?? 0) > 0;

  if (!hasLlmData) return null;

  return (
    <DrawerSection title="LLM Execution Details">
      <div className="flex flex-col gap-3.5 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="grid grid-cols-2 gap-3 text-[12px] sm:grid-cols-4">
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground-caption uppercase">
              <Bot size={12} /> Vendor
            </span>
            <span className="font-medium text-foreground">{llmVendor || "—"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground-caption uppercase">
              <Cpu size={12} /> Model
            </span>
            <span className="font-medium font-mono text-foreground">{llmModel || "—"}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground-caption uppercase">
              <MessageSquare size={12} /> Tokens
            </span>
            <span className="font-mono text-foreground">
              {formatNumber(llmInputTokens ?? 0)} in / {formatNumber(llmOutputTokens ?? 0)} out
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground-caption uppercase">
              <Coins size={12} /> Est. Cost
            </span>
            <span className="font-mono font-semibold text-foreground">
              {llmCost != null ? `$${llmCost.toFixed(4)}` : "—"}
            </span>
          </div>
        </div>

        {llmPrompt && (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-[11.5px] text-foreground-caption uppercase tracking-wider">
              Input Prompt
            </span>
            <CodeBlock content={llmPrompt} />
          </div>
        )}

        {llmCompletion && (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-[11.5px] text-foreground-caption uppercase tracking-wider">
              Output Completion
            </span>
            <CodeBlock content={llmCompletion} />
          </div>
        )}

        {llmScores && llmScores.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-[11.5px] text-foreground-caption uppercase tracking-wider">
              Evaluation Scores
            </span>
            <div className="flex flex-wrap gap-1.5">
              {llmScores.map((s) => (
                <span
                  key={`${s.name}-${s.source}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-foreground"
                >
                  <span className="text-foreground-caption">{s.name}:</span>
                  <span className="font-semibold">{s.stringValue || s.value.toFixed(2)}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DrawerSection>
  );
}

export const SpanLlmSection = memo(SpanLlmSectionComponent);
