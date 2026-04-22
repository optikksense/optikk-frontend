import { memo, type ReactNode } from "react";

export interface OverviewField {
  readonly key: string;
  readonly label: string;
  readonly value: ReactNode;
}

interface Props {
  readonly fields: readonly OverviewField[];
  readonly footer?: ReactNode;
}

/**
 * Summary panel — key fields on one side, optional footer (e.g. copy-all,
 * cross-signal jump buttons) on the bottom. Scope-agnostic.
 */
function DetailOverviewTabComponent({ fields, footer }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 text-[12px]">
        {fields.map((field) => (
          <div key={field.key} className="contents">
            <dt className="truncate text-[var(--text-secondary)]" title={field.label}>
              {field.label}
            </dt>
            <dd className="min-w-0 break-words font-mono text-[var(--text-primary)]">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
      {footer ? (
        <div className="border-t border-[var(--border-color)] pt-2">{footer}</div>
      ) : null}
    </div>
  );
}

export const DetailOverviewTab = memo(DetailOverviewTabComponent);
