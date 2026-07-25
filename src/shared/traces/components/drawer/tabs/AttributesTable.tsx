import { memo } from "react";

interface Props {
  readonly attributes: Record<string, string>;
  readonly onAddFilter?: (key: string, value: string) => void;
}

function AttributesTableComponent({ attributes, onAddFilter }: Props) {
  const keys = Object.keys(attributes).sort();

  if (keys.length === 0) {
    return <div className="text-[12px] text-foreground-muted italic">No attributes recorded</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left font-mono text-[11.5px]">
        <thead>
          <tr className="border-border border-b bg-muted text-[10.5px] text-foreground-caption uppercase">
            <th className="px-3 py-1.5 font-medium">Attribute Key</th>
            <th className="px-3 py-1.5 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => {
            const val = attributes[k];
            return (
              <tr key={k} className="border-border/50 border-b last:border-b-0 hover:bg-secondary">
                <td className="px-3 py-1.5 font-medium text-foreground-secondary">{k}</td>
                <td className="break-all px-3 py-1.5 text-foreground">
                  {onAddFilter ? (
                    <button
                      type="button"
                      onClick={() => onAddFilter(k, val)}
                      className="cursor-pointer text-left hover:text-primary hover:underline"
                      title="Click to filter by attribute"
                    >
                      {val}
                    </button>
                  ) : (
                    val
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const AttributesTable = memo(AttributesTableComponent);
