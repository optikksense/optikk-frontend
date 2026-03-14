import type { LogsBackendParams } from '../api/logsApi';

export interface ParsedOptiQL {
  ast: ASTNode[];
  backendParams: LogsBackendParams;
}

export interface ASTNode {
  type: 'free_text' | 'key_value';
  key?: string;
  value: string;
  operator?: '=' | '!=' | '~=' | ':' | '!:' | 'contains';
}

const KNOWN_KEYS_MAP: Record<string, keyof LogsBackendParams> = {
  service: 'services',
  services: 'services',
  level: 'severities',
  severity: 'severities',
  host: 'hosts',
  pod: 'pods',
  container: 'containers',
  trace_id: 'traceId',
  traceId: 'traceId',
  span_id: 'spanId',
  spanId: 'spanId',
};

const NEGATION_KEYS_MAP: Record<string, keyof LogsBackendParams> = {
  service: 'excludeServices',
  services: 'excludeServices',
  level: 'excludeSeverities',
  severity: 'excludeSeverities',
  host: 'excludeHosts',
};

/**
 * Parses a LogQL-like string into structured backend parameters.
 * Example: 'service="api" level:error -host:db "timeout connected"'
 */
export function parseOptiQL(query: string): ParsedOptiQL {
  if (!query || query.trim() === '') {
    return { ast: [], backendParams: {} };
  }

  const ast: ASTNode[] = [];
  const params: LogsBackendParams & Record<string, any> = {};

  // Regex to match key:value, key="value", -key=value, or "free text"
  // Group 1: negation (- or !)
  // Group 2: key
  // Group 3: operator (:, =, !=, ~=, !:)
  // Group 4: quoted value
  // Group 5: unquoted value
  // Group 6: free text (quoted)
  // Group 7: free text (unquoted)
  const tokenRegex = /(?:([!-])?([\w.]+)(:|!=|~=|!:=|=)(?:"([^"]*)"|([^"\s]+)))|(?:"([^"]*)")|([^\s]+)/g;

  let match;
  let freeTextParts: string[] = [];

  while ((match = tokenRegex.exec(query)) !== null) {
    const [
      _full,
      negation,
      key,
      operator,
      quotedVal,
      unquotedVal,
      freeQuoted,
      freeUnquoted,
    ] = match;

    if (freeQuoted !== undefined || freeUnquoted !== undefined) {
      const val = freeQuoted ?? freeUnquoted;
      ast.push({ type: 'free_text', value: val });
      freeTextParts.push(val);
      continue;
    }

    if (key) {
      const val = quotedVal ?? unquotedVal ?? '';
      const isNegation = !!negation || operator === '!=' || operator === '!:';
      const isRegex = operator === '~=';
      
      ast.push({
        type: 'key_value',
        key,
        value: val,
        operator: operator as ASTNode['operator'],
      });

      const normalizedKey = KNOWN_KEYS_MAP[key.toLowerCase()];
      
      if (normalizedKey) {
        const targetParam = isNegation
          ? NEGATION_KEYS_MAP[key.toLowerCase()]
          : normalizedKey;

        if (targetParam) {
          // If the backend param is an array (services, severities, etc.)
          if (['services', 'severities', 'hosts', 'pods', 'containers', 'excludeServices', 'excludeSeverities', 'excludeHosts'].includes(targetParam)) {
            if (!params[targetParam]) {
              (params as any)[targetParam] = [];
            }
            (params as any)[targetParam].push(val);
          } else {
            // singular, like traceId
            (params as any)[targetParam] = val;
          }
        }
      } else {
        // Unrecognized key -> Map to attr.*
        // The backend supports attr.KEY, attr_neq.KEY, attr_contains.KEY, attr_regex.KEY
        let attrPrefix = 'attr.';
        if (isNegation) {
          attrPrefix = 'attr_neq.';
        } else if (isRegex) {
          attrPrefix = 'attr_regex.';
        }

        // Just append to params (e.g. { "attr.user_id": "123" })
        params[`${attrPrefix}${key}`] = val;
      }
    }
  }

  if (freeTextParts.length > 0) {
    params.search = freeTextParts.join(' ');
  }

  return { ast, backendParams: params };
}

/**
 * Serializes standard Frontend filters and the OptiQL AST back into a plain string if needed.
 */
export function buildOptiQLString(params: LogsBackendParams): string {
  const parts: string[] = [];
  
  if (params.search) parts.push(`"${params.search}"`);
  
  params.services?.forEach(s => parts.push(`service="${s}"`));
  params.severities?.forEach(s => parts.push(`level="${s}"`));
  params.hosts?.forEach(h => parts.push(`host="${h}"`));
  params.pods?.forEach(p => parts.push(`pod="${p}"`));
  params.containers?.forEach(c => parts.push(`container="${c}"`));
  
  params.excludeServices?.forEach(s => parts.push(`-service="${s}"`));
  params.excludeSeverities?.forEach(s => parts.push(`-level="${s}"`));
  params.excludeHosts?.forEach(h => parts.push(`-host="${h}"`));

  if (params.traceId) parts.push(`traceId="${params.traceId}"`);
  if (params.spanId) parts.push(`spanId="${params.spanId}"`);

  // Handle attributes (attr.*, attr_neq.*)
  Object.keys(params).forEach(k => {
    if (k.startsWith('attr.')) {
      parts.push(`${k.replace('attr.', '')}="${params[k]}"`);
    } else if (k.startsWith('attr_neq.')) {
      parts.push(`-${k.replace('attr_neq.', '')}="${params[k]}"`);
    } else if (k.startsWith('attr_regex.')) {
      parts.push(`${k.replace('attr_regex.', '')}~="${params[k]}"`);
    } else if (k.startsWith('attr_contains.')) {
      // OptiQL parser currently doesn't distinct contains, but we can serialize it
      parts.push(`${k.replace('attr_contains.', '')}:"${params[k]}"`);
    }
  });

  return parts.join(' ');
}
