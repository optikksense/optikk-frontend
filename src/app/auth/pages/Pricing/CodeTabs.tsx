import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CodeTab {
  id: string;
  label: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
}

export default function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeContent = tabs.find((t) => t.id === activeTab)!;

  const handleCopy = () => {
    void navigator.clipboard.writeText(activeContent.code).then(() => {
      setCopiedId(activeContent.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="font-mono" style={{
      background: '#0D0E14',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Chrome header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#161720', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'transparent', border: 'none',
                padding: '12px 20px', fontSize: 13,
                color: activeTab === t.id ? '#22D3EE' : '#64748B',
                cursor: 'pointer', position: 'relative',
                fontFamily: 'inherit', transition: 'color 0.2s',
              }}
            >
              {activeTab === t.id ? (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#22D3EE',
                  }}
                />
              ) : null}
              {t.label}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <div style={{ paddingRight: 12 }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '6px 10px', color: '#94A3B8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
              fontSize: 11, fontFamily: 'inherit',
            }}
          >
            {copiedId === activeContent.id ? (
              <><Check size={14} color="#10B981" /> Copied</>
            ) : (
              <><Copy size={14} /> Copy</>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div style={{ position: 'relative', minHeight: 320, padding: 0 }}>
        <div
          key={activeTab}
          style={{
            padding: 16,
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}
        >
          <div
            aria-label={`${activeContent.label} code sample`}
            style={{
              margin: 0,
              background: 'transparent',
              padding: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: '#d5def5',
              overflowX: 'auto',
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre',
                fontFamily: 'inherit',
              }}
            >
              <code>{activeContent.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
