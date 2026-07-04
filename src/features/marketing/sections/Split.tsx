import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";


import { Reveal } from "../motion/Reveal";

interface SplitListItem {
  readonly title?: ReactNode;
  readonly body: ReactNode;
}

interface SplitProps {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly body?: ReactNode;
  readonly list?: readonly SplitListItem[];
  readonly link?: { readonly label: string; readonly path: string };
  readonly visual: ReactNode;
  readonly reverse?: boolean;
  readonly id?: string;
}

export function Split({ eyebrow, title, body, list, link, visual, reverse, id }: SplitProps) {
  return (
    <section id={id} className={`m-split${reverse ? " is-reverse" : ""}`}>
      <Reveal className="m-split-copy">
        {eyebrow ? (
          <span className="m-eyebrow">
            <span className="m-eyebrow-dot" />
            {eyebrow}
          </span>
        ) : null}
        <h2 className="m-h2">{title}</h2>
        {body ? <p className="m-lede">{body}</p> : null}
        {list && list.length > 0 ? (
          <ul className="m-split-list">
            {list.map((item, idx) => (
              <li key={idx}>
                <span>
                  <Check size={14} strokeWidth={3} />
                </span>
                <div>
                  {item.title ? <strong>{item.title}</strong> : null}
                  <span>{item.body}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {link ? (
          link.path.startsWith("http") || link.path.includes("#") ? (
            <a className="m-btn m-btn-secondary m-btn-sm" href={link.path}>
              {link.label} <ArrowRight size={14} />
            </a>
          ) : (
            <Link className="m-btn m-btn-secondary m-btn-sm" to={(link.path as string & {})}>
              {link.label} <ArrowRight size={14} />
            </Link>
          )
        ) : null}
      </Reveal>

      <Reveal delay={0.1} className="m-split-visual">
        {visual}
      </Reveal>
    </section>
  );
}
