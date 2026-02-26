/**
 * Shared utility functions for log data processing.
 * Reusable across LogsPage, LogRow, LogsRawView, and future pages.
 */

// ── Response page parsing ──────────────────────────────────────────────────

export function getLogsFromPage(page) {
  if (!page || typeof page !== 'object') return [];
  if (Array.isArray(page.logs)) return page.logs;
  if (Array.isArray(page.items)) return page.items;
  if (Array.isArray(page.rows)) return page.rows;
  return [];
}

export function getHasMoreFromPage(page, allPages, pageSize) {
  const explicitFlags = [
    page?.hasMore,
    page?.has_more,
    page?.pagination?.hasMore,
    page?.pagination?.has_more,
  ];

  const explicitFlag = explicitFlags.find((value) => typeof value === 'boolean');
  if (typeof explicitFlag === 'boolean') return explicitFlag;

  const pageLogs = getLogsFromPage(page);
  const totalCandidates = [
    page?.total,
    page?.totalCount,
    page?.total_count,
    page?.pagination?.total,
    page?.pagination?.totalCount,
    page?.pagination?.total_count,
  ];

  for (const candidate of totalCandidates) {
    const total = Number(candidate);
    if (Number.isFinite(total) && total >= 0) {
      const loadedCount = (allPages || []).reduce((acc, currentPage) => {
        return acc + getLogsFromPage(currentPage).length;
      }, 0);
      return loadedCount < total;
    }
  }

  return pageLogs.length >= pageSize;
}

export function getNextCursorFromPage(page) {
  const pageLogs = getLogsFromPage(page);
  const candidates = [
    page?.nextCursor,
    page?.next_cursor,
    page?.pagination?.nextCursor,
    page?.pagination?.next_cursor,
  ];

  for (const candidate of candidates) {
    if (candidate != null && candidate !== '' && candidate !== 0 && candidate !== '0') {
      return candidate;
    }
  }

  const tailId = pageLogs[pageLogs.length - 1]?.id;
  if (tailId != null && tailId !== 0 && tailId !== '0') {
    return tailId;
  }

  return undefined;
}

// ── Timestamp parsing ──────────────────────────────────────────────────────

export function parseTimestampMs(value) {
  if (value == null || value === '') return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e18) return Math.floor(value / 1e6); // ns -> ms
    if (value > 1e15) return Math.floor(value / 1e3); // us -> ms
    return Math.floor(value); // already ms
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (/^-?\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (Number.isFinite(n)) {
        if (n > 1e18) return Math.floor(n / 1e6);
        if (n > 1e15) return Math.floor(n / 1e3);
        return Math.floor(n);
      }
    }

    let parsed = Date.parse(trimmed);
    if (!Number.isFinite(parsed)) {
      parsed = Date.parse(trimmed.replace(' ', 'T'));
    }
    if (Number.isFinite(parsed)) return parsed;

    const m = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z)?$/
    );
    if (m) {
      const [, y, mo, d, h, mi, s, frac = '', z] = m;
      const ms = Number((frac + '000').slice(0, 3));
      if (z === 'Z') {
        return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms);
      }
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms).getTime();
    }
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }

  return 0;
}

export function getTimestampMs(log) {
  return parseTimestampMs(log?.timestamp);
}

// ── BigInt ID comparison ───────────────────────────────────────────────────

export function toBigIntId(id) {
  if (id == null || id === '') return null;
  if (typeof id === 'bigint') return id;
  if (typeof id === 'number' && Number.isFinite(id)) return BigInt(Math.trunc(id));
  if (typeof id === 'string' && /^-?\d+$/.test(id)) {
    try {
      return BigInt(id);
    } catch {
      return null;
    }
  }
  return null;
}

export function compareIdsDesc(aId, bId) {
  const aBig = toBigIntId(aId);
  const bBig = toBigIntId(bId);

  if (aBig != null && bBig != null) {
    if (aBig === bBig) return 0;
    return aBig > bBig ? -1 : 1;
  }

  const aStr = String(aId ?? '');
  const bStr = String(bId ?? '');
  if (aStr === bStr) return 0;
  return bStr.localeCompare(aStr);
}

// ── Log field accessor (shared across LogRow, LogsRawView) ─────────────────

export function getLogValue(log, key) {
  if (!log) return '';
  if (key === 'service_name' || key === 'service') return log.serviceName || log.service_name || '';
  if (key === 'trace_id') return log.traceId || log.trace_id || '';
  if (key === 'span_id') return log.spanId || log.span_id || '';
  return log[key] ?? '';
}

// ── Row key generation ─────────────────────────────────────────────────────

export function rowKey(log, i) {
  const id = String(log?.id ?? '').trim();
  if (id && id !== '0') return `log-${id}`;

  const traceId = log?.traceId || log?.trace_id || '';
  const spanId = log?.spanId || log?.span_id || '';
  if (traceId && spanId) return `${traceId}-${spanId}-${log.timestamp}`;

  return `log-${i}-${log.timestamp}`;
}

// ── Server total extraction ────────────────────────────────────────────────

export function extractServerTotal(pages) {
  return Number(
    pages?.[0]?.total
    ?? pages?.[0]?.totalCount
    ?? pages?.[0]?.total_count
    ?? pages?.[0]?.pagination?.total
    ?? pages?.[0]?.pagination?.totalCount
    ?? pages?.[0]?.pagination?.total_count
    ?? 0
  );
}
