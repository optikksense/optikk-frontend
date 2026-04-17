import type { AlertPreview, AlertRulePayload } from "@/features/alerts/types";
import type { UseMutationResult } from "@tanstack/react-query";

import { ReviewSummaryCard } from "./review/ReviewSummaryCard";
import { SlackPreviewCard } from "./review/SlackPreviewCard";

interface Props {
  payload: AlertRulePayload;
  previewMut: UseMutationResult<AlertPreview, Error, AlertRulePayload>;
}

export function AlertReviewStep({ payload, previewMut }: Props) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ReviewSummaryCard
        payload={payload}
        summary={previewMut.data?.summary}
        engine={previewMut.data?.engine}
      />
      <SlackPreviewCard
        fallbackTitle={payload.name}
        notification={previewMut.data?.notification}
      />
    </div>
  );
}
