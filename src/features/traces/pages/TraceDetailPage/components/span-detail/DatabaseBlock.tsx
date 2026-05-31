import { memo } from "react";

interface Props {
  readonly dbSystem?: string;
  readonly dbName?: string;
  readonly dbStatement?: string;
  readonly dbStatementNormalized?: string;
}

const kvK = "text-[11px] text-foreground-caption";
const kvV = "text-[12px] text-foreground font-mono break-words";

function DatabaseBlockComponent({ dbSystem, dbName, dbStatement, dbStatementNormalized }: Props) {
  const statement = dbStatement || dbStatementNormalized;
  if (!dbSystem && !statement) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {dbSystem && (
        <>
          <div className={kvK}>system</div>
          <div className={kvV}>{dbSystem}</div>
        </>
      )}
      {dbName && (
        <>
          <div className={kvK}>name</div>
          <div className={kvV}>{dbName}</div>
        </>
      )}
      {statement && (
        <div className="col-span-2">
          <div className={`${kvK} mb-1`}>statement</div>
          <pre className="m-0 max-h-[180px] overflow-auto whitespace-pre rounded-md border border-border bg-secondary p-3 font-mono text-[11.5px] text-foreground-secondary">
            {statement}
          </pre>
        </div>
      )}
    </div>
  );
}

export const DatabaseBlock = memo(DatabaseBlockComponent);
