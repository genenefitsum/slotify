import { Image } from 'expo-image';
import { Clock, ImageOff } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import { formatDuration, formatPrice } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Service } from '@/types/service';

/**
 * Vendor-side service row: thumbnail, name, price · duration, and a tappable
 * active/inactive pill for a quick toggle. The card body opens the editor.
 */
export function ServiceCard({
  service,
  onPress,
  onToggleActive,
  toggling = false,
}: {
  service: Service;
  onPress: () => void;
  onToggleActive: () => void;
  toggling?: boolean;
}) {
  const thumb = service.imageUrl ?? service.images[0] ?? null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Edit ${service.name}`}
      onPress={onPress}
      className="flex-row border border-ink/15 bg-white active:bg-ink/5"
    >
      <View className="h-24 w-24 items-center justify-center border-r border-ink/10 bg-ink/5">
        {thumb ? (
          <Image source={thumb} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <ImageOff size={22} color={colors.inkSubtle} strokeWidth={2} />
        )}
      </View>

      <View className="flex-1 justify-between p-3">
        <View>
          <Text numberOfLines={1} className="font-display text-lg uppercase tracking-tight text-ink">
            {service.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-3">
            <Text className="font-sans-bold text-sm text-ink">
              {formatPrice(service.priceAmount, service.currency)}
            </Text>
            <View className="flex-row items-center gap-1">
              <Clock size={13} color={colors.inkMuted} strokeWidth={2} />
              <Text className="font-sans text-xs text-ink/60">
                {formatDuration(service.durationMinutes)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: service.isActive, busy: toggling }}
          accessibilityLabel={service.isActive ? 'Set inactive' : 'Set active'}
          hitSlop={6}
          disabled={toggling}
          onPress={onToggleActive}
          className={cn(
            'self-start px-2.5 py-1',
            service.isActive ? 'bg-acid' : 'border border-ink/20 bg-transparent',
            toggling && 'opacity-50',
          )}
        >
          <Text
            className={cn(
              'font-mono text-[10px] uppercase tracking-[0.14em]',
              service.isActive ? 'text-ink' : 'text-ink/50',
            )}
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
