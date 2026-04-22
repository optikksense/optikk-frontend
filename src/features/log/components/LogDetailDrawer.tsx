import { DetailAttributesTab } from "@/features/explorer/components/detail/DetailAttributesTab";

interface Props {
  readonly logId: string;
  readonly onClose: () => void;
}

/**
 * Inner body of the logs detail drawer. The chrome (slide-in, close button,
 * title) is provided by `DetailDrawer` in the page layout; this component
 * renders only tab content so deep-links can pick it up independently.
 *
 * v1 shows an empty attributes tab as a placeholder; follow-up wires the
 * `GET /api/v1/logs/:id` deep-link fetch to populate attribute groups.
 */
export default function LogDetailDrawer({ logId, onClose }: Props) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--text-tertiary)]">{logId}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Close
        </button>
      </div>
      <DetailAttributesTab groups={[]} />
    </div>
  );
}
