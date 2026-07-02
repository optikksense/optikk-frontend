import { Surface } from "@/components/ui";

export default function ComingSoonTab({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <Surface elevation={1} padding="lg">
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center">
        <div className="font-medium text-foreground text-sm">{title}</div>
        <div className="max-w-md text-foreground-muted text-xs leading-relaxed">{description}</div>
        <span className="mt-2 rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-foreground-secondary">
          coming soon
        </span>
      </div>
    </Surface>
  );
}
