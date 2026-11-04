import { router, Stack } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';

// Shown for any unmatched route — e.g. a broken deep link (slotify://…).
export default function NotFound() {
  return (
    <View className="flex-1 bg-canvas">
      <Stack.Screen options={{ title: 'Not found' }} />
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="That screen doesn’t exist, or the link is broken."
        actionLabel="Go home"
        onAction={() => router.replace('/')}
      />
    </View>
  );
}
