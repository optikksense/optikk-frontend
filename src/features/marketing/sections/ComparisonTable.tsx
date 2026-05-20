import { Check, Minus, X } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "../motion/Reveal";

type CellValue = boolean | "partial" | ReactNode;

interface ComparisonRow {
  readonly label: string;
  readonly cells: readonly CellValue[];
}

interface ComparisonTableProps {
  readonly columns: readonly string[];
  readonly rows: readonly ComparisonRow[];
  readonly highlightColumn?: number;
}

function Cell({ value }: { readonly value: CellValue }) {
  if (value === true) {
    return (
      <span className="m-compare-yes">
        <Check size={18} strokeWidth={2.5} />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="m-compare-no">
        <X size={18} strokeWidth={2.5} />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="m-compare-no">
        <Minus size={18} strokeWidth={2.5} />
      </span>
    );
  }
  return <>{value}</>;
}

export function ComparisonTable({ columns, rows, highlightColumn = 1 }: ComparisonTableProps) {
  return (
    <Reveal>
      <div style={{ overflowX: "auto" }}>
        <table className="m-compare">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col} className={idx === highlightColumn ? "m-compare-our" : undefined}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="m-compare-row-label">{row.label}</td>
                {row.cells.map((cell, idx) => (
                  <td
                    key={idx}
                    className={idx + 1 === highlightColumn ? "m-compare-our" : undefined}
                  >
                    <Cell value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}
