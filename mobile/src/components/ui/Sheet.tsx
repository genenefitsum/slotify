import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Bottom sheet: dimmed backdrop (tap to dismiss) + a spring-in panel. */
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      {/* Lift the panel above the keyboard so text inputs stay visible (iOS). */}
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onClose}
          className="absolute inset-0 bg-ink/40"
        />
        <Animated.View
          entering={SlideInDown.springify().damping(22)}
          className="border-t border-ink/10 bg-canvas"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="items-center pt-3">
            <View className="h-1 w-10 rounded-full bg-ink/15" />
          </View>
          <View className="px-6 pt-4">
            {title ? (
              <Text className="mb-4 font-display text-2xl uppercase tracking-tight text-ink">
                {title}
              </Text>
            ) : null}
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
