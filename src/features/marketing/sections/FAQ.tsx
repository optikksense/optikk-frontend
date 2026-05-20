import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

interface FaqItem {
  readonly question: string;
  readonly answer: ReactNode;
}

interface FAQProps {
  readonly items: readonly FaqItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="m-faq">
      {items.map((item, idx) => {
        const open = openIdx === idx;
        return (
          <div key={item.question} className={`m-faq-item${open ? " is-open" : ""}`}>
            <button
              type="button"
              className="m-faq-q"
              aria-expanded={open}
              onClick={() => setOpenIdx(open ? null : idx)}
            >
              <span>{item.question}</span>
              <span className="m-faq-icon">
                <ChevronDown size={18} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="content"
                  initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.2, 0.7, 0.1, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="m-faq-a">{item.answer}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
