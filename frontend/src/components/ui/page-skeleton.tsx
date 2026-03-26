import { cn } from '@/lib/utils';

type PageSkeletonProps = {
  rows?: number;
  className?: string;
};

const PageSkeleton = ({ rows = 6, className }: PageSkeletonProps) => {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/80 bg-card p-5">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted/80" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted/80" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-muted/80" />
          <div className="mt-6 h-10 w-32 animate-pulse rounded-xl bg-muted/80" />
        </div>
      ))}
    </div>
  );
};

export default PageSkeleton;