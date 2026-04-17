import { Skeleton } from "@/components/ui";
import { memo } from "react";

import type { SpanAttributes } from "../../../types";

import { AllAttributesSection } from "./attributes/AllAttributesSection";
import { CoreSection } from "./attributes/CoreSection";
import { DbSection } from "./attributes/DbSection";
import { ExceptionSection } from "./attributes/ExceptionSection";
import { HttpSection } from "./attributes/HttpSection";
import { ResourceSection } from "./attributes/ResourceSection";
import { RpcSection } from "./attributes/RpcSection";

interface Props {
  attrs: SpanAttributes | null;
  loading: boolean;
}

function AttributesTabComponent({ attrs, loading }: Props) {
  if (loading) {
    return (
      <div className="sdd-center">
        <Skeleton count={4} />
      </div>
    );
  }
  if (!attrs) return <div className="sdd-center sdd-empty">Select a span to view attributes</div>;

  return (
    <div>
      <CoreSection attrs={attrs} />
      <ExceptionSection attrs={attrs} />
      <HttpSection attrs={attrs} />
      <DbSection attrs={attrs} />
      <RpcSection attrs={attrs} />
      <ResourceSection attrs={attrs} />
      <AllAttributesSection attrs={attrs} />
    </div>
  );
}

export const AttributesTab = memo(AttributesTabComponent);
