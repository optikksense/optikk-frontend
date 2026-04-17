import { memo } from "react";

import { DrawerHeader } from "@/components/ui/drawer";

import type { DeploymentSeed } from "../types";

import { HeaderBadgeRow } from "./HeaderBadgeRow";
import { HeaderTitleBlock } from "./HeaderTitleBlock";

interface Props {
  title?: string | null;
  seed: DeploymentSeed | null;
}

function DeploymentCompareHeaderComponent({ title, seed }: Props) {
  return (
    <DrawerHeader className="items-start border-[var(--border-color)] border-b bg-[linear-gradient(180deg,var(--color-primary-subtle-15),var(--color-primary-subtle-02))]">
      <div className="flex w-full flex-col gap-4">
        <HeaderTitleBlock title={title} seed={seed} />
        {seed ? <HeaderBadgeRow seed={seed} /> : null}
      </div>
    </DrawerHeader>
  );
}

export const DeploymentCompareHeader = memo(DeploymentCompareHeaderComponent);
