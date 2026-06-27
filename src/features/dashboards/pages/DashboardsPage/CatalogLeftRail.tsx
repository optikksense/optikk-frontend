import { LayoutGrid, Sparkles, Star } from "lucide-react";

export type CatalogView = "all" | "favorites";

interface CatalogLeftRailProps {
  readonly view: CatalogView;
  readonly onView: (view: CatalogView) => void;
  readonly tags: ReadonlyArray<readonly [string, number]>;
  readonly activeTag: string | null;
  readonly onTag: (tag: string | null) => void;
}

const VIEWS: ReadonlyArray<{ id: CatalogView; label: string; icon: typeof LayoutGrid }> = [
  { id: "all", label: "All pages", icon: LayoutGrid },
  { id: "favorites", label: "Favorites", icon: Star },
];

export function CatalogLeftRail({ view, onView, tags, activeTag, onTag }: CatalogLeftRailProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 font-semibold text-[11px] text-foreground-muted uppercase tracking-wide">
          Views
        </div>
        <div className="flex flex-col gap-0.5">
          {VIEWS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onView(id)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                  active
                    ? "bg-[var(--color-primary-subtle-12)] font-semibold text-primary"
                    : "text-foreground-secondary hover:bg-secondary"
                }`}
              >
                <Icon size={14} />
                <span className="flex-1">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-[11px] text-foreground-muted uppercase tracking-wide">
              Tags
            </span>
            {activeTag && (
              <button
                type="button"
                onClick={() => onTag(null)}
                className="text-primary text-xs hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            {tags.map(([tag, count]) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTag(active ? null : tag)}
                  className={`flex items-center gap-2 rounded px-2 py-1 text-left text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-foreground-secondary hover:bg-secondary"
                  }`}
                >
                  <span className="flex-1 font-mono">#{tag}</span>
                  <span className="font-mono text-foreground-muted text-xs">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles size={13} className="text-primary" />
          <span className="font-semibold text-foreground text-sm">How pages work</span>
        </div>
        <p className="m-0 text-foreground-muted text-xs leading-5">
          A page is a workspace you own. Inside it, you define widgets — each one a configured chart
          or table tied to a curated data source.
        </p>
      </div>
    </div>
  );
}
