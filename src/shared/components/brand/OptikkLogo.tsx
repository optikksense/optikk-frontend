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
      viewBox="0 0 32 32"
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
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0f766e" />
          <stop offset="0.58" stopColor="#2563eb" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="7" fill={`url(#${gradientId})`} />
      <path
        d="M9 16h14M16 9v14"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.82"
      />
      <circle
        cx="16"
        cy="16"
        r="5.2"
        fill="white"
        fillOpacity="0.18"
        stroke="white"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="2.2" fill="white" />
    </svg>
  );
}
