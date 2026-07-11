import { Skeleton as DSSkeleton } from "@shared/components/primitives/ui";

import type { FeedbackSkeletonProps } from "./types";

export default function Skeleton({ rows = 3 }: FeedbackSkeletonProps): JSX.Element {
  return <DSSkeleton count={rows} />;
}
