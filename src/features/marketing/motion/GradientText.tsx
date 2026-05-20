import type { ReactNode } from "react";

interface GradientTextProps {
  readonly children: ReactNode;
  readonly animate?: boolean;
  readonly className?: string;
}

export function GradientText({ children, animate = true, className }: GradientTextProps) {
  return (
    <span
      className={["m-grad-text", animate ? "m-grad-text-anim" : "", className ?? ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
