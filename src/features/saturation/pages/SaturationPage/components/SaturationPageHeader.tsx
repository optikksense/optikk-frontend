import { Gauge } from "lucide-react";
import { memo } from "react";

import { Badge } from "@shared/components/primitives/ui";
import { PageHeader } from "@shared/components/ui";

import { SECTION_DATASTORES } from "../constants";

type Props = {
  activeSection: string;
};

function SaturationPageHeaderComponent({ activeSection }: Props) {
  return (
    <PageHeader
      title="Saturation"
      subtitle="Observe queue backlogs, consumer pressure, query latency, and datastore contention from a dense, route-driven explorer."
      icon={<Gauge size={24} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">
            {activeSection === SECTION_DATASTORES ? "Data Stores" : "Kafka"}
          </Badge>
          <Badge variant="warning">Frontend explorer</Badge>
        </div>
      }
    />
  );
}

export const SaturationPageHeader = memo(SaturationPageHeaderComponent);
