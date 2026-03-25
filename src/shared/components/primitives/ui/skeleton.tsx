import { cn } from '@/lib/utils';

export interface SkeletonProps {
  active?: boolean;
  count?: number;
  paragraph?: { rows: number };
  className?: string;
  variant?: string;
  height?: number | string;
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-4 animate-pulse rounded bg-[var(--bg-hover)]', className)}
    />
  );
}

function Skeleton({
  active = true,
  count,
  paragraph,
  className,
  height,
}: SkeletonProps) {
  const rows = paragraph?.rows ?? count ?? 3;

  if (!active) {
    return null;
  }

  if (height) {
    return (
      <div
        className={cn('animate-pulse rounded bg-[var(--bg-hover)]', className)}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonLine
          key={index}
          className={
            index === rows - 1 ? 'w-3/5' : index === 0 ? 'h-5 w-2/5' : 'w-full'
          }
        />
      ))}
    </div>
  );
}

export { Skeleton };
