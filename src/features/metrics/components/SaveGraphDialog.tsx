import { useNavigate } from "@tanstack/react-router";
import { FolderPlus, LayoutDashboard } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@shared/components/primitives/ui/button";
import { Modal } from "@shared/components/primitives/ui/dialog";
import type { FormulaDefinition, MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from "@shared/metrics/types";

import {
  type CreateDashboardPagePayload,
  type DashboardPage,
  createDashboardPage,
  createWidget,
} from "@/features/dashboards/api/dashboardsApi";
import { useDashboardPagesList } from "@/features/dashboards/hooks/useDashboardPages";
import { editorStateToPayload } from "@/features/dashboards/builder/metricsWidget";

interface SaveGraphDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly step: TimeStep;
  readonly spaceAgg: MetricSpaceAggregation;
}

export function SaveGraphDialog({
  open,
  onClose,
  queries,
  formulas,
  step,
  spaceAgg,
}: SaveGraphDialogProps) {
  const navigate = useNavigate();
  const { data } = useDashboardPagesList({ limit: 50 });
  const pages = data?.items ?? [];

  const [selectedPageId, setSelectedPageId] = useState<number | "new">("new");
  const [newPageName, setNewPageName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      let pageId: number;

      if (selectedPageId === "new") {
        const name = newPageName.trim();
        if (!name) {
          toast.error("Enter a name for the new dashboard page");
          setSaving(false);
          return;
        }
        const payload: CreateDashboardPagePayload = {
          name,
          icon: "BarChart3",
          iconColor: "#8b5cf6",
        };
        const page = await createDashboardPage(payload);
        pageId = page.id;
      } else {
        pageId = selectedPageId;
      }

      const widgetPayload = editorStateToPayload(
        {
          title: queries.find((q) => q.metricName)?.metricName ?? "Untitled",
          viz: "timeseries",
          queries,
          formulas,
          step,
          spaceAgg,
          display: { legend: true, smooth: true },
          size: "md",
        },
        0,
      );

      await createWidget(pageId, widgetPayload);

      toast.success("Graph saved to dashboard", {
        action: {
          label: "Open",
          onClick: () => navigate({ to: `/dashboards/${pageId}` as string & {} }),
        },
      });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save graph";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [selectedPageId, newPageName, queries, formulas, step, spaceAgg, navigate, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save to dashboard"
      width={440}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Create new option */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="dashboard-page"
            checked={selectedPageId === "new"}
            onChange={() => setSelectedPageId("new")}
            className="accent-primary"
          />
          <FolderPlus size={16} className="shrink-0 text-foreground-secondary" />
          <span className="text-sm">Create new page</span>
        </label>

        {selectedPageId === "new" && (
          <input
            autoFocus
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Dashboard page name"
            className="rounded border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        )}

        {/* Existing pages */}
        {pages.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-foreground-muted text-xs">Or add to an existing page</span>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {pages.map((page: DashboardPage) => (
                <label
                  key={page.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="dashboard-page"
                    checked={selectedPageId === page.id}
                    onChange={() => setSelectedPageId(page.id)}
                    className="accent-primary"
                  />
                  <LayoutDashboard size={14} className="shrink-0 text-foreground-secondary" />
                  <div className="flex flex-col">
                    <span className="text-sm">{page.name}</span>
                    <span className="text-foreground-muted text-[11px]">
                      {page.widgetCount} widget{page.widgetCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
