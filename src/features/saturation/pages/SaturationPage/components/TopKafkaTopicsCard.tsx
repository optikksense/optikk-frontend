import { useNavigate } from "@tanstack/react-router";
import { memo, useCallback, useMemo } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { formatNumber } from "@shared/utils/formatters";

import type { KafkaTopicRow } from "../../../api/saturationApi";
import { formatBytesPerSecond } from "../formatUtils";
import { toneFromScore } from "../view-models/saturationScore";
import { RankBarRow } from "./RankBarRow";
import { SaturationCard } from "./SaturationCard";
import { SAT_TABLE_CLASS } from "./tableClasses";

type Props = {
  topics: KafkaTopicRow[];
};

function topicMetrics(topic: KafkaTopicRow): string {
  const records = formatNumber(topic.records_per_sec ?? 0);
  const groups = formatNumber(topic.consumer_group_count ?? 0);
  return `${records} rec/s · ${groups} groups`;
}

function TopKafkaTopicsCardImpl({ topics }: Props): JSX.Element {
  const navigate = useNavigate();
  const open = useCallback(
    (topic: string) => {
      const href = ROUTES.saturationKafkaTopicDetail.replace("$topic", encodeURIComponent(topic));
      void navigate(dynamicNavigateOptions(href));
    },
    [navigate]
  );

  const maxBps = useMemo(() => {
    return topics.reduce((acc, t) => Math.max(acc, t.bytes_per_sec ?? 0), 0);
  }, [topics]);

  return (
    <SaturationCard title="Top Kafka topics" subtitle={`${topics.length} topics by throughput`}>
      <table className={SAT_TABLE_CLASS}>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Lag</th>
            <th>Metrics</th>
            <th>Throughput</th>
            <th className="num">B/s</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => {
            const bps = topic.bytes_per_sec ?? 0;
            const ratio = maxBps > 0 ? bps / maxBps : 0;
            return (
              <RankBarRow
                key={topic.topic}
                primary={topic.topic}
                secondary={formatNumber(topic.lag ?? 0)}
                meta={topicMetrics(topic)}
                bar={ratio}
                barLabel={formatBytesPerSecond(bps)}
                tone={toneFromScore(ratio)}
                onClick={() => open(topic.topic)}
              />
            );
          })}
        </tbody>
      </table>
    </SaturationCard>
  );
}

export const TopKafkaTopicsCard = memo(TopKafkaTopicsCardImpl);
