import { type LucideIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';

/** Centred empty / error state with an optional recovery action. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-10 py-16">
      <View className="h-16 w-16 items-center justify-center border border-ink/15 bg-white">
        <Icon size={26} color={colors.inkMuted} strokeWidth={2} />
      </View>
      <Text className="mt-5 text-center font-display text-2xl uppercase tracking-tight text-ink">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 text-center font-sans text-sm leading-relaxed text-ink/60">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-44">
          <Button label={actionLabel} variant="outline" size="md" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
