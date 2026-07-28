import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import { Modal } from "@shared/components/primitives/ui/dialog";

import { Field, SelectInput, TextInput } from "../../../components/form";
import { useProviderKeyMutations, useProviderKeys } from "../../../hooks/useProviderKeys";

type Provider = "openai" | "anthropic" | "mistral";

export default function ProviderKeyManager({ onClose }: { readonly onClose: () => void }) {
  const keysQ = useProviderKeys();
  const { create, remove } = useProviderKeyMutations();
  const [provider, setProvider] = useState<Provider>("openai");
  const [label, setLabel] = useState("default");
  const [apiKey, setApiKey] = useState("");

  const submit = () => {
    if (!apiKey.trim() || !label.trim()) return;
    create.mutate({ provider, label, apiKey }, { onSuccess: () => setApiKey("") });
  };

  return (
    <Modal open onClose={onClose} title="Provider keys">
      <div className="flex w-[440px] max-w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          {(keysQ.data ?? []).map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded border border-border bg-surface px-2.5 py-1.5"
            >
              <span className="font-mono text-[11px] text-foreground-secondary">
                {k.provider} · {k.label} · ••••{k.last4}
              </span>
              <button type="button" onClick={() => remove.mutate(k.id)} aria-label="delete key">
                <Trash2 size={14} className="text-foreground-muted hover:text-error" />
              </button>
            </div>
          ))}
          {(keysQ.data?.length ?? 0) === 0 && (
            <p className="text-[11px] text-foreground-muted">
              No keys stored. Keys are encrypted at rest.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Provider">
            <SelectInput value={provider} onChange={(e) => setProvider(e.target.value as Provider)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="mistral">Mistral</option>
            </SelectInput>
          </Field>
          <Field label="Label">
            <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
        </div>
        <Field label="API key">
          <TextInput
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-…"
          />
        </Field>
        {create.isError && <p className="text-[11px] text-error">{create.error.message}</p>}
        <div className="flex justify-end">
          <Button onClick={submit} disabled={create.isPending}>
            Add key
          </Button>
        </div>
      </div>
    </Modal>
  );
}
