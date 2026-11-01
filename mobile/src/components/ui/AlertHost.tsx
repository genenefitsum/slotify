import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import {
  registerAlertHost,
  type SlotAlertButton,
  type SlotAlertButtonStyle,
  type SlotAlertOptions,
} from '@/lib/alert';

const LABEL_TONE: Record<SlotAlertButtonStyle, string> = {
  default: 'text-ink',
  cancel: 'text-ink/40',
  destructive: 'text-destructive',
};

/**
 * Renders the themed alert popup. Mount once at the root. Editorial Slotify
 * styling (hard-edged canvas card, ink dividers) with Apple-simple structure:
 * centered title + message, then flat divider-separated actions.
 */
export function AlertHost() {
  const [options, setOptions] = useState<SlotAlertOptions | null>(null);

  useEffect(() => {
    registerAlertHost((next) => setOptions(next));
    return () => registerAlertHost(null);
  }, []);

  const close = () => setOptions(null);

  const press = (button: SlotAlertButton) => {
    close();
    button.onPress?.();
  };

  // Tapping the backdrop is treated as the cancel action when one exists,
  // never a destructive/default one; otherwise it just dismisses.
  const onBackdrop = () => {
    const cancel = options?.buttons?.find((b) => b.style === 'cancel');
    close();
    cancel?.onPress?.();
  };

  const buttons: SlotAlertButton[] = options?.buttons?.length
    ? options.buttons
    : [{ text: 'OK', style: 'default' }];
  const sideBySide = buttons.length === 2;

  return (
    <Modal
      visible={options !== null}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onBackdrop}
    >
      <View className="flex-1 items-center justify-center px-10">
        <Animated.View entering={FadeIn.duration(120)} className="absolute inset-0 bg-ink/50">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={onBackdrop}
            className="flex-1"
          />
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(140)}
          className="w-full max-w-[320px] border-2 border-ink bg-canvas"
        >
          <View className="items-center px-6 pb-6 pt-7">
            <Text className="text-center font-display text-xl uppercase leading-tight tracking-tight text-ink">
              {options?.title}
            </Text>
            {options?.message ? (
              <Text className="mt-2.5 text-center font-sans text-sm leading-relaxed text-ink/70">
                {options.message}
              </Text>
            ) : null}
          </View>

          <View className={cn('border-t-2 border-ink', sideBySide && 'flex-row')}>
            {buttons.map((button, index) => (
              <Pressable
                key={`${button.text}-${index}`}
                accessibilityRole="button"
                onPress={() => press(button)}
                className={cn(
                  'items-center justify-center py-4 active:bg-ink/5',
                  sideBySide ? 'flex-1' : 'w-full',
                  index > 0 && (sideBySide ? 'border-l-2 border-ink' : 'border-t border-ink/15')
                )}
              >
                <Text
                  className={cn(
                    'font-display text-xs uppercase tracking-wide',
                    LABEL_TONE[button.style ?? 'default']
                  )}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
