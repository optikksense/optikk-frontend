import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  readonly children: ReactNode;
  readonly delay?: number;
  readonly y?: number;
  readonly className?: string;
  readonly as?: "div" | "section" | "header" | "li" | "article" | "span";
}

export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.2, 0.7, 0.1, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
