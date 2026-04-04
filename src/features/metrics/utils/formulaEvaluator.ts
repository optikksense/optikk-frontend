import type { MetricExplorerResults } from '../types';

type Token =
  | { type: 'number'; value: number }
  | { type: 'ref'; value: string }
  | { type: 'op'; value: '+' | '-' | '*' | '/' }
  | { type: 'lparen' }
  | { type: 'rparen' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
    } else if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
    } else if ('+-*/'.includes(ch)) {
      tokens.push({ type: 'op', value: ch as '+' | '-' | '*' | '/' });
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
    } else if (/[a-zA-Z]/.test(ch)) {
      let ref = '';
      while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
        ref += expr[i++];
      }
      tokens.push({ type: 'ref', value: ref });
    } else {
      i++;
    }
  }
  return tokens;
}

type Expr =
  | { kind: 'num'; value: number }
  | { kind: 'ref'; label: string }
  | { kind: 'binop'; op: string; left: Expr; right: Expr };

function parse(tokens: Token[]): Expr | null {
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }
  function consume(): Token {
    return tokens[pos++];
  }

  function parseAtom(): Expr | null {
    const t = peek();
    if (!t) return null;
    if (t.type === 'number') {
      consume();
      return { kind: 'num', value: (t as Extract<Token, { type: 'number' }>).value };
    }
    if (t.type === 'ref') {
      consume();
      return { kind: 'ref', label: (t as Extract<Token, { type: 'ref' }>).value };
    }
    if (t.type === 'lparen') {
      consume();
      const inner = parseAddSub();
      if (peek()?.type === 'rparen') consume();
      return inner;
    }
    return null;
  }

  function parseMulDiv(): Expr | null {
    let left = parseAtom();
    if (!left) return null;
    while (isOperator(peek(), ['*', '/'])) {
      const op = consume() as Extract<Token, { type: 'op' }>;
      const right = parseAtom();
      if (!right) return left;
      left = { kind: 'binop', op: op.value, left, right };
    }
    return left;
  }

  function parseAddSub(): Expr | null {
    let left = parseMulDiv();
    if (!left) return null;
    while (isOperator(peek(), ['+', '-'])) {
      const op = consume() as Extract<Token, { type: 'op' }>;
      const right = parseMulDiv();
      if (!right) return left;
      left = { kind: 'binop', op: op.value, left, right };
    }
    return left;
  }

  return parseAddSub();
}

function isOperator(
  token: Token | undefined,
  values: ReadonlyArray<'+' | '-' | '*' | '/'>
): token is Extract<Token, { type: 'op' }> {
  return token?.type === 'op' && values.includes((token as any).value);
}

function evaluate(
  expr: Expr,
  queryValues: Record<string, number | null>,
): number | null {
  switch (expr.kind) {
    case 'num':
      return expr.value;
    case 'ref': {
      const v = queryValues[expr.label];
      return v ?? null;
    }
    case 'binop': {
      const l = evaluate(expr.left, queryValues);
      const r = evaluate(expr.right, queryValues);
      if (l === null || r === null) return null;
      switch (expr.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return r === 0 ? null : l / r;
        default: return null;
      }
    }
  }
}

/**
 * Evaluates a formula expression against metric query results.
 * Returns an array of values aligned with the given timestamps.
 * Each query result must have exactly one series (first series is used).
 */
export function evaluateFormula(
  expression: string,
  results: MetricExplorerResults,
  timestamps: number[]
): Array<number | null> {
  const tokens = tokenize(expression);
  const ast = parse(tokens);
  if (!ast) return timestamps.map(() => null);

  // Build per-timestamp lookup for each query.
  const queryLookups: Record<string, Map<number, number>> = {};
  for (const [id, result] of Object.entries(results)) {
    const lookup = new Map<number, number>();
    if (result.series.length > 0) {
      const series = result.series[0];
      for (let i = 0; i < result.timestamps.length; i++) {
        const v = series.values[i];
        if (v !== null && v !== undefined) {
          lookup.set(result.timestamps[i], v);
        }
      }
    }
    queryLookups[id] = lookup;
  }

  return timestamps.map((ts) => {
    const queryValues: Record<string, number | null> = {};
    for (const [id, lookup] of Object.entries(queryLookups)) {
      queryValues[id] = lookup.get(ts) ?? null;
    }
    return evaluate(ast, queryValues);
  });
}
