import type { ErrorFingerprint } from "@/features/overview/api/serviceDetailApi";
import { Badge } from "@shared/components/primitives/ui";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";

interface FingerprintsListProps {
  readonly fingerprints: readonly ErrorFingerprint[];
  readonly selectedFingerprint: string | null;
  readonly onSelect: (row: ErrorFingerprint) => void;
}

function FingerprintRow({
  row,
  selected,
  onClick,
}: {
  row: ErrorFingerprint;
  selected: boolean;
  onClick: () => void;
}) {
  const border = selected
    ? "border-[var(--color-primary)]"
    : "border-[var(--border-color)] hover:border-[var(--color-primary-subtle-45)]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-1 rounded-[var(--card-radius)] border bg-[var(--bg-tertiary)] px-3 py-2 text-left transition-colors hover:bg-[var(--bg-hover)] ${border}`}
    >
      <div className="flex items-center gap-2">
        <Badge variant="error">{row.exceptionType || "error"}</Badge>
        <span className="truncate font-medium text-[12px] text-[var(--text-primary)]">
          {row.operationName}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
        <span className="truncate">{row.statusMessage || "(no message)"}</span>
        <span className="shrink-0">
          {formatNumber(row.count)} · {formatRelativeTime(row.lastSeen)}
        </span>
      </div>
    </button>
  );
}

export default function FingerprintsList({
  fingerprints,
  selectedFingerprint,
  onSelect,
}: FingerprintsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {fingerprints.map((row) => (
        <FingerprintRow
          key={row.fingerprint}
          row={row}
          selected={row.fingerprint === selectedFingerprint}
          onClick={() => onSelect(row)}
        />
      ))}
    </div>
  );
}
