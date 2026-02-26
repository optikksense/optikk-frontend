import { useMemo } from 'react';
import { diffLines } from 'diff';

/**
 * Renders a side-by-side or unified diff of two YAML strings.
 * Added lines in green, removed in red, unchanged in gray.
 */
export default function YamlDiffViewer({ oldYaml = '', newYaml = '', title }) {
  const diffResult = useMemo(() => {
    return diffLines(oldYaml, newYaml);
  }, [oldYaml, newYaml]);

  const stats = useMemo(() => {
    let added = 0, removed = 0;
    for (const part of diffResult) {
      const lines = part.value.split('\n').filter(Boolean).length;
      if (part.added) added += lines;
      else if (part.removed) removed += lines;
    }
    return { added, removed };
  }, [diffResult]);

  return (
    <div className="yaml-diff-viewer">
      {title && <div className="yaml-diff-title">{title}</div>}
      <div className="yaml-diff-stats">
        <span style={{ color: '#73C991' }}>+{stats.added}</span>
        {' / '}
        <span style={{ color: '#F04438' }}>-{stats.removed}</span>
        {' lines changed'}
      </div>
      <pre className="yaml-diff-content">
        {diffResult.map((part, index) => {
          const lines = part.value.split('\n');
          // Remove trailing empty line from split
          if (lines[lines.length - 1] === '') lines.pop();

          return lines.map((line, li) => {
            let prefix = ' ';
            let className = 'diff-line-context';

            if (part.added) {
              prefix = '+';
              className = 'diff-line-added';
            } else if (part.removed) {
              prefix = '-';
              className = 'diff-line-removed';
            }

            return (
              <div key={`${index}-${li}`} className={className}>
                <span className="diff-prefix">{prefix}</span>
                <span className="diff-text">{line}</span>
              </div>
            );
          });
        })}
      </pre>

      <style>{`
        .yaml-diff-viewer {
          border: 1px solid var(--border-color, #2d2d3d);
          border-radius: 6px;
          overflow: hidden;
        }
        .yaml-diff-title {
          padding: 8px 12px;
          font-weight: 500;
          font-size: 13px;
          background: var(--bg-elevated, #1a1a2e);
          border-bottom: 1px solid var(--border-color, #2d2d3d);
        }
        .yaml-diff-stats {
          padding: 6px 12px;
          font-size: 12px;
          color: var(--text-muted, #888);
          background: var(--bg-elevated, #1a1a2e);
          border-bottom: 1px solid var(--border-color, #2d2d3d);
        }
        .yaml-diff-content {
          margin: 0;
          padding: 8px 0;
          font-size: 12px;
          line-height: 1.6;
          font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
          overflow-x: auto;
          max-height: 500px;
          overflow-y: auto;
          background: var(--bg-card, #16162a);
        }
        .diff-line-context {
          padding: 0 12px;
          color: var(--text-muted, #888);
        }
        .diff-line-added {
          padding: 0 12px;
          background: rgba(115, 201, 145, 0.1);
          color: #73C991;
        }
        .diff-line-removed {
          padding: 0 12px;
          background: rgba(240, 68, 56, 0.1);
          color: #F04438;
        }
        .diff-prefix {
          display: inline-block;
          width: 16px;
          text-align: center;
          margin-right: 8px;
          user-select: none;
        }
      `}</style>
    </div>
  );
}
