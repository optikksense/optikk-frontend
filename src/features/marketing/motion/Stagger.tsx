import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly gap?: number;
  readonly as?: "div" | "ul" | "section";
}

export function Stagger({ children, className, delay = 0, gap = 0.08, as = "div" }: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: gap,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

const childVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.2, 0.7, 0.1, 1] as const },
  },
};

interface StaggerItemProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: "div" | "li" | "article" | "section" | "header";
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag className={className} variants={childVariants}>
      {children}
    </MotionTag>
  );
}
