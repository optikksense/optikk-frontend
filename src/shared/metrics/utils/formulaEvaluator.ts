import type { MetricExplorerResults } from "@shared/metrics/types";

type Operator = "+" | "-" | "*" | "/";
type FormulaToken =
  | { readonly type: "number"; readonly value: number }
  | { readonly type: "symbol"; readonly value: string }
  | { readonly type: "operator"; readonly value: Operator };

type ParsedFormula =
  | {
      readonly tokens: readonly FormulaToken[];
      readonly symbols: readonly string[];
      readonly error: null;
    }
  | { readonly tokens: readonly []; readonly symbols: readonly []; readonly error: string };

const precedence: Record<Operator, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

function invalidFormula(error: string): ParsedFormula {
  return { tokens: [], symbols: [], error };
}

                                                                               
                                                                                
                                                                          
function parseFormula(expression: string, activeQueryIds: readonly string[]): ParsedFormula {
  const activeIds = new Set(activeQueryIds);
  const symbols = new Set<string>();
  const output: FormulaToken[] = [];
  const operators: Array<Operator | "("> = [];
  let expectOperand = true;
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];
    if (/\s/.test(char)) {
      index++;
      continue;
    }

    const number = expression.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) {
      if (!expectOperand) return invalidFormula("Invalid expression");
      const value = Number(number[0]);
      if (!Number.isFinite(value)) return invalidFormula("Only finite numbers are supported");
      output.push({ type: "number", value });
      index += number[0].length;
      expectOperand = false;
      continue;
    }

    const identifier = expression.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (identifier) {
      if (!expectOperand) return invalidFormula("Invalid expression");
      const symbol = identifier[0];
      if (!activeIds.has(symbol)) {
        return invalidFormula(`Query "${symbol}" has no metric selected`);
      }
      symbols.add(symbol);
      output.push({ type: "symbol", value: symbol });
      index += symbol.length;
      expectOperand = false;
      continue;
    }

    if (char === "(") {
      if (!expectOperand) return invalidFormula("Invalid expression");
      operators.push(char);
      index++;
      continue;
    }

    if (char === ")") {
      if (expectOperand) return invalidFormula("Invalid expression");
      while (operators.length > 0 && operators.at(-1) !== "(") {
        output.push({ type: "operator", value: operators.pop() as Operator });
      }
      if (operators.pop() !== "(") return invalidFormula("Invalid expression");
      index++;
      expectOperand = false;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/") {
      if (expectOperand) return invalidFormula(`Unsupported operator: ${char}`);
      while (
        operators.length > 0 &&
        operators.at(-1) !== "(" &&
        precedence[operators.at(-1) as Operator] >= precedence[char]
      ) {
        output.push({ type: "operator", value: operators.pop() as Operator });
      }
      operators.push(char);
      index++;
      expectOperand = true;
      continue;
    }

    return invalidFormula("Only numbers, query labels, and + - * / are supported");
  }

  if (expectOperand || output.length === 0) return invalidFormula("Invalid expression");
  while (operators.length > 0) {
    const operator = operators.pop();
    if (operator === "(") return invalidFormula("Invalid expression");
    output.push({ type: "operator", value: operator as Operator });
  }
  return { tokens: output, symbols: [...symbols], error: null };
}

export function validateFormulaExpression(
  expression: string,
  activeQueryIds: readonly string[]
): string | null {
  if (!expression.trim()) return null;
  return parseFormula(expression, activeQueryIds).error;
}

function evaluateTokens(tokens: readonly FormulaToken[], scope: Readonly<Record<string, number>>) {
  const stack: number[] = [];
  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }
    if (token.type === "symbol") {
      stack.push(scope[token.value]);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) return null;
    switch (token.value) {
      case "+":
        stack.push(left + right);
        break;
      case "-":
        stack.push(left - right);
        break;
      case "*":
        stack.push(left * right);
        break;
      case "/":
        stack.push(left / right);
        break;
    }
  }
  return stack.length === 1 && Number.isFinite(stack[0]) ? stack[0] : null;
}

                                                                         
export function evaluateFormula(
  expression: string,
  results: MetricExplorerResults,
  timestamps: number[]
): Array<number | null> {
  const formula = parseFormula(expression, Object.keys(results));
  if (formula.error) return timestamps.map(() => null);

  const queryLookups: Record<string, Map<number, number>> = {};
  for (const symbol of formula.symbols) {
    const lookup = new Map<number, number>();
    const result = results[symbol];
    const series = result?.series[0];
    if (result && series) {
      for (let index = 0; index < result.timestamps.length; index++) {
        const value = series.values[index];
        if (value !== null && value !== undefined) {
          lookup.set(result.timestamps[index], value);
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
    return evaluateTokens(formula.tokens, scope);
  });
}
