import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";

import { OptikkLogo } from "@/shared/components/brand/OptikkLogo";
import { ROUTES } from "@shared/constants/routes";

import { SnippetTabs } from "../../components/SnippetTabs";
import { useOnboardingStatus } from "../../hooks/useOnboardingStatus";
import { resolveOtlpEndpoint } from "../../utils/otlpSnippet";

function WelcomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useOnboardingStatus();

  const provisioned = data?.provisioned ?? false;
  const hasFirstTrace = Boolean(data?.first_span_at);
  const endpoint = resolveOtlpEndpoint();

  return (
    <div className="min-h-screen bg-surface-canvas px-6 py-10 text-foreground">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-8 flex items-center gap-2.5 font-bold text-[16px] tracking-[-0.01em]">
          <OptikkLogo size={28} />
          Optikk
        </div>

        <h1 className="m-0 mb-1.5 font-bold text-2xl tracking-[-0.015em]">
          Get your first trace flowing
        </h1>
        <p className="m-0 mb-8 text-[13.5px] text-foreground-muted">
          Point your service at Optikk and watch the data arrive — no infra to run.
        </p>

        <Step index={1} title="Provisioning your collector" state={provisioned ? "done" : "active"}>
          {!provisioned && (
            <p className="flex items-center gap-2 text-[13px] text-foreground-muted">
              <Spinner />
              {isLoading
                ? "Loading your onboarding status…"
                : "Setting up a dedicated ingest pipeline for your team…"}
            </p>
          )}
        </Step>

        <Step index={2} title="Connect your service" state={provisioned ? "active" : "pending"}>
          {provisioned && data && (
            <div className="grid gap-2.5">
              <p className="text-[13px] text-foreground-muted">
                Set these environment variables on the service you want to observe.
              </p>
              <SnippetTabs endpoint={endpoint} apiKey={data.api_key} />
            </div>
          )}
        </Step>

        <Step
          index={3}
          title={hasFirstTrace ? "First trace received" : "Waiting for your first trace"}
          state={hasFirstTrace ? "done" : provisioned ? "active" : "pending"}
          last
        >
          {provisioned && !hasFirstTrace && (
            <p className="flex items-center gap-2 text-[13px] text-foreground-muted">
              <Spinner />
              Listening for spans from your service…
            </p>
          )}
          {hasFirstTrace && (
            <button
              type="button"
              onClick={() => navigate({ to: ROUTES.traces })}
              className="mt-1 flex h-[40px] items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 font-semibold text-[var(--login-submit-fg)] text-sm transition-colors hover:border-[var(--login-link)] hover:bg-[var(--login-link)]"
            >
              View your traces
              <ArrowRight size={14} strokeWidth={2.2} />
            </button>
          )}
        </Step>

        <p className="mt-8 text-center text-[12.5px] text-foreground-muted">
          You can close this and finish later —{" "}
          <Link
            to={ROUTES.overview}
            className="font-semibold text-[var(--login-link)] no-underline hover:underline"
          >
            skip to your workspace
          </Link>
        </p>
      </div>
    </div>
  );
}

type StepState = "pending" | "active" | "done";

interface StepProps {
  readonly index: number;
  readonly title: string;
  readonly state: StepState;
  readonly last?: boolean;
  readonly children?: ReactNode;
}

function Step({ index, title, state, last, children }: StepProps) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <Marker index={index} state={state} />
        {!last && <span className="my-1 w-px flex-1 bg-border" />}
      </div>
      <div className={last ? "pb-2" : "pb-6"}>
        <h3
          className={
            state === "pending"
              ? "m-0 mb-1 font-semibold text-[14px] text-foreground-muted"
              : "m-0 mb-1 font-semibold text-[14px] text-foreground"
          }
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

function Marker({ index, state }: { readonly index: number; readonly state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-healthy text-white">
        <Check size={15} strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span
      className={
        state === "active"
          ? "flex h-7 w-7 items-center justify-center rounded-full border border-primary font-semibold text-[13px] text-primary"
          : "flex h-7 w-7 items-center justify-center rounded-full border border-border font-semibold text-[13px] text-foreground-muted"
      }
    >
      {index}
    </span>
  );
}

function Spinner() {
  return (
    <span className="h-[14px] w-[14px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-border border-t-primary" />
  );
}

export default WelcomePage;
