import { Construction } from "lucide-react";

import { Card } from "@/components/ui";

interface ComingSoonPanelProps {
  title: string;
  description?: string;
  bullets?: readonly string[];
}

export function ComingSoonPanel({ title, description, bullets }: ComingSoonPanelProps) {
  return (
    <Card
      padding="lg"
      className="border border-[var(--border-color)] border-dashed bg-[rgba(255,255,255,0.02)]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-2 text-[var(--text-muted)]">
          <Construction size={20} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="font-semibold text-[15px] text-[var(--text-primary)]">{title}</h2>
          {description ? (
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          ) : null}
          {bullets && bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-[var(--text-muted)]">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
