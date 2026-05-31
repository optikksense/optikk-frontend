import { memo } from "react";

import type { SubsystemCardSpec } from "../view-models/subsystemSpecs";
import { SubsystemCard } from "./SubsystemCard";

type Props = {
  cards: SubsystemCardSpec[];
};

function SubsystemCardsRowImpl({ cards }: Props): JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-[14px] [&>*]:min-w-0">
      {cards.map((spec) => (
        <SubsystemCard key={spec.id} spec={spec} />
      ))}
    </div>
  );
}

export const SubsystemCardsRow = memo(SubsystemCardsRowImpl);
