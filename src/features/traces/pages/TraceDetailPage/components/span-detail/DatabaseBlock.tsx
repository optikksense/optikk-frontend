import { memo } from "react";

interface Props {
  readonly dbSystem?: string;
  readonly dbName?: string;
  readonly dbStatement?: string;
  readonly dbStatementNormalized?: string;
}

function DatabaseBlockComponent({ dbSystem, dbName, dbStatement, dbStatementNormalized }: Props) {
  const statement = dbStatement || dbStatementNormalized;
  if (!dbSystem && !statement) return null;

  return (
    <div className="tdp-kv-grid">
      {dbSystem && (
        <>
          <div className="tdp-kv-k">system</div>
          <div className="tdp-kv-v">{dbSystem}</div>
        </>
      )}
      {dbName && (
        <>
          <div className="tdp-kv-k">name</div>
          <div className="tdp-kv-v">{dbName}</div>
        </>
      )}
      {statement && (
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="tdp-kv-k" style={{ marginBottom: 4 }}>
            statement
          </div>
          <pre className="tdp-raw-pre" style={{ maxHeight: 180 }}>
            {statement}
          </pre>
        </div>
      )}
    </div>
  );
}

export const DatabaseBlock = memo(DatabaseBlockComponent);
