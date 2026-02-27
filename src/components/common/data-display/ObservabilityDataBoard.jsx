import { useState, useRef, useCallback } from 'react';
import { Spin, Popover } from 'antd';
import { Settings2, Download, Search, Check, Filter, Copy, X, Clock } from 'lucide-react';
import './ObservabilityDataBoard.css';

/* ─── Board height helper ─────────────────────────────────────────────────── */
// Each data row is ~32px tall. The action bar + column header add ~72px fixed overhead.
// Use this in any page that wraps ObservabilityDataBoard so the container always
// fits exactly `pageSize` rows without an inner scrollbar.
const BOARD_ROW_HEIGHT = 32;
const BOARD_CHROME_HEIGHT = 72; // action bar (36px) + column header (36px)
export function boardHeight(pageSize) {
    return pageSize * BOARD_ROW_HEIGHT + BOARD_CHROME_HEIGHT;
}

/* ─── Utilities ───────────────────────────────────────────────────────────── */

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function loadPersistedCols(storageKey, defaults) {
    if (!storageKey) return defaults;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaults;
}

function savePersistedCols(storageKey, value) {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* ignore */ }
}

/* ─── Clickable cell — shows filter icon on hover ────────────────────────── */
export function BoardClickableCell({ field, value, onAddFilter, children, style = {} }) {
    if (!onAddFilter || !value || value === '-') {
        return <span style={style}>{children}</span>;
    }
    return (
        <span
            className="oboard__clickable-cell"
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onAddFilter({ field, value, operator: 'equals' });
            }}
            title={`Filter: ${field} = "${value}"`}
        >
            {children}
            <Filter size={10} className="oboard__filter-icon" />
        </span>
    );
}

/* ─── Copyable field value used inside the detail panel ─────────────────── */
function CopyableValue({ value }) {
    const [copied, setCopied] = useState(false);
    if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return (
        <div
            className="oboard__detail-field-value"
            onClick={() => {
                navigator.clipboard?.writeText(String(value)).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }).catch(() => { });
            }}
            title="Click to copy"
        >
            <span>{String(value)}</span>
            {copied
                ? <Check size={10} style={{ marginLeft: 6, color: 'var(--color-success)' }} />
                : <Copy size={10} style={{ marginLeft: 6, opacity: 0.35 }} />
            }
        </div>
    );
}

/* ─── Detail Panel ───────────────────────────────────────────────────────── */
/**
 * ObservabilityDetailPanel
 *
 * Slide-in right panel for any row detail.
 *
 * @param {string}   title         e.g. "Log Detail" / "Trace Detail"
 * @param {ReactNode} titleBadge   e.g. a level badge
 * @param {string}   metaLine      text shown in the timestamp/meta bar
 * @param {string}   metaRight     right-aligned meta (e.g. "3m ago")
 * @param {string}   summary       message / operation text block
 * @param {ReactNode} summaryNode  alternative rich summary node
 * @param {Array<{label, value, filterable?, key}>} fields
 * @param {ReactNode} actions      buttons below summary
 * @param {object}   rawData       passed to JSON tab
 * @param {Function} onClose
 * @param {Function} onAddFilter
 */
export function ObservabilityDetailPanel({
    title = 'Detail',
    titleBadge,
    metaLine,
    metaRight,
    summary,
    summaryNode,
    fields = [],
    actions,
    rawData,
    onClose,
    onAddFilter,
}) {
    const [tab, setTab] = useState('fields');

    return (
        <div className="oboard__detail-overlay" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="oboard__detail-header">
                <div className="oboard__detail-title">
                    {title}
                    {titleBadge}
                </div>
                <button className="oboard__detail-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            {/* Meta bar */}
            {metaLine && (
                <div className="oboard__detail-meta">
                    <Clock size={12} />
                    <span>{metaLine}</span>
                    {metaRight && <span className="oboard__detail-meta-right">{metaRight}</span>}
                </div>
            )}

            {/* Summary block */}
            {(summary || summaryNode) && (
                <div className="oboard__detail-summary">
                    {summaryNode || summary}
                </div>
            )}

            {/* Action buttons */}
            {actions && (
                <div className="oboard__detail-actions">{actions}</div>
            )}

            {/* Tabs */}
            <div className="oboard__detail-tabs">
                {['Fields', 'JSON'].map((t) => (
                    <button
                        key={t}
                        className={`oboard__detail-tab ${tab === t.toLowerCase() ? 'oboard__detail-tab--active' : ''}`}
                        onClick={() => setTab(t.toLowerCase())}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="oboard__detail-body">
                {tab === 'fields' && (
                    <div className="oboard__detail-fields">
                        {fields.map(({ key, label, value, filterable }) => (
                            <div key={key} className="oboard__detail-field">
                                <div className="oboard__detail-field-label">
                                    {label}
                                    {filterable && value && onAddFilter && (
                                        <button
                                            className="oboard__detail-filter-btn"
                                            onClick={() => onAddFilter({ field: key, value, operator: 'equals' })}
                                            title={`Filter by ${label} = "${value}"`}
                                        >
                                            <Filter size={10} />
                                        </button>
                                    )}
                                </div>
                                <CopyableValue value={value} />
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'json' && (
                    <pre className="oboard__detail-json">
                        {JSON.stringify(rawData, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}

/* ─── Main Board ─────────────────────────────────────────────────────────── */
/**
 * ObservabilityDataBoard
 *
 * Generic enterprise data board with:
 *  - Configurable, resizable, draggable columns (persisted to localStorage)
 *  - Action bar with row count, export (CSV/JSON), column settings
 *  - Sticky column header with resize handles
 *  - Row renderer via `renderRow` prop — renders the flex row body
 *  - Shimmer skeleton loading state
 *  - Rich empty state with numbered tips
 *  - Load-more button (infinite scroll compatible)
 *
 * @param {Array}    columns       definition: [{key, label, defaultWidth, defaultVisible, flex?}]
 * @param {Array}    rows          data rows to render
 * @param {Function} rowKey        (row, i) => string unique key
 * @param {Function} renderRow     (row, {colWidths, visibleCols, onAddFilter}) => ReactNode TD cells
 * @param {string}   entityName    e.g. "log" / "trace" — used in empty state and export filenames
 * @param {string}   storageKey    localStorage key for column visibility persistence
 * @param {boolean}  isLoading
 * @param {number}   serverTotal    total from backend
 * @param {boolean}  hasNextPage
 * @param {boolean}  isFetchingNextPage
 * @param {Function} fetchNextPage
 * @param {Function} exportRowsAsCSV  optional override — default uses JSON.stringify each col
 * @param {Array}    emptyTips     [{icon, text}] shown in empty state
 * @param {Function} onAddFilter   propagated to renderRow and ClickableCell
 * @param {ReactNode} extraActions  placed right of export button in action bar
 */
export default function ObservabilityDataBoard({
    columns = [],
    rows = [],
    rowKey = (row, i) => i,
    renderRow,
    entityName = 'item',
    storageKey,
    isLoading = false,
    serverTotal,
    hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage,
    exportRowsAsCSV,
    emptyTips,
    onAddFilter,
    extraActions,
}) {
    /* ── Column widths (resizable) ── */
    const defaultWidths = Object.fromEntries(
        columns.map((c) => [c.key, c.defaultWidth || 160])
    );
    const [colWidths, setColWidths] = useState(defaultWidths);

    /* ── Column visibility (persisted) ── */
    const defaultVisible = Object.fromEntries(
        columns.map((c) => [c.key, c.defaultVisible !== false])
    );
    const [visibleCols, setVisibleCols] = useState(() =>
        loadPersistedCols(storageKey, defaultVisible)
    );

    const updateVisibleCols = useCallback((updater) => {
        setVisibleCols((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            savePersistedCols(storageKey, next);
            return next;
        });
    }, [storageKey]);

    /* ── Column resize ── */
    const handleResizeMouseDown = useCallback((e, colKey) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = colWidths[colKey];

        const onMove = (moveEvent) => {
            const diff = moveEvent.clientX - startX;
            setColWidths((prev) => ({ ...prev, [colKey]: Math.max(60, startWidth + diff) }));
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [colWidths]);

    /* ── Export ── */
    const handleExportCSV = useCallback(() => {
        if (!rows.length) return;
        if (exportRowsAsCSV) { exportRowsAsCSV(rows); return; }
        const visKeys = columns.filter((c) => visibleCols[c.key]).map((c) => c.key);
        const header = visKeys.join(',');
        const data = rows.map((row) =>
            visKeys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')
        );
        downloadFile([header, ...data].join('\n'), `${entityName}-${Date.now()}.csv`, 'text/csv');
    }, [rows, columns, visibleCols, exportRowsAsCSV, entityName]);

    const handleExportJSON = useCallback(() => {
        if (!rows.length) return;
        downloadFile(JSON.stringify(rows, null, 2), `${entityName}-${Date.now()}.json`, 'application/json');
    }, [rows, entityName]);

    const visibleColumns = columns.filter((c) => visibleCols[c.key]);
    const fixedColumns = visibleColumns.filter((c) => !c.flex);
    const flexColumn = visibleColumns.find((c) => c.flex);

    const displayCount = rows.length;
    const total = serverTotal ?? displayCount;

    const defaultEmptyTips = [
        { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
        { num: 2, text: <>Remove active <strong>filters</strong> from the query bar</> },
        { num: 3, text: <>Ensure your services are sending telemetry via <strong>OTLP</strong></> },
    ];

    const tips = emptyTips || defaultEmptyTips;

    return (
        <div className="oboard">
            {/* ── Action Bar ── */}
            <div className="oboard__action-bar">
                <div className="oboard__count">
                    <span className="oboard__count-dot" />
                    <span className="oboard__count-label">
                        {displayCount.toLocaleString()} {entityName}{displayCount !== 1 ? 's' : ''}
                    </span>
                    {total > 0 && total !== displayCount && (
                        <span className="oboard__count-total">of {total.toLocaleString()}</span>
                    )}
                </div>

                <div className="oboard__actions">
                    {extraActions}

                    <Popover
                        content={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
                                <button className="oboard__btn" onClick={handleExportCSV} disabled={!rows.length} style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Export as CSV
                                </button>
                                <button className="oboard__btn" onClick={handleExportJSON} disabled={!rows.length} style={{ width: '100%', justifyContent: 'flex-start' }}>
                                    Export as JSON
                                </button>
                            </div>
                        }
                        title={`Export ${entityName}s`}
                        trigger="click"
                        placement="bottomRight"
                    >
                        <button className="oboard__btn" disabled={!rows.length}>
                            <Download size={13} /> Export
                        </button>
                    </Popover>

                    <Popover
                        content={
                            <div className="oboard__col-settings">
                                {columns.map((col) => {
                                    const checked = !!visibleCols[col.key];
                                    return (
                                        <div
                                            key={col.key}
                                            className={`oboard__col-setting-item ${checked ? 'checked' : ''}`}
                                            onClick={() =>
                                                updateVisibleCols((prev) => ({ ...prev, [col.key]: !prev[col.key] }))
                                            }
                                        >
                                            <span className="oboard__col-cb">{checked ? <Check size={9} /> : null}</span>
                                            {col.label}
                                        </div>
                                    );
                                })}
                            </div>
                        }
                        title="Columns"
                        trigger="click"
                        placement="bottomRight"
                    >
                        <button className="oboard__btn">
                            <Settings2 size={13} /> Columns
                        </button>
                    </Popover>
                </div>
            </div>

            {/* ── Table Area ── */}
            <div className="oboard__table">
                {isLoading && !rows.length ? (
                    /* Loading skeleton */
                    <div>
                        <div className="oboard__thead">
                            {fixedColumns.map((c) => (
                                <div key={c.key} className="oboard__th" style={{ width: colWidths[c.key] }}>{c.label}</div>
                            ))}
                            {flexColumn && <div className="oboard__th oboard__th--flex">{flexColumn.label}</div>}
                        </div>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="oboard__row" style={{ padding: '10px 12px', gap: 16 }}>
                                {fixedColumns.map((c) => (
                                    <div key={c.key} style={{ width: colWidths[c.key], flexShrink: 0 }}>
                                        <div className="oboard__skeleton" style={{ width: `${50 + Math.random() * 40}%` }} />
                                    </div>
                                ))}
                                {flexColumn && (
                                    <div style={{ flex: 1 }}>
                                        <div className="oboard__skeleton" style={{ width: `${55 + Math.random() * 35}%` }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : !rows.length ? (
                    /* Empty state */
                    <div className="oboard__empty">
                        <div className="oboard__empty-icon"><Search size={44} strokeWidth={1} /></div>
                        <div className="oboard__empty-title">No {entityName}s found</div>
                        <div className="oboard__empty-subtitle">
                            No {entityName}s matched your current filters and time range.
                        </div>
                        <div className="oboard__empty-tips">
                            {tips.map((tip, i) => (
                                <div key={i} className="oboard__empty-tip">
                                    <span className="oboard__empty-tip-num">{tip.num ?? i + 1}</span>
                                    <span>{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="oboard__tbody">
                        {/* Sticky header */}
                        <div className="oboard__thead">
                            {fixedColumns.map((c) => (
                                <div key={c.key} className="oboard__th" style={{ width: colWidths[c.key] }}>
                                    {c.label}
                                    <div
                                        className="oboard__resizer"
                                        onMouseDown={(e) => handleResizeMouseDown(e, c.key)}
                                    />
                                </div>
                            ))}
                            {flexColumn && (
                                <div className="oboard__th oboard__th--flex">{flexColumn.label}</div>
                            )}
                        </div>

                        {/* Rows */}
                        {rows.map((row, i) => (
                            <div key={rowKey(row, i)} className="oboard__row">
                                {renderRow(row, { colWidths, visibleCols, onAddFilter })}
                            </div>
                        ))}

                        {/* Load more */}
                        {hasNextPage && (
                            <div className="oboard__load-more">
                                <button
                                    className="oboard__load-more-btn"
                                    onClick={() => fetchNextPage?.()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage
                                        ? <><Spin size="small" style={{ marginRight: 8 }} />Loading…</>
                                        : `Load older ${entityName}s`
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
