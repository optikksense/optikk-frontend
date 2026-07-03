import { Check, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";

import { SNIPPET_TARGETS, type SnippetTarget, buildSnippet } from "../utils/otlpSnippet";

interface SnippetTabsProps {
  readonly endpoint: string;
  readonly apiKey: string;
}

export function SnippetTabs({ endpoint, apiKey }: SnippetTabsProps) {
  const [target, setTarget] = useState<SnippetTarget>("env");
  const [copied, setCopied] = useState(false);
  const snippet = buildSnippet(target, endpoint, apiKey);

  const copy = () => {
    void navigator.clipboard
      .writeText(snippet)
      .then(() => {
        setCopied(true);
        toast.success("Snippet copied", { duration: 2000 });
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Unable to copy"));
  };

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between border-border border-b bg-surface-inset px-1.5">
        <div className="flex">
          {SNIPPET_TARGETS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTarget(t.id)}
              className={cn(
                "px-3 py-2 font-semibold text-[12px] transition-colors",
                target === t.id
                  ? "border-primary border-b-2 text-foreground"
                  : "text-foreground-muted hover:text-foreground-secondary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[11.5px] text-foreground-muted transition-colors hover:text-foreground"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[12.5px] text-foreground-secondary leading-[1.6]">
        {snippet}
      </pre>
    </div>
  );
}
