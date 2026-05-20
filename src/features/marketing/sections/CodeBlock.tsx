import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface CodeTab {
  readonly label: string;
  readonly language?: string;
  readonly content: string;
  readonly render?: ReactNode;
}

interface CodeBlockProps {
  readonly tabs: readonly CodeTab[];
  readonly defaultTab?: number;
}

export function CodeBlock({ tabs, defaultTab = 0 }: CodeBlockProps) {
  const [active, setActive] = useState(defaultTab);
  const [copied, setCopied] = useState(false);
  const current = tabs[active];

  async function onCopy() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(current.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  if (!current) return null;

  return (
    <div className="m-code">
      <div className="m-code-tabs">
        {tabs.map((tab, idx) => (
          <button
            type="button"
            key={tab.label}
            className={`m-code-tab${idx === active ? " is-active" : ""}`}
            onClick={() => setActive(idx)}
          >
            {tab.label}
          </button>
        ))}
        <button type="button" className="m-code-copy" onClick={onCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="m-code-body">
        <code>{current.render ?? current.content}</code>
      </pre>
    </div>
  );
}
