import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

/** The Slotify mark: an ink square cradling an acid chip. */
export function Logo({ size = 40 }: { size?: number }) {
  const inner = Math.round(size * 0.3);
  return (
    <View
      className="items-center justify-center bg-ink"
      style={{ width: size, height: size }}
    >
      <View className="bg-acid" style={{ width: inner, height: inner }} />
    </View>
  );
}

/** Mark + wordmark lockup. */
export function Wordmark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <Logo size={size} />
      <Text className="font-display text-3xl lowercase tracking-tight text-ink">slotify</Text>
    </View>
  );
}
