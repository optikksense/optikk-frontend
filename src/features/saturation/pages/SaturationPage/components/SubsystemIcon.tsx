import { Database, Layers3, Server } from "lucide-react";
import { memo } from "react";

type IconName = "kafka" | "db" | "cache";

type Props = {
  name: IconName;
  size?: number;
};

function SubsystemIconImpl({ name, size = 16 }: Props): JSX.Element {
  switch (name) {
    case "kafka":
      return <Layers3 size={size} aria-hidden />;
    case "db":
      return <Database size={size} aria-hidden />;
    case "cache":
      return <Server size={size} aria-hidden />;
  }
}

export const SubsystemIcon = memo(SubsystemIconImpl);
