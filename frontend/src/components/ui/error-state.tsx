import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const ErrorState = ({
  title = 'Something went wrong',
  description,
  actionLabel,
  onAction,
  className,
}: ErrorStateProps) => {
  return (
    <div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center', className)}>
      <h2 className="text-xl font-semibold text-destructive">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default ErrorState;