import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { roleHome } from '@/lib/roleHome';

// Entry gate: route by session + role.
//  - customer      → customer tabs (Explore)
//  - vendor_*      → vendor tabs (Dashboard)
//  - unauth/admin  → public landing
export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <View className="flex-1 bg-canvas" />;
  }

  if (isAuthenticated && user) {
    return <Redirect href={roleHome(user.role)} />;
  }

  return <Redirect href="/landing" />;
}
