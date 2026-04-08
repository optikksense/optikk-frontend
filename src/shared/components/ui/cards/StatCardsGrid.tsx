import { StatCard } from "@shared/components/ui";

interface StatCardsGridProps {
  stats?: any[];
  style?: React.CSSProperties;
  className?: string;
  defaultColProps?: Record<string, unknown>;
}

export default function StatCardsGrid({ stats = [], style, className }: StatCardsGridProps) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className={`stat-cards-grid ${className || ""}`} style={style}>
      {stats.map((stat, index) => {
        const { colProps, ...cardProps } = stat;
        return <StatCard key={index} {...cardProps} />;
      })}
    </div>
  );
}
