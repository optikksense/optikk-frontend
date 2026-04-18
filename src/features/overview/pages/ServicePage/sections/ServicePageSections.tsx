import DependenciesSection from "./DependenciesSection";
import DeploymentsSection from "./DeploymentsSection";
import ErrorsSection from "./ErrorsSection";
import FingerprintsSection from "./FingerprintsSection";
import GoldenSignalsSection from "./GoldenSignalsSection";
import LogsSection from "./LogsSection";
import ResourcesSection from "./ResourcesSection";
import SloSection from "./SloSection";
import TracesSection from "./TracesSection";

interface ServicePageSectionsProps {
  readonly serviceName: string;
}

export default function ServicePageSections({ serviceName }: ServicePageSectionsProps) {
  return (
    <>
      <GoldenSignalsSection serviceName={serviceName} />
      <DeploymentsSection serviceName={serviceName} />
      <DependenciesSection serviceName={serviceName} />
      <ResourcesSection serviceName={serviceName} />
      <ErrorsSection serviceName={serviceName} />
      <FingerprintsSection serviceName={serviceName} />
      <SloSection serviceName={serviceName} />
      <TracesSection serviceName={serviceName} />
      <LogsSection serviceName={serviceName} />
    </>
  );
}
