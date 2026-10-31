import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';

export default function Profile() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U';

  const onLogout = () => {
    haptics.medium();
    logout();
    router.replace('/landing');
  };

  return (
    <View className="flex-1 bg-canvas px-6" style={{ paddingTop: insets.top }}>
      <View className="pb-8 pt-2">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Account</Text>
        <Text className="mt-2 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Profile
        </Text>
      </View>

      <View className="flex-row items-center gap-4 border border-ink bg-white p-4">
        <View className="h-14 w-14 items-center justify-center bg-ink">
          <Text className="font-display text-xl text-canvas">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-display text-xl uppercase tracking-tight text-ink">
            {user ? `${user.firstName} ${user.lastName}`.trim() : 'Guest'}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 font-sans text-sm text-ink/60">
            {user?.email ?? 'Not signed in'}
          </Text>
        </View>
      </View>

      <View className="mt-auto" style={{ paddingBottom: insets.bottom + 90 }}>
        <Button label="Log out" variant="outline" icon={LogOut} iconPosition="leading" onPress={onLogout} />
      </View>
    </View>
  );
}
