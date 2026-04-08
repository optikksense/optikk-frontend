import { Link, useLocation } from "@tanstack/react-router";
import { Bot, BrainCircuit, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const CONTEXT_ITEMS = [
  {
    id: "ai-observability",
    label: "AI Observability",
    description: "Model runs, token cost, and safety trends.",
    href: "/ai-observability",
    icon: Bot,
  },
  {
    id: "runs",
    label: "Runs Explorer",
    description: "Jump from anomalies into individual runs.",
    href: "/ai-runs",
    icon: BrainCircuit,
  },
];

export default function AiContextBar(): JSX.Element {
  const location = useLocation();

  return (
    <div className="border-[var(--border-color)] border-b bg-[linear-gradient(90deg,var(--color-primary-subtle-10),rgba(6,174,213,0.06),transparent)] px-6 py-2.5 max-md:px-4">
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-subtle-30)] bg-[var(--color-primary-subtle-12)] px-3 py-1 font-semibold text-[11px] text-[var(--color-primary)] uppercase tracking-[0.08em]">
          <Sparkles size={12} />
          AI Context
        </div>
        {CONTEXT_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "inline-flex min-w-[220px] items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                active
                  ? "border-[var(--color-primary-subtle-35)] bg-[var(--color-primary-subtle-14)]"
                  : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--color-primary-subtle-28)] hover:bg-[var(--color-primary-subtle-08)]"
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-subtle-12)] text-[var(--color-primary)]">
                <Icon size={16} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-[var(--text-primary)] text-sm">
                  {item.label}
                </span>
                <span className="block truncate text-[var(--text-muted)] text-xs">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
