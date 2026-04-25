import { Check, Copy, ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";

import type { SpanAttributes } from "../../../types";
import { buildCodeRepoLink } from "../../../utils/codeRepoLink";
import { buildCurl } from "../../../utils/curl";

import { KVRow, Section } from "./attributes/Section";

/** Code origin + curl reproduction. Mirrors Datadog's Code tab. */
export function CodeTab({ attrs }: { attrs: SpanAttributes | null }) {
  if (!attrs) return <EmptyState msg="Select a span to see code info." />;
  const a = attrs.attributesString ?? {};
  const filepath = a["code.filepath"];
  const func = a["code.function"];
  const lineno = a["code.lineno"];
  const ns = a["code.namespace"];
  const curl = buildCurl(a);
  const repoLink = buildCodeRepoLink(a);
  const hasAny = filepath || func || curl;
  if (!hasAny) return <EmptyState msg="No code or HTTP attributes on this span." />;
  return (
    <div>
      {filepath || func ? (
        <Section title="Origin">
          <KVRow label="File" value={filepath} mono />
          <KVRow label="Function" value={func} mono />
          <KVRow label="Line" value={lineno} mono />
          <KVRow label="Namespace" value={ns} mono />
          {repoLink ? <RepoLink href={repoLink} /> : null}
        </Section>
      ) : null}
      {curl ? <CurlBlock curl={curl} /> : null}
    </div>
  );
}

function RepoLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
    >
      <ExternalLink size={12} /> Open in repo
    </a>
  );
}

function CurlBlock({ curl }: { curl: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [curl]);
  return (
    <Section title="Reproduce">
      <div className="flex items-start gap-2">
        <pre className="flex-1 overflow-x-auto rounded bg-[var(--bg-secondary)] p-3 font-mono text-[11px] text-[var(--text-primary)]">
          {curl}
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-1 rounded border border-[var(--border-color)] px-2 py-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Section>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="p-4 text-center text-[12px] text-[var(--text-muted)]">{msg}</div>;
}
