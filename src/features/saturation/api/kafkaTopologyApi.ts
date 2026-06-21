import type { RequestTime } from "@/shared/api/service-types";

import { type KafkaTopology, kafkaTopologySchema } from "./kafkaTopologySchemas";
import { getSaturation, rangeParams } from "./saturationClient";

export function getKafkaTopology(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopology> {
  return getSaturation(
    "/saturation/kafka/topology",
    kafkaTopologySchema,
    rangeParams(startTime, endTime)
  );
}
