import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const elevationClasses: Record<NonNullable<CardProps['elevation']>, string> = {
  0: 'bg-transparent',
  1: 'bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]',
  2: 'bg-[var(--surface-2-bg)] border border-[var(--border-color)] shadow-[var(--shadow-md)]',
  3: 'bg-[var(--surface-3-bg)] border border-[var(--border-color)] shadow-[var(--shadow-lg)]',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  xs: 'p-2.5',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 1, padding = 'md', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--card-radius)] transition-[box-shadow,border-color,background-color] duration-200',
        elevationClasses[elevation],
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-0', className)}
      {...props}
    />
  ),
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[15px] font-semibold leading-snug tracking-[0.01em]', className)}
      {...props}
    />
  ),
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-[12px] text-muted-foreground', className)}
      {...props}
    />
  ),
);

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-0', className)} {...props} />
  ),
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-0', className)} {...props} />
  ),
);

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
