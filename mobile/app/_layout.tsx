import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { TriangleAlert } from 'lucide-react-native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AlertHost } from '@/components/ui/AlertHost';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePushNotificationObserver } from '@/hooks/usePushNotificationObserver';
import { queryClient } from '@/lib/queryClient';
import { useAppFonts } from '@/theme/fonts';

// Runs the push-tap deep-link observer. Rendered inside the navigation tree so
// it only mounts once the router is ready.
function PushObserver() {
  usePushNotificationObserver();
  return null;
}

// Hold the native splash screen until the brand fonts are ready, so the first
// frame the user sees is already fully styled (no font "pop-in").
void SplashScreen.preventAutoHideAsync();

// Catches render errors anywhere in the tree so a thrown screen shows a branded
// recovery view (with retry) instead of a white screen or crash.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 bg-canvas">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        message={error?.message || 'An unexpected error occurred. Please try again.'}
        actionLabel="Try again"
        onAction={() => void retry()}
      />
    </View>
  );
}

// Root layout: wires the providers every screen depends on — React Query for
// server state and Auth for session/role.
export default function RootLayout() {
  const { fontsReady } = useAppFonts();

  const onLayout = useCallback(() => {
    if (fontsReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                // Canvas-coloured transitions prevent a white flash on navigation.
                contentStyle: { backgroundColor: '#f4f4ee' },
              }}
            />
            <PushObserver />
            <AlertHost />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
