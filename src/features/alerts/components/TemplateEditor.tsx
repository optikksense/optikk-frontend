// Handlebars-ish notification template editor with a very small live preview.
// The real rendering happens server-side; the preview here is a best-effort
// substitution of well-known placeholders against a sample context so users
// can eyeball the output.

import { useMemo } from "react";

interface TemplateEditorProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly sampleContext?: Record<string, unknown>;
}

const DEFAULT_SAMPLE: Record<string, unknown> = {
  "rule.name": "API error rate",
  "rule.severity": "p2",
  "instance.service.name": "checkout-service",
  "instance.env": "prod",
  "values.short": 0.14,
  "values.long": 0.08,
  "threshold.critical": 0.1,
  "deploy.summary": "Deploy #482 shipped 4m before fire",
};

function renderPreview(tpl: string, ctx: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const v = ctx[key];
    if (v == null) return `{{${key}}}`;
    return String(v);
  });
}

export function TemplateEditor({ value, onChange, sampleContext }: TemplateEditorProps) {
  const ctx = sampleContext ?? DEFAULT_SAMPLE;
  const preview = useMemo(() => renderPreview(value, ctx), [value, ctx]);
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="alert-template-editor"
          className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]"
        >
          Template (Handlebars)
        </label>
        <textarea
          id="alert-template-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="w-full resize-y rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 font-mono text-[12px] text-[var(--text-primary)]"
          placeholder={"[{{rule.severity}}] {{rule.name}} on {{instance.service.name}}\nshort={{values.short}} long={{values.long}} threshold={{threshold.critical}}"}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Preview
        </span>
        <pre className="h-full min-h-[200px] whitespace-pre-wrap rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-2 font-mono text-[12px] text-[var(--text-primary)]">
          {preview || "(empty)"}
        </pre>
      </div>
    </div>
  );
}
