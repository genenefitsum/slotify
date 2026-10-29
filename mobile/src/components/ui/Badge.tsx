import { Text, View } from 'react-native';

import { cn } from '@/lib/cn';
import { PulseDot } from '@/components/ui/PulseDot';

/** Editorial micro-label: bordered pill, live acid dot, tracked-out mono text. */
export function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-2 self-start border border-ink/20 bg-canvas px-3 py-1.5',
        className
      )}
    >
      <PulseDot />
      <Text className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/70">{label}</Text>
    </View>
  );
}
