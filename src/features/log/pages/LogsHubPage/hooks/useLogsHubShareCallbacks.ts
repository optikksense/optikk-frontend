import { useCallback } from "react";
import toast from "react-hot-toast";

import { ROUTES } from "@/shared/constants/routes";
import { useTimeRange } from "@app/store/appStore";
import {
  buildShareableSnapshot,
  copyUrlOrSnapshotJson,
  snapshotToJson,
} from "@shared/observability/shareableView";

export function useLogsHubShareCallbacks() {
  const timeRange = useTimeRange();

  const onCopyShareLink = useCallback(async (): Promise<void> => {
    const href = window.location.href;
    const snapshot = buildShareableSnapshot("logs", ROUTES.logs, window.location.search, timeRange);
    const r = await copyUrlOrSnapshotJson(href, snapshot);
    if (r.mode === "url") {
      toast.success("Share link copied");
    } else {
      toast.success("URL was too long — copied view JSON instead. Share via doc or ticket.");
    }
  }, [timeRange]);

  const onExportViewJson = useCallback(async (): Promise<void> => {
    const snapshot = buildShareableSnapshot("logs", ROUTES.logs, window.location.search, timeRange);
    await navigator.clipboard.writeText(snapshotToJson(snapshot));
    toast.success("View JSON copied");
  }, [timeRange]);

  return { onCopyShareLink, onExportViewJson };
}
