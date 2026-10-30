import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

// Entry gate: route by session + role.
//  - customer   → customer tabs (Explore)
//  - unauth     → public landing
//  - vendor/admin → landing for now (vendor side not built yet)
export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <View className="flex-1 bg-canvas" />;
  }

  if (isAuthenticated && user?.role === 'customer') {
    return <Redirect href="/explore" />;
  }

  return <Redirect href="/landing" />;
}
