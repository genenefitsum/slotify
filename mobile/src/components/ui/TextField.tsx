import { Eye, EyeOff } from 'lucide-react-native';
import { type ComponentRef, forwardRef, useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  /** Renders a show/hide toggle and masks input. */
  secure?: boolean;
  containerClassName?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry' | 'style'>;

/**
 * Labelled text input in the editorial style: mono uppercase label, hard-edged
 * field, ink focus ring, inline error. Controlled — pairs cleanly with
 * react-hook-form's Controller.
 */
export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, value, onChangeText, error, secure = false, containerClassName, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View className={cn('w-full', containerClassName)}>
      <Text className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/60">
        {label}
      </Text>

      <View
        className={cn(
          'h-14 flex-row items-center border bg-white px-4',
          focused ? 'border-ink' : 'border-ink/15',
          error && 'border-destructive'
        )}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.ink}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className="h-full flex-1 font-sans text-base text-ink"
          {...rest}
        />

        {secure ? (
          <Pressable
            hitSlop={10}
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            {hidden ? (
              <Eye size={20} color={colors.inkMuted} />
            ) : (
              <EyeOff size={20} color={colors.inkMuted} />
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-1.5 font-sans text-xs text-destructive">{error}</Text>
      ) : null}
    </View>
  );
});
