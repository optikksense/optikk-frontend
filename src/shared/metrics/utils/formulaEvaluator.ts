import {
  type ConstantNode,
  type EvalFunction,
  type MathNode,
  type OperatorNode,
  type SymbolNode,
  addDependencies,
  create,
  divideDependencies,
  multiplyDependencies,
  parseDependencies,
  subtractDependencies,
} from "mathjs/number";

import type { MetricExplorerResults } from "@shared/metrics/types";

const ALLOWED_OPERATORS = new Set(["+", "-", "*", "/"]);
const math = create({
  add: addDependencies,
  divide: divideDependencies,
  multiply: multiplyDependencies,
  parse: parseDependencies,
  subtract: subtractDependencies,
});

type ParsedFormula =
  | { readonly compiled: EvalFunction; readonly symbols: readonly string[]; readonly error: null }
  | { readonly compiled: null; readonly symbols: readonly []; readonly error: string };

function invalidFormula(error: string): ParsedFormula {
  return { compiled: null, symbols: [], error };
}

function parseFormula(expression: string, activeQueryIds: readonly string[]): ParsedFormula {
  let root: MathNode;
  try {
    root = math.parse(expression);
  } catch {
    return invalidFormula("Invalid expression");
  }

  const activeIds = new Set(activeQueryIds);
  const symbols = new Set<string>();
  let error: string | null = null;

  root.traverse((node) => {
    if (error) return;

    switch (node.type) {
      case "ConstantNode": {
        const value = (node as ConstantNode).value;
        if (typeof value !== "number" || !Number.isFinite(value)) {
          error = "Only finite numbers are supported";
        }
        return;
      }
      case "SymbolNode": {
        const symbol = (node as SymbolNode).name;
        if (!activeIds.has(symbol)) {
          error = `Query "${symbol}" has no metric selected`;
          return;
        }
        symbols.add(symbol);
        return;
      }
      case "OperatorNode": {
        const operator = node as OperatorNode;
        if (operator.implicit || !ALLOWED_OPERATORS.has(operator.op) || !operator.isBinary()) {
          error = `Unsupported operator: ${operator.op}`;
        }
        return;
      }
      case "ParenthesisNode":
        return;
      default:
        error = "Only numbers, query labels, and + - * / are supported";
    }
  });

  if (error) return invalidFormula(error);
  return { compiled: root.compile(), symbols: [...symbols], error: null };
}

export function validateFormulaExpression(
  expression: string,
  activeQueryIds: readonly string[]
): string | null {
  if (!expression.trim()) return null;
  return parseFormula(expression, activeQueryIds).error;
}

/** Evaluates a formula against the first series of each metric query. */
export function evaluateFormula(
  expression: string,
  results: MetricExplorerResults,
  timestamps: number[]
): Array<number | null> {
  const formula = parseFormula(expression, Object.keys(results));
  if (!formula.compiled) return timestamps.map(() => null);

  const queryLookups: Record<string, Map<number, number>> = {};
  for (const symbol of formula.symbols) {
    const lookup = new Map<number, number>();
    const result = results[symbol];
    const series = result?.series[0];
    if (result && series) {
      for (let i = 0; i < result.timestamps.length; i++) {
        const value = series.values[i];
        if (value !== null && value !== undefined) {
          lookup.set(result.timestamps[i], value);
        }
      }
    }
    queryLookups[symbol] = lookup;
  }

  return timestamps.map((timestamp) => {
    const scope: Record<string, number> = {};
    for (const symbol of formula.symbols) {
      const value = queryLookups[symbol].get(timestamp);
      if (value === undefined) return null;
      scope[symbol] = value;
    }

    try {
      const value: unknown = formula.compiled.evaluate(scope);
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  });
}
