import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

import { MetricQueryBuilder } from "@shared/metrics/components/MetricQueryBuilder/MetricQueryBuilder";

import type { Dashboard } from "@shared/dashboards/api/dashboardsApi";
import { editorStateToPayload, specToEditorState } from "@shared/dashboards/builder/metricsWidget";
import { useCreateWidget, useUpdateWidget } from "@shared/dashboards/hooks/useDashboardMutations";
import { DataSourceRow } from "./editor/DataSourceRow";
import { VizTypePicker } from "./editor/VizTypePicker";
import { WidgetEditorControls } from "./editor/WidgetEditorControls";
import { WidgetPreviewPanel } from "./editor/WidgetPreviewPanel";
import { useWidgetEditorState } from "./useWidgetEditorState";

interface WidgetEditorModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly pageId: number;
  readonly widgetCount: number;
  readonly editingWidget: Dashboard | null;
}

/** Full-window SigNoz-style widget editor with a live WYSIWYG preview. */
export function WidgetEditorModal({
  open,
  onOpenChange,
  pageId,
  widgetCount,
  editingWidget,
}: WidgetEditorModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] w-[min(1240px,94vw)] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-lg)] focus:outline-none">
          {/* Keyed so switching widgets reseeds the local editor state. */}
          <WidgetEditorBody
            key={editingWidget?.id ?? "new"}
            onClose={() => onOpenChange(false)}
            pageId={pageId}
            widgetCount={widgetCount}
            editingWidget={editingWidget}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface WidgetEditorBodyProps {
  readonly onClose: () => void;
  readonly pageId: number;
  readonly widgetCount: number;
  readonly editingWidget: Dashboard | null;
}

function WidgetEditorBody({ onClose, pageId, widgetCount, editingWidget }: WidgetEditorBodyProps) {
  const editor = useWidgetEditorState(
    editingWidget ? specToEditorState(editingWidget.spec) : undefined
  );
  const createWidget = useCreateWidget(pageId);
  const updateWidget = useUpdateWidget(pageId);
  const pending = createWidget.isPending || updateWidget.isPending;
  const mutationError = createWidget.error ?? updateWidget.error;

  const save = () => {
    if (pending || !editor.canExecute) return;
    const position = editingWidget?.position ?? widgetCount;
    const payload = editorStateToPayload(editor.state, position, editingWidget?.spec.id);
    const onSuccess = () => onClose();
    if (editingWidget) {
      updateWidget.mutate({ widgetId: editingWidget.id, payload }, { onSuccess });
    } else {
      createWidget.mutate(payload, { onSuccess });
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-border border-b px-5 py-4">
        <div className="flex-1">
          <Dialog.Title className="font-semibold text-foreground text-sm">
            {editingWidget ? "Edit widget" : "New widget"}
          </Dialog.Title>
          <Dialog.Description className="text-foreground-muted text-xs">
            Build a query and preview it live before adding to the page
          </Dialog.Description>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-foreground-muted hover:bg-secondary hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,460px)_1fr]">
        <div className="flex flex-col gap-5 overflow-y-auto border-border border-r px-5 py-5">
          <Section title="Visualization">
            <VizTypePicker value={editor.state.viz} onChange={editor.setViz} />
          </Section>
          <Section title="Data source">
            <DataSourceRow />
          </Section>
          <Section title="Query">
            <MetricQueryBuilder
              queries={editor.state.queries}
              formulas={editor.state.formulas}
              onAddQuery={editor.addQuery}
              onRemoveQuery={editor.removeQuery}
              onAggregationChange={editor.updateQueryAggregation}
              onMetricChange={editor.updateQueryMetric}
              onWhereChange={editor.updateQueryWhere}
              onGroupByChange={editor.updateQueryGroupBy}
              onAddFormula={editor.addFormula}
              onRemoveFormula={editor.removeFormula}
              onFormulaExpressionChange={editor.updateFormulaExpression}
            />
          </Section>
          <Section title="Display & size">
            <WidgetEditorControls
              display={editor.state.display}
              onDisplayChange={editor.setDisplay}
              size={editor.state.size}
              onSizeChange={editor.setSize}
            />
          </Section>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <WidgetPreviewPanel
            state={editor.state}
            onTitleChange={editor.setTitle}
            onStepChange={editor.setStep}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-border border-t bg-secondary/40 px-5 py-3">
        {mutationError && (
          <span className="mr-auto truncate text-error text-xs">{mutationError.message}</span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-border bg-card px-3 py-1.5 text-foreground text-sm hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending || !editor.canExecute}
          className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 font-medium text-sm text-white hover:bg-primary disabled:opacity-50"
        >
          <Check size={14} />
          {pending ? "Saving…" : editingWidget ? "Save changes" : "Add to page"}
        </button>
      </div>
    </>
  );
}

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-medium text-foreground-secondary text-xs">{title}</div>
      {children}
    </div>
  );
}
