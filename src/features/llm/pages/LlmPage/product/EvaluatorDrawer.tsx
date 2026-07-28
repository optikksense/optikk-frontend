import { useState } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import { Modal } from "@shared/components/primitives/ui/dialog";

import { Field, SelectInput, TextArea, TextInput } from "../../../components/form";
import { useEvaluatorMutations } from "../../../hooks/useEvaluators";

export default function EvaluatorDrawer({ onClose }: { readonly onClose: () => void }) {
  const { create } = useEvaluatorMutations();
  const [name, setName] = useState("");
  const [scoreName, setScoreName] = useState("");
  const [target, setTarget] = useState<"traces" | "generations">("generations");
  const [dataType, setDataType] = useState<"numeric" | "boolean" | "categorical">("numeric");
  const [judgeModel, setJudgeModel] = useState("");

  const submit = () => {
    if (!name.trim() || !scoreName.trim()) return;
    create.mutate(
      { name, scoreName, target, dataType, judgeModel: judgeModel || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal open onClose={onClose} title="New evaluator">
      <div className="flex w-[420px] max-w-full flex-col gap-3">
        <Field label="Name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Faithfulness"
          />
        </Field>
        <Field label="Score name">
          <TextInput
            value={scoreName}
            onChange={(e) => setScoreName(e.target.value)}
            placeholder="faithfulness"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target">
            <SelectInput
              value={target}
              onChange={(e) => setTarget(e.target.value as typeof target)}
            >
              <option value="generations">generations</option>
              <option value="traces">traces</option>
            </SelectInput>
          </Field>
          <Field label="Data type">
            <SelectInput
              value={dataType}
              onChange={(e) => setDataType(e.target.value as typeof dataType)}
            >
              <option value="numeric">numeric</option>
              <option value="boolean">boolean</option>
              <option value="categorical">categorical</option>
            </SelectInput>
          </Field>
        </div>
        <Field label="Judge model (used by upcoming automated runner)">
          <TextArea
            rows={2}
            value={judgeModel}
            onChange={(e) => setJudgeModel(e.target.value)}
            placeholder="gpt-4o-mini"
          />
        </Field>
        {create.isError && <p className="text-[11px] text-error">{create.error.message}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
