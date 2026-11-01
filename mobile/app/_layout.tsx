import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { useAppFonts } from '@/theme/fonts';

// Hold the native splash screen until the brand fonts are ready, so the first
// frame the user sees is already fully styled (no font "pop-in").
void SplashScreen.preventAutoHideAsync();

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
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
