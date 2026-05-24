import { memo } from "react";

import type { SubsystemCardSpec } from "../view-models/subsystemSpecs";
import { SubsystemCard } from "./SubsystemCard";

type Props = {
  cards: SubsystemCardSpec[];
};

function SubsystemCardsRowImpl({ cards }: Props): JSX.Element {
  return (
    <div className="sat-kpis">
      {cards.map((spec) => (
        <SubsystemCard key={spec.id} spec={spec} />
      ))}
    </div>
  );
}

export const SubsystemCardsRow = memo(SubsystemCardsRowImpl);
