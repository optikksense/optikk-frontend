import React, { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './OptiQLSearchBar.css';

export interface OptiQLSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSearch?: (val: string) => void;
  placeholder?: string;
}

const COMMON_KEYS = ['service', 'level', 'host', 'pod', 'container', 'traceId', 'spanId'];

export default function OptiQLSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search logs with OptiQL (e.g. service="api" level:error "timeout")',
}: OptiQLSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Resize textarea height dynamically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '24px';
      if (inputRef.current.scrollHeight > 24) {
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSearch?.(value);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (key: string) => {
    // Append the key to the current value
    const prefix = value.endsWith(' ') || value === '' ? '' : ' ';
    const newValue = `${value}${prefix}${key}=`;
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Syntax highlighting render
  const renderHighlightedText = () => {
    if (!value) return null;

    const tokenRegex = /(?:([!-])?([\w.]+)(:|!=|~=|!:=|=)(?:"([^"]*)"|([^"\s]+)))|(?:"([^"]*)")|([^\s]+)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    try {
      while ((match = tokenRegex.exec(value)) !== null) {
        // Add preceding whitespace
        if (match.index > lastIndex) {
          elements.push(<span key={`ws-${lastIndex}`}>{value.slice(lastIndex, match.index)}</span>);
        }

        const [
          matchedStr,
          negation,
          key,
          operator,
          quotedVal,
          unquotedVal,
          freeQuoted,
          freeUnquoted,
        ] = match;

        if (freeQuoted !== undefined || freeUnquoted !== undefined) {
          // Free text
          elements.push(
            <span key={`free-${match.index}`} className="optiql-token-freetext">
              {matchedStr}
            </span>
          );
        } else if (key) {
          // Key-Value pair
          elements.push(
            <span key={`kv-${match.index}`}>
              {negation && <span className="optiql-token-negation">{negation}</span>}
              <span className="optiql-token-key">{key}</span>
              <span className="optiql-token-operator">{operator}</span>
              {quotedVal !== undefined && <span className="optiql-token-value-string">"{quotedVal}"</span>}
              {unquotedVal !== undefined && <span className="optiql-token-value-unquoted">{unquotedVal}</span>}
            </span>
          );
        } else {
          // Fallback
          elements.push(<span key={`fb-${match.index}`}>{matchedStr}</span>);
        }

        lastIndex = match.index + matchedStr.length;
      }

      // Add trailing whitespace
      if (lastIndex < value.length) {
        elements.push(<span key={`ws-${lastIndex}`}>{value.slice(lastIndex)}</span>);
      }
    } catch (e) {
      // safe fallback on regex error
      return <span>{value}</span>;
    }

    // Add trailing space for proper cursor positioning if the value ends with newlines/spaces
    if (value.endsWith('\n')) elements.push(<span key="trailing-nl"><br/></span>);

    return elements;
  };

  return (
    <div className="optiql-container">
      <Search className="optiql-icon" size={16} />
      <div className="optiql-input-wrapper">
        <textarea
          ref={inputRef}
          className="optiql-input"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(e.target.value.trim() === '' || e.target.value.endsWith(' '));
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(value.trim() === '' || value.endsWith(' '));
          }}
          onBlur={() => {
            setIsFocused(false);
            // delay hiding so clicks can register
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="optiql-syntax-layer" aria-hidden="true">
          {renderHighlightedText()}
        </div>

        {/* Suggestions Popover */}
        {showSuggestions && isFocused && (
          <div className="optiql-suggestions">
            <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested Keys
            </div>
            {COMMON_KEYS.map((k) => (
              <div
                key={k}
                className="optiql-suggestion-item"
                onClick={() => handleSuggestionClick(k)}
              >
                <div className="optiql-token-key">{k}</div>
                <div style={{ flex: 1 }}></div>
                <div className="optiql-suggestion-type">Field</div>
              </div>
            ))}
            <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)' }}>
              Tip: Press Enter to search
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
