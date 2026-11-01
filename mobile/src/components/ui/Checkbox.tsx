import { Check } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

/** Hard-edged brand checkbox (ink box, acid check). */
export function Checkbox({
  checked,
  onChange,
  accessibilityLabel,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={() => onChange(!checked)}
      className={cn(
        'h-6 w-6 items-center justify-center border-2',
        checked ? 'border-ink bg-ink' : 'border-ink/30 bg-white'
      )}
    >
      {checked ? <Check size={15} color={colors.acid} strokeWidth={3} /> : null}
    </Pressable>
  );
}
