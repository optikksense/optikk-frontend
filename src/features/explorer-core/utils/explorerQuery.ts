import type { StructuredFilter } from '@shared/hooks/useURLFilters';

function escapeQueryValue(value: string): string {
  const v = value.trim();
  if (v === '') return '""';
  if (/[\s"():]/.test(v)) {
    return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return v;
}

/** Map UI filter field keys to backend queryparser field names (logs). */
function logsUiFieldToQueryField(field: string): string {
  switch (field) {
    case 'service_name':
      return 'service';
    case 'level':
      return 'status';
    case 'logger':
      return 'logger';
    case 'search':
      return '';
    default:
      return field;
  }
}

/** Map UI filter field keys to backend queryparser field names (traces). */
function tracesUiFieldToQueryField(field: string): string {
  switch (field) {
    case 'service_name':
      return 'service';
    case 'operation_name':
      return 'operation';
    case 'http_method':
      return 'http.method';
    case 'http_status':
      return 'http.status_code';
    case 'duration_ms':
      return 'duration';
    case 'span_kind':
      return 'span.kind';
    case 'search':
      return '';
    default:
      return field;
  }
}

function structuredFilterToClause(
  filter: StructuredFilter,
  mapField: (field: string) => string,
  scope: 'logs' | 'traces'
): string {
  const qField = mapField(filter.field);
  const escaped = escapeQueryValue(filter.value);
  const raw = filter.value.trim();

  if (filter.field === 'search') return escaped;

  switch (filter.operator) {
    case 'not_equals':
      return `-${qField}:${escaped}`;
    case 'contains':
      return `${qField}:${raw.replace(/\s+/g, '*')}*`;
    case 'gt':
    case 'lt': {
      if (scope === 'traces' && filter.field === 'duration_ms') {
        const ms = Number(raw);
        if (!Number.isFinite(ms)) return `${qField}:${escaped}`;
        const ns = Math.round(ms * 1e6);
        return filter.operator === 'gt' ? `${qField}:>${ns}` : `${qField}:<${ns}`;
      }
      return filter.operator === 'gt' ? `${qField}:>${raw}` : `${qField}:<${raw}`;
    }
    default:
      return `${qField}:${escaped}`;
  }
}

/** Compile structured pills to a query string fragment (AND-combined). */
export function structuredFiltersToQueryString(
  filters: StructuredFilter[],
  scope: 'logs' | 'traces'
): string {
  const mapField = scope === 'logs' ? logsUiFieldToQueryField : tracesUiFieldToQueryField;
  return filters
    .map((f) => structuredFilterToClause(f, mapField, scope))
    .filter(Boolean)
    .join(' AND ');
}

/** Merge free-text query with structured filters and optional logs “errors only” flag. */
export function buildLogsExplorerQuery(params: {
  filters: StructuredFilter[];
  errorsOnly: boolean;
}): string {
  const parts: string[] = [];
  const structured = structuredFiltersToQueryString(params.filters, 'logs');
  if (structured) parts.push(structured);
  if (params.errorsOnly) parts.push('status:ERROR');
  return parts.join(' AND ');
}

/** Merge free-text query with structured filters for traces. */
export function buildTracesExplorerQuery(params: {
  filters: StructuredFilter[];
  errorsOnly: boolean;
  selectedService: string | null;
}): string {
  const parts: string[] = [];
  const structured = structuredFiltersToQueryString(params.filters, 'traces');
  if (structured) parts.push(structured);
  if (params.errorsOnly) parts.push('status:ERROR');
  if (params.selectedService) {
    parts.push(`service:${escapeQueryValue(params.selectedService)}`);
  }
  return parts.join(' AND ');
}
