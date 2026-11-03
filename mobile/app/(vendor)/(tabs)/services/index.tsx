import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { BriefcaseBusiness, Plus, Store, WifiOff } from 'lucide-react-native';
import { RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceCard } from '@/components/services/ServiceCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyVendor } from '@/hooks/useMyVendor';
import { useMyServices, useUpdateService } from '@/hooks/useServices';
import { useHaptics } from '@/hooks/useHaptics';
import { getErrorMessage } from '@/api/http';
import { showAlert } from '@/lib/alert';
import { colors } from '@/theme/colors';

export default function VendorServices() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const vendor = useMyVendor();
  const services = useMyServices(vendor.data?.id);
  const updateService = useUpdateService();

  const items = services.data?.items ?? [];

  const toggleActive = (id: string, next: boolean) => {
    haptics.selection();
    updateService.mutate(
      { id, payload: { isActive: next } },
      {
        onSuccess: () => haptics.success(),
        onError: (error) => {
          haptics.error();
          showAlert('Could not update service', getErrorMessage(error));
        },
      },
    );
  };

  const header = (
    <View className="px-6">
      <View className="flex-row items-end justify-between pb-1 pt-2">
        <View>
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Your</Text>
          <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
            Services
          </Text>
        </View>
      </View>
    </View>
  );

  // No business profile yet → services can't exist; point to onboarding.
  if (vendor.isMissing) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        {header}
        <EmptyState
          icon={Store}
          title="Set up your business"
          message="Create your business profile before adding services customers can book."
          actionLabel="Get started"
          onAction={() => router.push('/business')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {header}

      {vendor.isLoading || services.isLoading ? (
        <View className="mt-5 gap-3 px-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={96} />
          ))}
        </View>
      ) : services.isError ? (
        <EmptyState
          icon={WifiOff}
          title="Can't load services"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void services.refetch()}
        />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onPress={() => router.push({ pathname: '/service/edit', params: { id: item.id } })}
              onToggleActive={() => toggleActive(item.id, !item.isActive)}
              toggling={updateService.isPending && updateService.variables?.id === item.id}
            />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 96,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={services.isRefetching}
              onRefresh={() => void services.refetch()}
              tintColor={colors.ink}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={BriefcaseBusiness}
              title="No services yet"
              message="Add your first service so customers can book you."
              actionLabel="Add service"
              onAction={() => router.push('/service/edit')}
            />
          }
        />
      )}

      {/* New service button, pinned above the tab bar */}
      {!vendor.isLoading && !services.isError ? (
        <View
          className="absolute left-6 right-6"
          style={{ bottom: insets.bottom + 72 }}
          pointerEvents="box-none"
        >
          <Button
            label="New service"
            icon={Plus}
            iconPosition="leading"
            onPress={() => router.push('/service/edit')}
          />
        </View>
      ) : null}
    </View>
  );
}
