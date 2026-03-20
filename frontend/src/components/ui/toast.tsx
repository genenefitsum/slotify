/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ToastVariant = 'info' | 'success' | 'error';

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  dismissible: boolean;
};

type ToastPushOptions = {
  durationMs?: number;
  dismissible?: boolean;
};

type ToastContextValue = {
  push: (message: string, variant?: ToastVariant, options?: ToastPushOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantClassMap: Record<ToastVariant, string> = {
  info: 'border-border bg-card text-card-foreground',
  success: 'border-green-500/30 bg-green-500/10 text-green-800',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = 'info', options?: ToastPushOptions) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const durationMs = options?.durationMs ?? (variant === 'error' ? 5500 : variant === 'success' ? 3500 : 4000);
    const dismissible = options?.dismissible ?? variant === 'error';
    setItems((current) => [...current, { id, message, variant, dismissible }]);

    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur',
              variantClassMap[item.variant]
            )}
          >
            <p className="flex-1">{item.message}</p>
            {item.dismissible ? (
              <button
                type="button"
                className="text-xs font-medium opacity-80 transition-opacity hover:opacity-100"
                onClick={() => {
                  setItems((current) => current.filter((toastItem) => toastItem.id !== item.id));
                }}
              >
                Dismiss
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }

  return context;
};