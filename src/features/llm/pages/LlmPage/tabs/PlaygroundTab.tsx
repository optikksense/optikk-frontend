import { useState } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import { Card } from "@shared/components/primitives/ui/card";
import { formatDuration } from "@shared/utils/formatters";

import { Field, SelectInput, TextArea, TextInput } from "../../../components/form";
import { usePlaygroundComplete } from "../../../hooks/usePlayground";
import { formatCost } from "../../../utils/llmFormat";
import ProviderKeyManager from "../product/ProviderKeyManager";

type Provider = "openai" | "anthropic" | "mistral";

const DEFAULT_MODEL: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  mistral: "mistral-small-latest",
};

export default function PlaygroundTab() {
  const complete = usePlaygroundComplete();
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(DEFAULT_MODEL.openai);
  const [system, setSystem] = useState("You are a helpful assistant.");
  const [user, setUser] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(512);
  const [keysOpen, setKeysOpen] = useState(false);

  const run = () => {
    const messages = [
      ...(system.trim() ? [{ role: "system" as const, content: system }] : []),
      { role: "user" as const, content: user },
    ];
    complete.mutate({ provider, model, messages, temperature, maxTokens });
  };

  const onProviderChange = (p: Provider) => {
    setProvider(p);
    setModel(DEFAULT_MODEL[p]);
  };

  const result = complete.data;

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-3">
        <Field label="System">
          <TextArea rows={4} value={system} onChange={(e) => setSystem(e.target.value)} />
        </Field>
        <Field label="User">
          <TextArea
            rows={6}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Ask something…"
          />
        </Field>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-foreground text-sm">Output</span>
            {result && (
              <span className="flex gap-3 font-mono text-[11px] text-foreground-muted">
                <span>{result.inputTokens + result.outputTokens} tok</span>
                <span>{formatDuration(result.latencyMs)}</span>
                <span>{formatCost(result.costUsd)}</span>
              </span>
            )}
          </div>
          {complete.isError ? (
            <p className="text-[12px] text-error">{complete.error.message}</p>
          ) : (
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[12px] text-foreground-secondary">
              {result?.output ??
                (complete.isPending ? "Running…" : "Run a completion to see output.")}
            </pre>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Card className="flex flex-col gap-3 p-4">
          <Field label="Provider">
            <SelectInput
              value={provider}
              onChange={(e) => onProviderChange(e.target.value as Provider)}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="mistral">Mistral</option>
            </SelectInput>
          </Field>
          <Field label="Model">
            <TextInput value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label={`Temperature · ${temperature.toFixed(2)}`}>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
          </Field>
          <Field label={`Max tokens · ${maxTokens}`}>
            <input
              type="range"
              min={64}
              max={4096}
              step={64}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
            />
          </Field>
          <Button onClick={run} disabled={complete.isPending || !user.trim()}>
            {complete.isPending ? "Running…" : "Run"}
          </Button>
          <Button variant="ghost" onClick={() => setKeysOpen(true)}>
            Manage keys
          </Button>
        </Card>
      </div>

      {keysOpen && <ProviderKeyManager onClose={() => setKeysOpen(false)} />}
    </div>
  );
}
