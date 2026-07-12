// Abstract, non-trademarked provider marks (ported from the design). These are
// deliberately not the official AWS/GCP/Azure logos.

interface ProviderMarkProps {
  provider: string;
  size?: number;
}

export function ProviderMark({ provider, size = 22 }: ProviderMarkProps): JSX.Element | null {
  if (provider === "aws") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2.5" y="3.5" width="8" height="8" rx="1.5" fill="#f59e0b" />
        <rect x="13.5" y="3.5" width="8" height="8" rx="1.5" fill="#fb923c" opacity="0.85" />
        <rect x="8" y="12.5" width="8" height="8" rx="1.5" fill="#f97316" />
      </svg>
    );
  }
  if (provider === "gcp") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8" cy="9" r="4.5" fill="#34d399" />
        <circle cx="15" cy="9" r="4.5" fill="#60a5fa" opacity="0.9" />
        <circle cx="12" cy="15.5" r="4.5" fill="#fbbf24" opacity="0.95" />
      </svg>
    );
  }
  if (provider === "azure") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 19L11 4l4 8-5 7H3z" fill="#60a5fa" />
        <path d="M21 19L13 6l-2 4 6 9h4z" fill="#22d3ee" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
