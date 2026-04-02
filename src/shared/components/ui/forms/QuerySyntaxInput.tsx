import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import type { QueryFieldOption } from '@/features/explorer-core/constants/fields';

interface QuerySyntaxInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  fields: readonly QueryFieldOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Chained after internal handling (e.g. filter chip backspace from useQueryBarState). */
  onCompositeKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

function highlightQuery(text: string): JSX.Element {
  if (!text) {
    return <span className="text-[var(--text-muted)]"> </span>;
  }

  const parts: JSX.Element[] = [];
  const token = /(\bAND\b|\bOR\b)|(-?)([\w.@]+)\s*:\s*("(?:\\.|[^"])*"|[^\s)]+)|([^\s]+)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const pushRaw = (from: number, to: number): void => {
    if (from < to) {
      parts.push(
        <span key={`t-${key++}`} className="text-[var(--text-primary)]">
          {text.slice(from, to)}
        </span>
      );
    }
  };

  while ((match = token.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushRaw(lastIndex, match.index);
    }
    const full = match[0];
    if (match[1]) {
      parts.push(
        <span key={`t-${key++}`} className="text-[var(--color-info)] font-semibold">
          {full}
        </span>
      );
    } else if (match[3] !== undefined) {
      const neg = match[2] || '';
      const field = match[3];
      const rest = full.slice(neg.length + field.length + 1).trimStart();
      const sepIdx = full.indexOf(':');
      const afterColon = sepIdx >= 0 ? full.slice(sepIdx + 1) : '';
      parts.push(
        <span key={`t-${key++}`}>
          {neg ? <span className="text-[var(--color-warning)]">{neg}</span> : null}
          <span className="text-[var(--color-accent)]">{field}</span>
          <span className="text-[var(--text-muted)]">:</span>
          <span className="text-[var(--text-secondary)]">{afterColon.replace(/^\s*/, '')}</span>
        </span>
      );
    } else if (match[5]) {
      parts.push(
        <span key={`t-${key++}`} className="text-[var(--text-secondary)]">
          {match[5]}
        </span>
      );
    } else {
      parts.push(
        <span key={`t-${key++}`} className="text-[var(--text-primary)]">
          {full}
        </span>
      );
    }
    lastIndex = match.index + full.length;
  }
  pushRaw(lastIndex, text.length);

  return <>{parts}</>;
}

function wordBeforeCursor(text: string, cursor: number): { start: number; word: string } {
  let start = cursor;
  while (start > 0 && /[^\s():]/.test(text[start - 1] ?? '')) {
    start--;
  }
  return { start, word: text.slice(start, cursor) };
}

export default function QuerySyntaxInput({
  value,
  onChange,
  onSubmit,
  fields,
  placeholder = 'service:my-app AND status:error',
  className = '',
  disabled = false,
  onCompositeKeyDown,
}: QuerySyntaxInputProps): JSX.Element {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [cursorPos, setCursorPos] = useState(0);

  const suggestions = useMemo(() => {
    const { word } = wordBeforeCursor(value, cursorPos);
    if (word.includes(':')) return [];
    const q = word.toLowerCase();
    if (q.length < 1) return [];
    return fields.filter(
      (f) => f.name.toLowerCase().startsWith(q) || f.name.toLowerCase().includes(q)
    );
  }, [fields, value, cursorPos]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length]);

  const applyField = useCallback(
    (name: string): void => {
      const el = taRef.current;
      if (!el) return;
      const cursor = el.selectionStart ?? value.length;
      const { start } = wordBeforeCursor(value, cursor);
      const next = `${value.slice(0, start)}${name}:${value.slice(cursor)}`;
      onChange(next);
      setOpen(false);
      requestAnimationFrame(() => {
        const pos = start + name.length + 1;
        el.focus();
        el.setSelectionRange(pos, pos);
        setCursorPos(pos);
      });
    },
    [onChange, value]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const raw = e.target.value;
    onChange(raw);
    const c = e.target.selectionStart ?? raw.length;
    setCursorPos(c);
    const { word } = wordBeforeCursor(raw, c);
    const q = word.toLowerCase();
    const sug =
      !word.includes(':') && q.length >= 1
        ? fields.filter(
            (f) => f.name.toLowerCase().startsWith(q) || f.name.toLowerCase().includes(q)
          )
        : [];
    setOpen(sug.length > 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (open && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        applyField(suggestions[activeIndex]?.name ?? suggestions[0]?.name ?? '');
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onCompositeKeyDown?.(e);
  };

  return (
    <div className={cn('relative min-w-[200px] flex-1', className)} data-query-syntax>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-md border border-transparent px-3 py-2 font-mono text-[13px] leading-[1.45] whitespace-pre-wrap break-words text-left"
        aria-hidden
      >
        {value ? (
          highlightQuery(value)
        ) : (
          <span className="text-[var(--text-muted)]">{placeholder}</span>
        )}
      </div>
      <textarea
        ref={taRef}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onSelect={(e) => {
          const c = e.currentTarget.selectionStart ?? value.length;
          setCursorPos(c);
          const { word } = wordBeforeCursor(value, c);
          const q = word.toLowerCase();
          const sug =
            !word.includes(':') && q.length >= 1
              ? fields.filter(
                  (f) => f.name.toLowerCase().startsWith(q) || f.name.toLowerCase().includes(q)
                )
              : [];
          setOpen(sug.length > 0);
        }}
        spellCheck={false}
        rows={1}
        className={cn(
          'relative z-[1] min-h-[38px] w-full resize-y bg-transparent px-3 py-2 font-mono text-[13px] leading-[1.45] text-transparent caret-[var(--text-primary)] outline-none',
          'placeholder:text-transparent'
        )}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-expanded={open}
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-[80] mt-1 max-h-[220px] overflow-auto rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-lg"
        >
          {suggestions.map((f, i) => (
            <li key={f.name}>
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-[12px]',
                  i === activeIndex
                    ? 'bg-[rgba(77,166,200,0.18)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)]'
                )}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  applyField(f.name);
                }}
              >
                <span className="font-mono text-[var(--color-accent)]">{f.name}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{f.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
