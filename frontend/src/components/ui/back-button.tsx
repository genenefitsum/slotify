import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BackButtonProps = {
  fallbackTo?: string;
  label?: string;
  className?: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
};

const BackButton = ({
  fallbackTo = '/',
  label = 'Back',
  className,
  variant = 'ghost',
  size = 'sm',
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackTo, { replace: true });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleBack}
      className={cn('inline-flex items-center gap-2 rounded-full', className)}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};

export default BackButton;
