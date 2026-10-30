import { QueryClient } from '@tanstack/react-query';

/**
 * App-wide React Query client. Tuned for mobile: data stays fresh briefly to
 * avoid refetch storms on quick screen revisits, and we retry once (network
 * blips are common on device).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
