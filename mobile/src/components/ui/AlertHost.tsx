import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import {
  registerAlertHost,
  type SlotAlertButton,
  type SlotAlertButtonStyle,
  type SlotAlertOptions,
} from '@/lib/alert';

const LABEL_TONE: Record<SlotAlertButtonStyle, string> = {
  default: 'text-ink',
  cancel: 'text-ink/50',
  destructive: 'text-destructive',
};

/**
 * Renders the themed alert popup. Mount once at the root. Frosted-glass card
 * (expo-blur) with soft rounded corners and hairline dividers — the Apple alert
 * feel, tinted in Slotify's warm canvas with the brand's display type.
 */
export function AlertHost() {
  const [options, setOptions] = useState<SlotAlertOptions | null>(null);
  const scale = useSharedValue(1.08);
  const opacity = useSharedValue(0);

  useEffect(() => {
    registerAlertHost((next) => setOptions(next));
    return () => registerAlertHost(null);
  }, []);

  useEffect(() => {
    if (options) {
      scale.value = 1.08;
      opacity.value = 0;
      scale.value = withSpring(1, { damping: 18, stiffness: 240 });
      opacity.value = withTiming(1, { duration: 140 });
    }
  }, [options, scale, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

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
      <View className="flex-1 items-center justify-center px-12">
        <Animated.View entering={FadeIn.duration(120)} className="absolute inset-0 bg-ink/40">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={onBackdrop}
            className="flex-1"
          />
        </Animated.View>

        <Animated.View
          style={cardStyle}
          className="w-full max-w-[300px] overflow-hidden rounded-[22px] border border-white/40"
        >
          <BlurView tint="light" intensity={70} style={StyleSheet.absoluteFill} />
          <View className="absolute inset-0 bg-canvas/55" />

          <View className="items-center px-6 pb-5 pt-6">
            <Text className="text-center font-display text-lg uppercase leading-tight tracking-tight text-ink">
              {options?.title}
            </Text>
            {options?.message ? (
              <Text className="mt-2 text-center font-sans text-sm leading-relaxed text-ink/70">
                {options.message}
              </Text>
            ) : null}
          </View>

          <View className={cn('border-t border-ink/10', sideBySide && 'flex-row')}>
            {buttons.map((button, index) => (
              <Pressable
                key={`${button.text}-${index}`}
                accessibilityRole="button"
                onPress={() => press(button)}
                className={cn(
                  'items-center justify-center py-3.5 active:bg-ink/5',
                  sideBySide ? 'flex-1' : 'w-full',
                  index > 0 && (sideBySide ? 'border-l border-ink/10' : 'border-t border-ink/10')
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
