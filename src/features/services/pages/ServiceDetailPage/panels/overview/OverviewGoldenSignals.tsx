import { ErrorRateSignal } from "./goldenSignals/ErrorRateSignal";
import { LatencySignal } from "./goldenSignals/LatencySignal";
import { RequestRateSignal } from "./goldenSignals/RequestRateSignal";
import { SaturationSignal } from "./goldenSignals/SaturationSignal";

   
                                                                          
                                                                             
                                                                   
   
export function OverviewGoldenSignals({ serviceName }: { serviceName: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-semibold text-[14px] text-foreground">Golden signals</h3>
        <p className="mt-0.5 text-[12px] text-foreground-muted">
          Request · errors · latency · saturation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RequestRateSignal serviceName={serviceName} />
        <ErrorRateSignal serviceName={serviceName} />
        <LatencySignal serviceName={serviceName} />
        <SaturationSignal serviceName={serviceName} />
      </div>
    </div>
  );
}
