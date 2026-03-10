import { cn } from '@/lib/utils';

type PageSkeletonProps = {
  rows?: number;
  className?: string;
};

const PageSkeleton = ({ rows = 6, className }: PageSkeletonProps) => {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-card p-4">
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-9 w-32 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default PageSkeleton;