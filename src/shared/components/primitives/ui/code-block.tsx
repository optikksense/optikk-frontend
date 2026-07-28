import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Copies `text` to the clipboard, showing a transient check on success. */
export function CopyButton({ text }: { readonly text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy"
      className="rounded p-1.5 text-foreground-muted transition-colors hover:bg-surface-inset hover:text-foreground-secondary"
    >
      {copied ? <Check size={14} strokeWidth={2} /> : <Copy size={14} strokeWidth={2} />}
    </button>
  );
}

/** Read-only, horizontally scrollable code panel with a copy affordance. */
export function CodeBlock({ code }: { readonly code: string }) {
  return (
    <div className="relative mt-2">
      <pre className="overflow-x-auto rounded-md border border-border bg-surface-inset p-3 font-mono text-[12px] text-foreground leading-[1.6]">
        {code}
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

/** Underline-style tab strip used to switch between related snippets. */
export function SnippetTabs({
  tabs,
  activeTab,
  onSelect,
}: {
  readonly tabs: { readonly id: string; readonly label: string }[];
  readonly activeTab: string;
  readonly onSelect: (id: string) => void;
}) {
  return (
    <div className="mt-4 flex gap-1 border-border border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={
            activeTab === tab.id
              ? "border-primary border-b-2 px-3 py-1.5 font-semibold text-[12.5px] text-foreground"
              : "border-transparent border-b-2 px-3 py-1.5 text-[12.5px] text-foreground-muted hover:text-foreground-secondary"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
