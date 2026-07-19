import { describe, expect, it } from "vitest";

import type { MetricExplorerResults } from "@shared/metrics/types";

import { evaluateFormula, validateFormulaExpression } from "./formulaEvaluator";

const results: MetricExplorerResults = {
  A: { timestamps: [100, 200], series: [{ tags: {}, values: [3, 4] }] },
  B: { timestamps: [100, 200], series: [{ tags: {}, values: [2, null] }] },
};

describe("evaluateFormula", () => {
  it("evaluates arithmetic with standard precedence", () => {
    expect(evaluateFormula("A + B * 2", results, [100, 200])).toEqual([7, null]);
    expect(evaluateFormula("(A + B) * 2", results, [100])).toEqual([10]);
  });

  it("returns null for division by zero", () => {
    expect(evaluateFormula("A / 0", results, [100])).toEqual([null]);
  });

  it.each(["A +", "A$+B", "A B", "(A + B", "sqrt(A)", "A ^ 2", "-A"])(
    "rejects unsupported or malformed input: %s",
    (expression) => {
      expect(evaluateFormula(expression, results, [100])).toEqual([null]);
    }
  );
});

describe("validateFormulaExpression", () => {
  it("uses the active query labels", () => {
    expect(validateFormulaExpression("A / B", ["A", "B"])).toBeNull();
    expect(validateFormulaExpression("A / C", ["A", "B"])).toBe('Query "C" has no metric selected');
  });
});
