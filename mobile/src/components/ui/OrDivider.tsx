import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';

/** Horizontal rule with a centred mono label. */
export function OrDivider({ label = 'or', className }: { label?: string; className?: string }) {
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <View className="h-px flex-1 bg-ink/15" />
      <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{label}</Text>
      <View className="h-px flex-1 bg-ink/15" />
    </View>
  );
}
