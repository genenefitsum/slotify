import { Button } from '@/components/ui/button';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => {
  const safePage = Math.max(page, 1);
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className={className}>
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <Button
          type="button"
          variant="outline"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {safePage} of {safeTotalPages}
        </p>
        <Button
          type="button"
          variant="outline"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
