import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useRef } from "react";

interface MagneticButtonProps {
  readonly children: ReactNode;
  readonly strength?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function MagneticButton({ children, strength = 18, className, style }: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 240, damping: 18 });
  const y = useSpring(my, { stiffness: 240, damping: 18 });

  function onMouseMove(event: MouseEvent<HTMLSpanElement>) {
    if (prefersReducedMotion) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mx.set(dx * strength);
    my.set(dy * strength);
  }

  function onMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: "inline-flex",
        x: prefersReducedMotion ? 0 : x,
        y: prefersReducedMotion ? 0 : y,
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
