import { Database, Search, Waves } from "lucide-react";
import { memo } from "react";

import { Input } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";

import { KAFKA_GROUPS, KAFKA_TOPICS, SECTION_DATASTORES, SECTION_KAFKA } from "../constants";
import { pillClass } from "../pillStyles";

type Props = {
  activeSection: string;
  kafkaView: string;
  storeType: string;
  queryText: string;
  setSearchValue: (key: string, value: string | null) => void;
};

function SaturationExplorerToolbarComponent({
  activeSection,
  kafkaView,
  storeType,
  queryText,
  setSearchValue,
}: Props) {
  return (
    <PageSurface padding="sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
            <button
              type="button"
              onClick={() => setSearchValue("section", SECTION_DATASTORES)}
              className={`inline-flex items-center gap-2 rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${pillClass(activeSection === SECTION_DATASTORES)}`}
            >
              <Database size={14} />
              Data Stores
            </button>
            <button
              type="button"
              onClick={() => setSearchValue("section", SECTION_KAFKA)}
              className={`inline-flex items-center gap-2 rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${pillClass(activeSection === SECTION_KAFKA)}`}
            >
              <Waves size={14} />
              Kafka
            </button>
          </div>

          {activeSection === SECTION_DATASTORES ? (
            <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
              {[
                { key: "all", label: "All" },
                { key: "database", label: "Databases" },
                { key: "redis", label: "Redis" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSearchValue("storeType", item.key === "all" ? null : item.key)}
                  className={`rounded-[calc(var(--card-radius)+1px)] px-3 py-2 font-medium text-[12px] transition-colors ${pillClass(storeType === item.key || (storeType === "all" && item.key === "all"))}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
              {[
                { key: KAFKA_TOPICS, label: "Topics" },
                { key: KAFKA_GROUPS, label: "Consumer Groups" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSearchValue("kafkaView", item.key === KAFKA_TOPICS ? null : item.key)
                  }
                  className={`rounded-[calc(var(--card-radius)+1px)] px-3 py-2 font-medium text-[12px] transition-colors ${pillClass(kafkaView === item.key)}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="-translate-y-1/2 absolute top-1/2 left-3 text-[var(--text-muted)]"
          />
          <Input
            value={queryText}
            onChange={(event) => setSearchValue("q", event.target.value || null)}
            placeholder={
              activeSection === SECTION_DATASTORES
                ? "Search systems, categories, or endpoints"
                : kafkaView === KAFKA_TOPICS
                  ? "Search Kafka topics"
                  : "Search consumer groups"
            }
            className="pl-9"
          />
        </div>
      </div>
    </PageSurface>
  );
}

export const SaturationExplorerToolbar = memo(SaturationExplorerToolbarComponent);
