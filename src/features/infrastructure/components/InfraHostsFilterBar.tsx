import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type { InfrastructureNode } from "../types";
import { InfraFilterInput } from "./InfraFilterInput";

interface InfraHostsFilterBarProps {
  readonly hosts: readonly InfrastructureNode[];
  readonly value: string;
  readonly onChange: (next: string) => void;
}

export function InfraHostsFilterBar({ hosts, value, onChange }: InfraHostsFilterBarProps) {
  const [showSug, setShowSug] = useState(false);

  const allSuggestions = useMemo(() => {
    const roles = Array.from(new Set(hosts.flatMap((h) => h.services)))
      .slice(0, 5)
      .map((r) => `role:${r}`);
    const statuses = ["status:ok", "status:warn", "status:err"];
    return [...roles, ...statuses];
  }, [hosts]);

  const suggestions = useMemo(() => {
    if (!value) return allSuggestions;
    return allSuggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()));
  }, [allSuggestions, value]);

  return (
    <div className="rounded-md border border-border bg-card p-3.5 shadow-sm">
      <div className="relative">
        <InfraFilterInput
          value={value}
          onChange={(next) => {
            onChange(next);
            setShowSug(true);
          }}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 200)}
          placeholder="Filter hosts by name, tag, role…"
        />

        {showSug && suggestions.length > 0 && (
          <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-[320px] overflow-hidden rounded-md border border-border bg-card py-1 shadow-md">
            {suggestions.map((s) => {
              const [k, v] = s.split(":");
              return (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => {
                    onChange(s);
                    setShowSug(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-muted"
                >
                  <Search size={12} className="text-foreground-muted" />
                  <span className="flex-none font-mono text-primary">{k}:</span>
                  <span className="text-foreground">{v}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
