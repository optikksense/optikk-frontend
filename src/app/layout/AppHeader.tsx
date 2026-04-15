import { Button } from "@/design-system/button"
import { Input } from "@/design-system/input"
import { useUiStore } from "@/platform/state/ui-store"
import { parseTimeRange, serializeTimeRange } from "@/platform/url/time-range-codec"
import { useCompatSearchParams } from "@/platform/url/use-compat-search-params"

export function AppHeader() {
  const timezone = useUiStore((state) => state.timezone)
  const setTimezone = useUiStore((state) => state.setTimezone)
  const { replaceSearch, searchParams } = useCompatSearchParams()
  const range = parseTimeRange(searchParams.get("from"), searchParams.get("to"))

  const setRelative = (preset: string) => {
    const next = serializeTimeRange({ kind: "relative", preset, label: `Last ${preset}` })
    replaceSearch((draft) => {
      draft.set("from", next.from)
      draft.set("to", next.to)
    })
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel/80 px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {["15m", "1h", "6h", "24h"].map((preset) => (
          <Button
            key={preset}
            variant={range.kind === "relative" && range.preset === preset ? "primary" : "secondary"}
            onClick={() => setRelative(preset)}
          >
            {preset}
          </Button>
        ))}
        <Button variant="ghost" onClick={() => setRelative("15m")}>
          Reset
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="w-36"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value || "local")}
          placeholder="Timezone"
        />
        <div className="text-xs text-muted">
          from={searchParams.get("from") ?? "now-15m"} to={searchParams.get("to") ?? "now"}
        </div>
      </div>
    </header>
  )
}
