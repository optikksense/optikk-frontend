import { useId } from "react";

interface OptikkLogoProps {
  readonly size?: number;
  readonly className?: string;
  readonly title?: string;
}

export function OptikkLogo({ size = 24, className, title }: OptikkLogoProps) {
  const gradientId = useId().replaceAll(":", "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5B5FD6" />
          <stop offset="100%" stopColor="#4FA9D8" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="512" height="512" rx="80" fill={`url(#${gradientId})`} />

      {}
      <polygon
        points="256,95 390,165 256,235 122,165"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinejoin="round"
      />

      {}
      <polyline
        points="140,220 256,280 372,220"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {}
      <polyline
        points="140,280 256,340 372,280"
        fill="none"
        stroke="white"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
