import Constants from 'expo-constants';
import { router } from 'expo-router';
import {
  CalendarCheck,
  Cookie,
  FileText,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  SquarePen,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SettingsGroup, SettingsRow } from '@/components/ui/SettingsRow';
import { useAuth } from '@/contexts/AuthContext';
import { useHaptics } from '@/hooks/useHaptics';
import { env } from '@/lib/env';
import { colors } from '@/theme/colors';

const ROLE_LABEL: Record<string, string> = {
  customer: 'Customer',
  vendor_owner: 'Vendor',
  vendor_staff: 'Vendor staff',
  admin: 'Admin',
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { user, logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Guest';
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const status = user?.status ? user.status[0].toUpperCase() + user.status.slice(1) : '—';
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : null;

  const contactSupport = () => {
    void Linking.openURL(`mailto:${env.supportEmail}`);
  };

  const onLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          haptics.medium();
          logout();
          router.replace('/landing');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}
      >
        {/* Title */}
        <View className="pb-2 pt-2">
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            Account
          </Text>
          <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
            Profile
          </Text>
        </View>

        {/* Identity card */}
        <View className="mt-5 flex-row items-center gap-4 border border-ink bg-white p-4">
          <Avatar uri={user?.avatarUrl} initials={initials} size={64} />
          <View className="flex-1">
            <Text numberOfLines={1} className="font-display text-2xl uppercase tracking-tight text-ink">
              {fullName}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 font-sans text-sm text-ink/60">
              {user?.email ?? 'Not signed in'}
            </Text>
            <View className="mt-2 flex-row">
              <View className="bg-acid px-2 py-0.5">
                <Text className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
                  {ROLE_LABEL[user?.role ?? 'customer'] ?? 'Customer'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account details */}
        <SettingsGroup title="Account">
          <SettingsRow
            icon={SquarePen}
            label="Edit profile"
            onPress={() => router.push('/account/edit')}
          />
          <SettingsRow label="Email" value={user?.email ?? '—'} />
          {user?.phone ? <SettingsRow label="Phone" value={user.phone} /> : null}
          <SettingsRow label="Role" value={ROLE_LABEL[user?.role ?? 'customer'] ?? 'Customer'} />
          <SettingsRow label="Status" value={status} />
          <SettingsRow label="Member since" value={memberSince ?? '—'} last />
        </SettingsGroup>

        {/* Activity */}
        <SettingsGroup title="Activity">
          <SettingsRow
            icon={CalendarCheck}
            label="My bookings"
            onPress={() => router.push('/bookings')}
            last
          />
        </SettingsGroup>

        {/* Support & legal */}
        <SettingsGroup title="Support">
          <SettingsRow icon={LifeBuoy} label="Help & support" onPress={contactSupport} />
          <SettingsRow
            icon={FileText}
            label="Terms of service"
            onPress={() => router.push('/legal/terms')}
          />
          <SettingsRow
            icon={ShieldCheck}
            label="Privacy policy"
            onPress={() => router.push('/legal/privacy')}
          />
          <SettingsRow
            icon={Cookie}
            label="Cookie policy"
            onPress={() => router.push('/legal/cookies')}
            last
          />
        </SettingsGroup>

        {/* About */}
        <SettingsGroup title="About">
          <SettingsRow label="Version" value={version} last />
        </SettingsGroup>

        {/* Log out */}
        <View className="mt-8">
          <Button
            label="Log out"
            variant="outline"
            icon={LogOut}
            iconPosition="leading"
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}
