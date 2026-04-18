import { useEffect, useMemo, useState } from "react";

import type { ErrorFingerprint } from "@/features/overview/api/serviceDetailApi";

import FingerprintTrendChart from "./FingerprintTrendChart";
import FingerprintsList from "./FingerprintsList";
import SectionShell from "./SectionShell";
import { useFingerprints } from "./useFingerprints";

interface FingerprintsSectionProps {
  readonly serviceName: string;
}

function usePrimarySelection(
  fingerprints: readonly ErrorFingerprint[]
): {
  selected: ErrorFingerprint | null;
  setSelected: (row: ErrorFingerprint) => void;
} {
  const [selectedFp, setSelectedFp] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFp && fingerprints.length > 0) {
      setSelectedFp(fingerprints[0].fingerprint);
    }
  }, [fingerprints, selectedFp]);

  const selected = useMemo(
    () => fingerprints.find((row) => row.fingerprint === selectedFp) ?? null,
    [fingerprints, selectedFp]
  );

  return { selected, setSelected: (row) => setSelectedFp(row.fingerprint) };
}

function EmptyBody({ loading }: { loading: boolean }) {
  return (
    <div className="text-[12px] text-[var(--text-muted)]">
      {loading ? "Loading error fingerprints…" : "No error fingerprints in this range."}
    </div>
  );
}

export default function FingerprintsSection({ serviceName }: FingerprintsSectionProps) {
  const { fingerprints, loading } = useFingerprints(serviceName);
  const { selected, setSelected } = usePrimarySelection(fingerprints);

  if (fingerprints.length === 0) {
    return (
      <SectionShell id="fingerprints" title="Error fingerprints">
        <EmptyBody loading={loading} />
      </SectionShell>
    );
  }

  return (
    <SectionShell
      id="fingerprints"
      title="Error fingerprints"
      description="Grouped exceptions for this service. Click a fingerprint to see its occurrence trend."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <FingerprintsList
          fingerprints={fingerprints}
          selectedFingerprint={selected?.fingerprint ?? null}
          onSelect={setSelected}
        />
        {selected ? (
          <FingerprintTrendChart
            serviceName={selected.serviceName}
            operationName={selected.operationName}
            exceptionType={selected.exceptionType}
            statusMessage={selected.statusMessage}
            label={selected.exceptionType || "errors"}
          />
        ) : null}
      </div>
    </SectionShell>
  );
}
