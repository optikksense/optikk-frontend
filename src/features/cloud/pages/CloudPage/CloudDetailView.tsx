import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/primitives/ui/table";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import Loading from "@shared/components/ui/feedback/Loading";
import { PageSurface } from "@shared/components/ui/layout/PageShell";

import { HEALTH_COLOR, categoryColor, categoryLabel, providerMeta } from "../../constants";
import { useCloudProvider } from "../../hooks/useCloud";
import type { AttentionResource, ProviderSummary } from "../../types";
import { HealthPills } from "./HealthPills";
import { ProviderMark } from "./ProviderMark";

interface CloudDetailViewProps {
  summary: ProviderSummary;
}

export function CloudDetailView({ summary }: CloudDetailViewProps): JSX.Element {
  const meta = providerMeta(summary.provider);
  const detailQ = useCloudProvider(summary.provider);
  const detail = detailQ.data;

  return (
    <div className="flex flex-col gap-4">
      <PageSurface style={{ borderColor: meta.accent }}>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl"
            style={{ background: meta.soft }}
          >
            <ProviderMark provider={summary.provider} size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[18px] text-foreground tracking-tight">
                {meta.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2 py-0.5 font-semibold text-[11px] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                connected
              </span>
              {summary.lastSeen ? (
                <span className="font-mono text-[12px] text-foreground-muted">
                  last seen {new Date(summary.lastSeen).toLocaleString()}
                </span>
              ) : null}
            </div>
            <div className="mt-1 font-mono text-[12.5px] text-foreground-secondary">
              {summary.accounts} accounts · {summary.regions} regions · {summary.nodes} nodes ·{" "}
              {summary.pods} pods
              {summary.restarts > 0 ? (
                <span className="text-warning"> · {summary.restarts} restarts</span>
              ) : null}
            </div>
          </div>
          <HealthPills health={summary.health} />
        </div>
      </PageSurface>

      {detailQ.isPending ? <Loading /> : null}

      {detail ? (
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
            <PageSurface>
              <SectionTitle
                title="Services monitored"
                subtitle={`${detail.services.length} platform${detail.services.length === 1 ? "" : "s"} observed`}
              />
              {detail.services.length === 0 ? (
                <p className="mt-3 text-[13px] text-foreground-muted">
                  No cloud.platform attributes reported for this provider.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                  {detail.services.map((svc) => (
                    <div
                      key={svc.platform}
                      className="rounded-lg border border-border-light bg-secondary p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm"
                          style={{ background: categoryColor(svc.category) }}
                          aria-hidden
                        />
                        <span className="truncate font-semibold text-[13px] text-foreground">
                          {svc.platform}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-bold font-mono text-[17px] text-foreground">
                          {svc.count.toLocaleString()}
                        </span>
                        <span className="text-[11.5px] text-foreground-muted">
                          {categoryLabel(svc.category).toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PageSurface>

            <PageSurface>
              <SectionTitle
                title="Accounts"
                subtitle={`top ${detail.accounts.length} by resource count`}
              />
              {detail.accounts.length === 0 ? (
                <p className="mt-3 text-[13px] text-foreground-muted">
                  No cloud.account.id attributes reported.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {detail.accounts.map((a) => (
                    <div
                      key={a.account}
                      className="flex items-center justify-between rounded-md bg-secondary px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[13px] text-foreground">
                          {a.account}
                        </div>
                        <div className="text-[12px] text-foreground-muted">
                          {a.nodes} nodes · {a.pods} pods
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-[13px] text-foreground tabular-nums">
                        {a.resources.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </PageSurface>
          </div>

          <PageSurface>
            <SectionTitle title="Resources needing attention" subtitle="sorted by error volume" />
            {detail.resources.length === 0 ? (
              <EmptyState
                title="No RED telemetry"
                description="Attention ranking uses span metrics; none were found for this provider in range."
              />
            ) : (
              <div className="mt-3 overflow-x-auto">
                <ResourcesTable rows={detail.resources} />
              </div>
            )}
          </PageSurface>
        </>
      ) : null}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }): JSX.Element {
  return (
    <div>
      <div className="font-semibold text-[14px] text-foreground">{title}</div>
      <div className="mt-0.5 text-[12px] text-foreground-muted">{subtitle}</div>
    </div>
  );
}

function ResourcesTable({ rows }: { rows: readonly AttentionResource[] }): JSX.Element {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Region · platform</TableHead>
          <TableHead className="text-right">Error rate</TableHead>
          <TableHead className="text-right">Requests</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.entity}>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: HEALTH_COLOR[r.health] }}
                  aria-hidden
                />
                <span className="font-mono text-[13px] text-foreground">{r.entity}</span>
              </div>
            </TableCell>
            <TableCell className="text-[13px] text-foreground-secondary">{r.service}</TableCell>
            <TableCell className="font-mono text-[12.5px] text-foreground-muted">
              {[r.region, r.platform].filter(Boolean).join(" · ") || "—"}
            </TableCell>
            <TableCell
              className="text-right font-mono text-[13px] tabular-nums"
              style={{ color: HEALTH_COLOR[r.health] }}
            >
              {r.errorRate.toFixed(1)}%
            </TableCell>
            <TableCell className="text-right font-mono text-[13px] text-foreground tabular-nums">
              {r.requestCount.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
