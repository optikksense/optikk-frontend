import { memo } from "react";

export const MissingMetadataState = memo(function MissingMetadataState() {
  return (
    <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
      Deployment metadata is missing, so the compare view cannot be opened from this link.
    </div>
  );
});

export const LoadingState = memo(function LoadingState() {
  return (
    <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
      Loading deployment comparison…
    </div>
  );
});

export const ErrorState = memo(function ErrorState() {
  return (
    <div className="px-6 py-6 text-[13px] text-[var(--color-error)]">
      Deployment comparison is unavailable right now.
    </div>
  );
});

export const NoDataState = memo(function NoDataState() {
  return (
    <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
      No deployment comparison data was returned for this release.
    </div>
  );
});
