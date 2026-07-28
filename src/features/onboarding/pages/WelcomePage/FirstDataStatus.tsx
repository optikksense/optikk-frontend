import { CheckCircle2, Loader2 } from "lucide-react";

import type { IngestionEndpoints } from "@shared/api/ingestionEndpoints";

import { useFirstDataPoll } from "../../hooks/useFirstDataPoll";

export function FirstDataStatus({
  endpoints,
}: {
  readonly endpoints: IngestionEndpoints | undefined;
}) {
  const state = useFirstDataPoll();

  if (state.phase === "received") {
    const { spans, records, service } = state.data;
    const count = spans > 0 ? spans : records;
    const noun = spans > 0 ? "span" : "record";
    return (
      <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-[12.5px] text-foreground">
        <CheckCircle2 size={15} strokeWidth={2.2} className="shrink-0 text-success" />
        <span>
          {count.toLocaleString()} {count === 1 ? noun : `${noun}s`} received
          {service ? (
            <>
              {" from "}
              <span className="font-semibold">{service}</span>
            </>
          ) : null}
          . You&apos;re live.
        </span>
      </div>
    );
  }

  const showHint = state.phase === "gaveUp" || state.showHint;
  return (
    <div className="mt-4 rounded-md border border-border bg-card px-3 py-2.5 text-[12.5px] text-foreground-muted">
      <div className="flex items-center gap-2">
        {state.phase === "waiting" && (
          <Loader2 size={14} strokeWidth={2.2} className="shrink-0 animate-spin" />
        )}
        <span>
          {state.phase === "gaveUp"
            ? "No data yet — we've stopped checking for now. Your dashboards will light up as soon as telemetry arrives."
            : "Waiting for first data… ingestion stats flush every few minutes, so this can take a little while after your app starts sending."}
        </span>
      </div>
      {showHint && <TroubleshootingHint endpoints={endpoints} />}
    </div>
  );
}

function TroubleshootingHint({
  endpoints,
}: {
  readonly endpoints: IngestionEndpoints | undefined;
}) {
  return (
    <ul className="m-0 mt-2 list-disc space-y-1 border-border border-t pt-2 pl-4 text-[11.5px]">
      <li>
        Endpoint includes the port: <Mono>{endpoints?.grpc ?? "…:4317"}</Mono> for gRPC,{" "}
        <Mono>{endpoints?.http ?? "…:4318"}</Mono> for HTTP.
      </li>
      <li>
        The <Mono>{endpoints?.headerName ?? "x-api-key"}</Mono> header is set on every export and
        matches the key above.
      </li>
      <li>Your app or collector can reach the endpoint (egress, TLS, no proxy in the way).</li>
    </ul>
  );
}

function Mono({ children }: { readonly children: React.ReactNode }) {
  return <code className="font-mono text-foreground-secondary">{children}</code>;
}
