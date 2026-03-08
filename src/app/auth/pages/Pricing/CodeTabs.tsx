import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div style={{
      background: '#0D0E14',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
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
              {activeTab === t.id && (
                <motion.div
                  layoutId="active-tab-indicator"
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2, background: '#22D3EE',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ padding: 16 }}
          >
            <SyntaxHighlighter
              language={activeContent.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0, background: 'transparent', padding: 0,
                fontSize: 13, lineHeight: 1.5,
              }}
              codeTagProps={{ style: { fontFamily: "'JetBrains Mono', monospace" } }}
            >
              {activeContent.code}
            </SyntaxHighlighter>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
