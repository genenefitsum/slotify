import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

/** Editorial search field: hard-edged, icon-led, with a clear affordance. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  className,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'h-14 flex-row items-center border border-ink/15 bg-white px-4',
        className
      )}
    >
      <Search size={18} color={colors.inkMuted} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        selectionColor={colors.ink}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        className="ml-3 h-full flex-1 font-sans text-base text-ink"
      />
      {value.length > 0 ? (
        <Pressable
          hitSlop={10}
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={18} color={colors.inkMuted} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}
