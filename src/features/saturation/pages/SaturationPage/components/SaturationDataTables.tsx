import { memo, useCallback } from "react";

import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { SimpleTable } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import type { NavigateOptions } from "@tanstack/react-router";

import type { DatastoreSystemRow, KafkaGroupRow, KafkaTopicRow } from "../../../api/saturationApi";

import { DATASTORE_COLUMNS, KAFKA_GROUP_COLUMNS, KAFKA_TOPIC_COLUMNS } from "../columnDefs";
import { KAFKA_GROUPS, KAFKA_TOPICS, SECTION_DATASTORES } from "../constants";

type Props = {
  activeSection: string;
  kafkaView: string;
  datastoreRows: DatastoreSystemRow[];
  kafkaTopicRows: KafkaTopicRow[];
  kafkaGroupRows: KafkaGroupRow[];
  navigate: (opts: NavigateOptions) => void | Promise<void>;
};

function SaturationDataTablesComponent({
  activeSection,
  kafkaView,
  datastoreRows,
  kafkaTopicRows,
  kafkaGroupRows,
  navigate,
}: Props) {
  const onDatastoreRow = useCallback(
    (row: DatastoreSystemRow) => ({
      onClick: () =>
        navigate(
          dynamicNavigateOptions(
            ROUTES.saturationDatastoreDetail.replace("$system", encodeURIComponent(row.system))
          )
        ),
      className: "cursor-pointer",
    }),
    [navigate]
  );
  const onKafkaTopicRow = useCallback(
    (row: KafkaTopicRow) => ({
      onClick: () =>
        navigate(
          dynamicNavigateOptions(
            ROUTES.saturationKafkaTopicDetail.replace("$topic", encodeURIComponent(row.topic))
          )
        ),
      className: "cursor-pointer",
    }),
    [navigate]
  );
  const onKafkaGroupRow = useCallback(
    (row: KafkaGroupRow) => ({
      onClick: () =>
        navigate(
          dynamicNavigateOptions(
            ROUTES.saturationKafkaGroupDetail.replace(
              "$groupId",
              encodeURIComponent(row.consumer_group)
            )
          )
        ),
      className: "cursor-pointer",
    }),
    [navigate]
  );
  return (
    <PageSurface padding="lg">
      {activeSection === SECTION_DATASTORES ? (
        <SimpleTable
          dataSource={datastoreRows}
          columns={DATASTORE_COLUMNS}
          rowKey={(row) => row.system}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 960 }}
          onRow={onDatastoreRow}
        />
      ) : kafkaView === KAFKA_TOPICS ? (
        <SimpleTable
          dataSource={kafkaTopicRows}
          columns={KAFKA_TOPIC_COLUMNS}
          rowKey={(row) => row.topic}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 1100 }}
          onRow={onKafkaTopicRow}
        />
      ) : (
        <SimpleTable
          dataSource={kafkaGroupRows}
          columns={KAFKA_GROUP_COLUMNS}
          rowKey={(row) => row.consumer_group}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 1760 }}
          onRow={onKafkaGroupRow}
        />
      )}
    </PageSurface>
  );
}

export const SaturationDataTables = memo(SaturationDataTablesComponent);
