import type { RequestTime } from "@/shared/api/service-types";

import {
  type KafkaTopology,
  kafkaClientsSchema,
  kafkaTopologySchema,
} from "./kafkaTopologySchemas";
import { getSaturation, rangeParams } from "./saturationClient";

                                          
export function getKafkaClients(startTime: RequestTime, endTime: RequestTime): Promise<string[]> {
  return getSaturation("/saturation/kafka/clients", kafkaClientsSchema, {
    ...rangeParams(startTime, endTime),
  });
}

                                      
export function getKafkaTopology(
  startTime: RequestTime,
  endTime: RequestTime,
  service: string
): Promise<KafkaTopology> {
  return getSaturation("/saturation/kafka/topology", kafkaTopologySchema, {
    ...rangeParams(startTime, endTime),
    services: service,
  });
}
