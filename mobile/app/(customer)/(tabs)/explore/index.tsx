import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Compass, WifiOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useAuth } from '@/contexts/AuthContext';
import { useVendors } from '@/hooks/useVendors';
import { greeting } from '@/lib/format';
import { colors } from '@/theme/colors';

const ALL = 'All';

export default function Explore() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isRefetching } = useVendors();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(ALL);

  const vendors = useMemo(() => data?.items ?? [], [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => v.categories.forEach((c) => set.add(c)));
    return [ALL, ...Array.from(set).sort()];
  }, [vendors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors.filter((v) => {
      const matchesCategory = category === ALL || v.categories.includes(category);
      const matchesQuery =
        !q ||
        v.displayName.toLowerCase().includes(q) ||
        (v.location.city ?? '').toLowerCase().includes(q) ||
        v.categories.some((c) => c.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [vendors, search, category]);

  const firstName = user?.firstName?.trim() || 'there';
  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const isFiltering = search.trim().length > 0 || category !== ALL;

  const header = (
    <View className="px-6">
      {/* Greeting + avatar */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="flex-1 pr-4">
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            {greeting()}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-1.5 font-display text-4xl uppercase tracking-tight text-ink"
          >
            {firstName}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.push('/profile')}
          className="h-12 w-12 items-center justify-center bg-ink active:opacity-80"
        >
          <Text className="font-display text-base text-canvas">{initials}</Text>
        </Pressable>
      </View>

      {/* Search */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search pros, services, places"
        className="mt-5"
      />

      {/* Category filter */}
      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-6 mt-4"
          contentContainerClassName="gap-2 px-6"
        >
          {categories.map((c) => (
            <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      ) : null}

      {/* Section label */}
      <View className="mt-6 flex-row items-end justify-between">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {category === ALL ? 'Available now' : category}
        </Text>
        {!isLoading ? (
          <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
            {filtered.length} {filtered.length === 1 ? 'pro' : 'pros'}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {header}

      {isLoading ? (
        <View className="mt-4 gap-4 px-6">
          {[0, 1, 2].map((i) => (
            <View key={i} className="border border-ink/10 bg-white">
              <Skeleton height={168} />
              <View className="gap-2 p-4">
                <Skeleton height={22} width="70%" />
                <Skeleton height={12} width="45%" />
              </View>
            </View>
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={WifiOff}
          title="Can't load vendors"
          message="Check your connection and the API, then try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VendorCard vendor={item} onPress={() => router.push(`/vendor/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View className="h-4" />}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: insets.bottom + 96,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={colors.ink}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={Compass}
              title={isFiltering ? 'No matches' : 'No vendors yet'}
              message={
                isFiltering
                  ? 'Try a different search or category.'
                  : 'Check back soon — new pros are joining all the time.'
              }
            />
          }
        />
      )}
    </View>
  );
}
