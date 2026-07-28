import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button, Modal } from "@shared/components/primitives/ui";
import DataTable from "@shared/components/ui/data-display/DataTable";

import { formatRelativeTime } from "@shared/utils/formatters";
import type { LlmPromptSummary } from "../../../api/promptsApi";
import { usePromptMutations, usePrompts } from "../../../hooks/usePrompts";

import { Field, TextArea, TextInput } from "../../../components/form";

const columns: ColumnDef<LlmPromptSummary>[] = [
  {
    header: "Prompt",
    accessorKey: "name",
    cell: ({ row: { original: p } }) => (
      <div>
        <div className="font-medium text-foreground">{p.name}</div>
        <div className="font-mono text-[10px] text-foreground-muted">{p.type}</div>
      </div>
    ),
  },
  {
    header: "Versions",
    accessorKey: "versionCount",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: p } }) => <span className="font-mono">{p.versionCount}</span>,
  },
  {
    header: "Production",
    accessorKey: "productionVersion",
    size: 110,
    cell: ({ row: { original: p } }) =>
      p.productionVersion != null ? (
        <span className="rounded bg-[var(--ok-soft)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ok-fg)]">
          v{p.productionVersion}
        </span>
      ) : (
        <span className="text-[11px] text-foreground-muted">—</span>
      ),
  },
  {
    header: "Updated",
    accessorKey: "updatedAt",
    size: 110,
    cell: ({ row: { original: p } }) => (
      <span className="text-[11px] text-foreground-muted">{formatRelativeTime(p.updatedAt)}</span>
    ),
  },
  {
    header: "",
    id: "chevron",
    size: 34,
    meta: { align: "right" },
    cell: () => <ChevronRight size={14} className="ml-auto text-foreground-muted" />,
  },
];

export default function PromptsTab() {
  const navigate = useNavigate();
  const promptsQ = usePrompts();
  const { create } = usePromptMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [template, setTemplate] = useState('[{"role":"system","content":"You are helpful."}]');

  const submit = () => {
    if (!name.trim()) return;
    let parsed: unknown = template;
    try {
      parsed = JSON.parse(template);
    } catch {
                                               
    }
    create.mutate(
      { name, template: parsed },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>New prompt</Button>
      </div>
      <DataTable
        data={{ columns, rows: promptsQ.data ?? [], loading: promptsQ.isPending }}
        pagination={{ showPagination: false }}
        config={{
          emptyText: "No prompts yet.",
          onRow: (p) => ({
            onClick: () =>
              navigate({ to: `/llm/prompts/${encodeURIComponent(p.name)}` as string & {} }),
            style: { cursor: "pointer" },
          }),
        }}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="New prompt">
        <div className="flex w-[460px] max-w-full flex-col gap-3">
          <Field label="Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="support-agent"
            />
          </Field>
          <Field label="Template (chat JSON or text)">
            <TextArea rows={6} value={template} onChange={(e) => setTemplate(e.target.value)} />
          </Field>
          {create.isError && <p className="text-[11px] text-error">{create.error.message}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={create.isPending}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
