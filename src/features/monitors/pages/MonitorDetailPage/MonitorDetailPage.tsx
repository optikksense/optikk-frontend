import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback } from "react";

import { PageShell } from "@shared/components/ui";

import { ackMonitor, muteMonitor } from "../../api/monitorsApi";
import {
  useMonitorDetail,
  useMonitorEventsQuery,
  useMonitorSeriesQuery,
  useStatusTimelineQuery,
} from "../../hooks/useMonitorDetail";

import CurrentValueCard from "./CurrentValueCard";
import DetailHeader from "./DetailHeader";
import EvalChartCard from "./EvalChartCard";
import NotificationsCard from "./NotificationsCard";
import QueryCard from "./QueryCard";
import RecentTriggersCard from "./RecentTriggersCard";
import RunbookCard from "./RunbookCard";
import StatusTimelineCard from "./StatusTimelineCard";

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function MonitorDetailPage() {
  const params = useParams({ strict: false }) as { monitorId?: string };
  const id = params.monitorId ? Number(params.monitorId) : undefined;
  const navigate = useNavigate();

  const detailQ = useMonitorDetail(id);
  const seriesQ = useMonitorSeriesQuery(id, ONE_HOUR_MS);
  const timelineQ = useStatusTimelineQuery(id, ONE_DAY_MS);
  const eventsQ = useMonitorEventsQuery(id, 10);

  const handleAck = useCallback(async () => {
    if (id === undefined) return;
    try {
      await ackMonitor(id);
      detailQ.refetch();
      eventsQ.refetch();
    } catch (err) {
      console.error("ack failed", err);
    }
  }, [id, detailQ, eventsQ]);

  const handleMute = useCallback(async () => {
    if (id === undefined) return;
    try {
      await muteMonitor(id, 3600);
      detailQ.refetch();
    } catch (err) {
      console.error("mute failed", err);
    }
  }, [id, detailQ]);

  if (id === undefined || Number.isNaN(id)) {
    return (
      <PageShell>
        <div className="p-8 text-sm text-[var(--text-muted)]">
          Invalid monitor id.{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/monitors" })}
            className="text-blue-400 underline"
          >
            Back to monitors
          </button>
        </div>
      </PageShell>
    );
  }

  if (detailQ.isPending && !detailQ.data) {
    return (
      <PageShell>
        <div className="p-8 text-sm text-[var(--text-muted)]">Loading monitor…</div>
      </PageShell>
    );
  }

  if (detailQ.isError || !detailQ.data) {
    return (
      <PageShell>
        <div className="p-8 text-sm text-red-400">
          Failed to load monitor.{" "}
          <button
            type="button"
            onClick={() => detailQ.refetch()}
            className="text-blue-400 underline"
          >
            Retry
          </button>
        </div>
      </PageShell>
    );
  }

  const monitor = detailQ.data;

  return (
    <PageShell>
      <DetailHeader monitor={monitor} onAck={handleAck} onMute={handleMute} />

      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4">
        <EvalChartCard data={seriesQ.data} loading={seriesQ.isPending} />
        <CurrentValueCard monitor={monitor} />
        <StatusTimelineCard data={timelineQ.data} />
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <QueryCard monitor={monitor} />
          <RecentTriggersCard events={eventsQ.data ?? []} loading={eventsQ.isPending} />
        </div>
        <div className="flex flex-col gap-4">
          <NotificationsCard monitor={monitor} />
          <RunbookCard monitor={monitor} />
        </div>
      </div>
    </PageShell>
  );
}
