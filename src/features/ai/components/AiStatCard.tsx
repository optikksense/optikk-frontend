/**
 * AI Observability — Shared Stat Card component.
 * Used across Overview, Explorer, Model Detail, and Conversation pages.
 */
import styles from "../pages/AiOverviewPage.module.css";

interface AiStatCardProps {
  label: string;
  value: string | number;
  accent?: "red" | "green";
  subtitle?: string;
}

export function AiStatCard({ label, value, accent, subtitle }: AiStatCardProps) {
  return (
    <div
      className={`${styles.statCard} ${accent === "red" ? styles.statCardDanger : ""} ${accent === "green" ? styles.statCardGreen : ""}`}
    >
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
    </div>
  );
}
