import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ROUTES } from "@shared/constants/routes";

import { takeSignupApiKey } from "@shared/api/auth/apiKeyHandoff";

import { resolveOtlpEndpoint } from "@/features/onboarding/otlpEndpoint";

import { LoginBrandPanel } from "../LoginPage/LoginBrandPanel";
import { buildSnippets } from "./snippets";

export function WelcomePage() {
  const navigate = useNavigate();
  // Read the one-time signup key on mount; it is cleared after this.
  const [apiKey] = useState<string | null>(() => takeSignupApiKey());
  const endpoint = useMemo(resolveOtlpEndpoint, []);
  const snippets = useMemo(() => buildSnippets(endpoint, apiKey), [endpoint, apiKey]);
  const [activeTab, setActiveTab] = useState(snippets[0]?.id ?? "env");

  const active = snippets.find((s) => s.id === activeTab) ?? snippets[0];

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-canvas text-foreground lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <main className="grid grid-rows-[1fr_auto] px-12 py-7 max-md:px-6 max-md:py-5">
        <div className="mx-auto w-full max-w-[440px] self-center py-7">
          <header className="mb-5">
            <h2 className="m-0 mb-1.5 font-bold text-2xl tracking-[-0.015em]">
              You&apos;re in. Send your first trace.
            </h2>
            <p className="m-0 text-[13.5px] text-foreground-muted">
              Point your OpenTelemetry collector at Optikk with the credentials below.
            </p>
          </header>

          <CredentialRow label="OTLP endpoint" value={endpoint} icon={null} />
          <CredentialRow
            label="API key"
            value={apiKey}
            icon={<KeyRound size={14} strokeWidth={2} />}
            fallback="Regenerate in Settings → Tenant (keys are not recoverable)"
          />
          {apiKey && (
            <p className="m-0 mb-3 text-[11.5px] text-foreground-muted">
              Store this key now — it cannot be shown again. If lost, regenerate it in Settings.
            </p>
          )}

          <SnippetTabs
            tabs={snippets.map((s) => ({ id: s.id, label: s.label }))}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
          <CodeBlock code={active?.code ?? ""} />

          <button
            type="button"
            onClick={() => navigate({ to: ROUTES.overview })}
            className="mt-5 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-semibold text-[var(--login-submit-fg)] text-sm transition-colors hover:border-[var(--login-link)] hover:bg-[var(--login-link)]"
          >
            Go to dashboard
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
        <footer className="text-center font-mono text-[11px] text-foreground-muted">
          Your trial is active — no card required.
        </footer>
      </main>
    </div>
  );
}

function CredentialRow({
  label,
  value,
  icon,
  fallback,
}: {
  readonly label: string;
  readonly value: string | null;
  readonly icon: React.ReactNode;
  readonly fallback?: string;
}) {
  return (
    <div className="mb-3">
      <span className="font-semibold text-[11.5px] text-foreground-secondary uppercase tracking-[0.04em]">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        {icon}
        <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-foreground">
          {value ?? fallback ?? "—"}
        </code>
        {value != null && <CopyButton text={value} />}
      </div>
    </div>
  );
}

function SnippetTabs({
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

function CodeBlock({ code }: { readonly code: string }) {
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

function CopyButton({ text }: { readonly text: string }) {
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
