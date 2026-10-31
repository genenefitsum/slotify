import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

/**
 * A single row in a settings/profile group. Shows an optional leading icon, a
 * label, and either a trailing value (static) or a chevron (navigates/acts).
 */
export function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  destructive = false,
  last = false,
}: {
  icon?: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const haptics = useHaptics();
  const tint = destructive ? colors.white : colors.inkMuted;

  const body = (
    <View
      className={cn(
        'flex-row items-center gap-3 px-4 py-4',
        !last && 'border-b border-ink/10'
      )}
    >
      {Icon ? (
        <View
          className={cn(
            'h-8 w-8 items-center justify-center',
            destructive ? 'bg-destructive' : 'bg-ink/5'
          )}
        >
          <Icon size={16} color={destructive ? tint : colors.ink} strokeWidth={2} />
        </View>
      ) : null}
      <Text
        className={cn(
          'flex-1 font-sans text-base',
          destructive ? 'text-destructive' : 'text-ink'
        )}
      >
        {label}
      </Text>
      {value ? <Text className="font-sans text-sm text-ink/50">{value}</Text> : null}
      {onPress ? <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} /> : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      className="active:bg-ink/5"
    >
      {body}
    </Pressable>
  );
}

/** Bordered container that wraps a set of SettingsRows. */
export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-7">
      {title ? (
        <Text className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {title}
        </Text>
      ) : null}
      <View className="border border-ink/15 bg-white">{children}</View>
    </View>
  );
}
