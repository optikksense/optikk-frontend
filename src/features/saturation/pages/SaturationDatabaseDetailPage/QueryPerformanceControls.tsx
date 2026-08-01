import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/primitives/ui/command";
import { Popover } from "@shared/components/primitives/ui/popover";
import { cn } from "@shared/lib/utils";

import type { QueryPerformanceSeries } from "@/features/saturation/api/databaseQueryPerformanceApi";
import { queryDisplayLabel } from "./queryPerformanceModel";

interface SearchOption {
  readonly value: string;
  readonly label: string;
}

function SearchableSelect({
  options,
  value,
  placeholder,
  onChange,
}: {
  readonly options: SearchOption[];
  readonly value: string;
  readonly placeholder: string;
  readonly onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-[min(32rem,calc(100vw-2rem))] p-0"
      trigger={
        <Button variant="secondary" className="w-[min(32rem,100%)] justify-between font-normal">
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown size={14} className="shrink-0 text-foreground-muted" />
        </Button>
      }
    >
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No matching option.</CommandEmpty>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={`${option.label} ${option.value}`}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <Check
                size={14}
                className={cn("shrink-0", option.value === value ? "opacity-100" : "opacity-0")}
              />
              <span className="truncate">{option.label}</span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </Popover>
  );
}

function SeriesPicker({
  series,
  selected,
  onToggle,
}: {
  readonly series: QueryPerformanceSeries[];
  readonly selected: ReadonlySet<string>;
  readonly onToggle: (queryHash: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-[min(34rem,calc(100vw-2rem))] p-0"
      trigger={
        <Button variant="secondary">
          Queries {selected.size}/{series.length}
          <ChevronsUpDown size={14} />
        </Button>
      }
    >
      <Command>
        <CommandInput placeholder="Search plotted queries…" />
        <CommandList>
          <CommandEmpty>No matching query.</CommandEmpty>
          {series.map((query) => (
            <CommandItem
              key={query.queryHash}
              value={`${query.queryLabel} ${query.queryHash}`}
              onSelect={() => onToggle(query.queryHash)}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  selected.has(query.queryHash) ? "border-primary bg-primary" : "border-border"
                )}
              >
                {selected.has(query.queryHash) ? <Check size={11} className="text-white" /> : null}
              </span>
              <span className="truncate">{queryDisplayLabel(query)}</span>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </Popover>
  );
}

interface QueryPerformanceControlsProps {
  readonly mode: "collection" | "query";
  readonly options: SearchOption[];
  readonly value: string;
  readonly series: QueryPerformanceSeries[];
  readonly selectedHashes: ReadonlySet<string>;
  readonly showAll: boolean;
  readonly truncated: boolean;
  readonly onModeChange: (mode: "collection" | "query") => void;
  readonly onValueChange: (value: string) => void;
  readonly onToggleSeries: (queryHash: string) => void;
  readonly onShowAllChange: (showAll: boolean) => void;
}

export function QueryPerformanceControls(props: QueryPerformanceControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex rounded-md border border-border bg-muted p-0.5">
        {(["collection", "query"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => props.onModeChange(mode)}
            className={cn(
              "rounded px-3 py-1.5 font-medium text-[12px] capitalize",
              props.mode === mode
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      <SearchableSelect
        options={props.options}
        value={props.value}
        placeholder={`Select ${props.mode}`}
        onChange={props.onValueChange}
      />
      {props.mode === "collection" ? (
        <>
          <SeriesPicker
            series={props.series}
            selected={props.selectedHashes}
            onToggle={props.onToggleSeries}
          />
          <Button
            variant={props.showAll ? "primary" : "secondary"}
            onClick={() => props.onShowAllChange(!props.showAll)}
          >
            {props.showAll ? "Top 10" : "Show all"}
          </Button>
          {props.truncated ? (
            <span className="text-[11px] text-warning">Showing the first 100 queries.</span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
