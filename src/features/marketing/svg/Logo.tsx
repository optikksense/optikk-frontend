export function Logo({ size = 22 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="optikk-logo-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#optikk-logo-grad)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" fill="url(#optikk-logo-grad)" />
    </svg>
  )
}
