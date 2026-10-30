import { Text, View } from 'react-native';

import { BOOKING_STATUS_META, type StatusTone } from '@/lib/bookingStatus';
import { cn } from '@/lib/cn';
import type { BookingStatus } from '@/types/booking';

const TONE: Record<StatusTone, string> = {
  ink: 'bg-ink',
  acid: 'bg-acid',
  muted: 'border border-ink/20 bg-transparent',
  destructive: 'bg-destructive',
};

const TONE_TEXT: Record<StatusTone, string> = {
  ink: 'text-canvas',
  acid: 'text-ink',
  muted: 'text-ink/60',
  destructive: 'text-white',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = BOOKING_STATUS_META[status];
  return (
    <View className={cn('self-start px-2.5 py-1', TONE[meta.tone])}>
      <Text className={cn('font-mono text-[10px] uppercase tracking-[0.14em]', TONE_TEXT[meta.tone])}>
        {meta.label}
      </Text>
    </View>
  );
}
