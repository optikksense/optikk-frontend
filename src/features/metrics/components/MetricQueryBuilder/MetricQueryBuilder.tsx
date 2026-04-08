import { Calculator, Plus } from "lucide-react";

import { Button } from "@/components/ui";

import { MAX_QUERIES } from "../../constants";
import type {
  FormulaDefinition,
  MetricAggregation,
  MetricQueryDefinition,
  MetricTagFilter,
} from "../../types";
import { FormulaRow } from "./FormulaRow";
import { MetricQueryRow } from "./MetricQueryRow";

interface MetricQueryBuilderProps {
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly onAddQuery: () => void;
  readonly onRemoveQuery: (id: string) => void;
  readonly onAggregationChange: (id: string, agg: MetricAggregation) => void;
  readonly onMetricChange: (id: string, metricName: string) => void;
  readonly onWhereChange: (id: string, filters: MetricTagFilter[]) => void;
  readonly onGroupByChange: (id: string, groupBy: string[]) => void;
  readonly onAddFormula: () => void;
  readonly onRemoveFormula: (id: string) => void;
  readonly onFormulaExpressionChange: (id: string, expression: string) => void;
}

export function MetricQueryBuilder({
  queries,
  formulas,
  onAddQuery,
  onRemoveQuery,
  onAggregationChange,
  onMetricChange,
  onWhereChange,
  onGroupByChange,
  onAddFormula,
  onRemoveFormula,
  onFormulaExpressionChange,
}: MetricQueryBuilderProps) {
  const canAdd = queries.length < MAX_QUERIES;
  const canRemove = queries.length > 1;
  const activeQueryIds = queries.filter((q) => q.metricName).map((q) => q.id);

  return (
    <div className="flex flex-col gap-2">
      {queries.map((query) => (
        <MetricQueryRow
          key={query.id}
          query={query}
          canRemove={canRemove}
          onAggregationChange={(agg) => onAggregationChange(query.id, agg)}
          onMetricChange={(name) => onMetricChange(query.id, name)}
          onWhereChange={(filters) => onWhereChange(query.id, filters)}
          onGroupByChange={(gb) => onGroupByChange(query.id, gb)}
          onRemove={() => onRemoveQuery(query.id)}
        />
      ))}

      {formulas.map((formula) => (
        <FormulaRow
          key={formula.id}
          id={formula.id}
          expression={formula.expression}
          activeQueryIds={activeQueryIds}
          onExpressionChange={(expr) => onFormulaExpressionChange(formula.id, expr)}
          onRemove={() => onRemoveFormula(formula.id)}
        />
      ))}

      <div className="flex items-center gap-2">
        {canAdd && (
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onAddQuery}>
            Query
          </Button>
        )}
        <Button variant="ghost" size="sm" icon={<Calculator size={14} />} onClick={onAddFormula}>
          Formula
        </Button>
      </div>
    </div>
  );
}
