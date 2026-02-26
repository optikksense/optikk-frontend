export const resolveTimeRange = (timeRange) => {
    if (timeRange.value === 'custom' && timeRange.custom) {
        return { startTime: timeRange.custom.start, endTime: timeRange.custom.end };
    }
    const endTime = Date.now();
    const startTime = endTime - timeRange.minutes * 60 * 1000;
    return { startTime, endTime };
};

export const stripQuotes = (value) => {
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.substring(1, value.length - 1);
    }
    return value;
};

export const parseDurationLiteral = (raw) => {
    const match = raw.match(/^(\\d+)(ms|s|m|h)$/);
    if (!match) return null;
    const val = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'ms') return val * 1000000;
    if (unit === 's') return val * 1000000000;
    if (unit === 'm') return val * 60000000000;
    if (unit === 'h') return val * 3600000000000;
    return null;
};

const TRACE_CONDITION_REGEX = /([a-zA-Z0-9._-]+)\\s*(=|!=|>|<|>=|<=)\\s*("[^"]+"|'[^']+'|[^\\s]+)/g;

export const parseTraceExpression = (expression) => {
    const params = {};
    if (!expression) return params;

    let match;
    while ((match = TRACE_CONDITION_REGEX.exec(expression)) !== null) {
        const field = match[1];
        const operator = match[2];
        const value = stripQuotes(match[3]);

        if (field === 'trace_id') {
            params.traceId = value;
        } else if (field === 'service' || field === 'service.name' || field === 'service_name') {
            params.service = value;
        } else if (field === 'operation' || field === 'operation.name' || field === 'operation_name') {
            params.operation = value;
        } else if (field === 'http.status_code') {
            if (operator === '=' || operator === '==') {
                params.minStatusCode = parseInt(value, 10);
                params.maxStatusCode = parseInt(value, 10);
            } else if (operator === '>=') {
                params.minStatusCode = parseInt(value, 10);
            } else if (operator === '<=') {
                params.maxStatusCode = parseInt(value, 10);
            } else if (operator === '>') {
                params.minStatusCode = parseInt(value, 10) + 1;
            } else if (operator === '<') {
                params.maxStatusCode = parseInt(value, 10) - 1;
            }
        } else if (field === 'duration') {
            const durationNs = parseDurationLiteral(value);
            if (durationNs) {
                if (operator === '>=' || operator === '>') {
                    params.minDuration = durationNs;
                } else if (operator === '<=' || operator === '<') {
                    params.maxDuration = durationNs;
                }
            } else {
                const numNs = parseInt(value, 10);
                if (!isNaN(numNs)) {
                    if (operator === '>=' || operator === '>') params.minDuration = numNs;
                    else if (operator === '<=' || operator === '<') params.maxDuration = numNs;
                }
            }
        }
    }

    const terms = expression.split(/\\s+AND\\s+|\\s+OR\\s+/i).map(t => t.trim());
    const nonConditionTerms = terms.filter(t => !t.match(TRACE_CONDITION_REGEX));
    if (nonConditionTerms.length > 0) {
        params.search = nonConditionTerms.join(' ');
    }

    return params;
};

export const buildLogsExpression = (query) => {
    const parts = [];
    if (query.service) parts.push(`service="${query.service}"`);
    if (query.level) parts.push(`level="${query.level}"`);
    if (query.search) parts.push(`"${query.search}"`);
    return parts.join(' AND ');
};

export const buildMetricsExpression = (query) => {
    let expr = '';
    if (query.operation === 'ratio') {
        expr = `${query.metricA} / ${query.metricB}`;
    } else {
        expr = query.metricA;
    }
    if (query.service) expr += ` {service="${query.service}"}`;
    return expr;
};

export const evaluateMetricsExpression = (rows, query) => {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(row => {
        let result = null;
        let label = '';

        if (query.operation === 'ratio') {
            const a = Number(row[query.metricA] || 0);
            const b = Number(row[query.metricB] || 0);
            result = b > 0 ? a / b : 0;
            label = `${query.metricA} / ${query.metricB}`;
        } else {
            result = Number(row[query.metricA] || 0);
            label = query.metricA;
        }

        if (query.metricA.includes('count') && query.metricB?.includes('count')) {
            result = result * 100; // rough percentage if ratio of counts
        }

        return {
            timestamp: row.time_bucket || row.timestamp,
            [label]: result,
            sourceRow: row
        };
    });
};

export const normalizeSavedQueryPayload = (payload) => {
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload);
        } catch (e) {
            return {};
        }
    }
    return payload || {};
};
