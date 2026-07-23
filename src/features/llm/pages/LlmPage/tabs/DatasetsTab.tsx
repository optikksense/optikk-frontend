import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button, Card, Modal } from "@shared/components/primitives/ui";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import Loading from "@shared/components/ui/feedback/Loading";
import { formatNumber } from "@shared/utils/formatters";

import { Field, TextInput } from "../../../components/form";
import { useDatasetMutations, useDatasets } from "../../../hooks/useDatasets";

export default function DatasetsTab() {
  const navigate = useNavigate();
  const datasetsQ = useDatasets();
  const { create } = useDatasetMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      { name, description: description || undefined },
      {
        onSuccess: (d) => {
          setOpen(false);
          setName("");
          setDescription("");
          navigate({ to: `/llm/datasets/${d.id}` as string & {} });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>New dataset</Button>
      </div>

      {datasetsQ.isPending ? (
        <Loading />
      ) : (datasetsQ.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No datasets"
          description="Create a dataset to start running experiments."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {datasetsQ.data?.map((d) => (
            <Card
              key={d.id}
              className="cursor-pointer p-4 transition-colors hover:border-primary"
              onClick={() => navigate({ to: `/llm/datasets/${d.id}` as string & {} })}
            >
              <div className="font-medium text-foreground">{d.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] text-foreground-muted">
                {d.description || "No description"}
              </div>
              <div className="mt-3 flex gap-4 font-mono text-[11px] text-foreground-secondary">
                <span>{formatNumber(d.itemCount)} items</span>
                <span>{formatNumber(d.runCount)} runs</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New dataset">
        <div className="flex w-[420px] max-w-full flex-col gap-3">
          <Field label="Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="qa-golden-set"
            />
          </Field>
          <Field label="Description">
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} />
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
