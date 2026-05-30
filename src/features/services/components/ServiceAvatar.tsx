const PALETTE = [
  "var(--color-primary-subtle-25)",
  "var(--color-warning-subtle)",
  "var(--color-success-subtle)",
  "var(--color-error-subtle)",
  "var(--color-info-subtle)",
] as const;

function hashIndex(input: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

function getInitials(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]+/g, " ").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface ServiceAvatarProps {
  readonly serviceName: string;
  readonly size?: number;
}

export function ServiceAvatar({ serviceName, size = 44 }: ServiceAvatarProps) {
  const bg = PALETTE[hashIndex(serviceName, PALETTE.length)];
  const fontSize = Math.max(9, Math.round(size * 0.32));
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-md font-semibold text-foreground"
      style={{
        backgroundColor: bg,
        width: size,
        height: size,
        fontSize,
      }}
    >
      {getInitials(serviceName)}
    </div>
  );
}
