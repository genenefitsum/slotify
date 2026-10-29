import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (for forms / long content). */
  scroll?: boolean;
  /** Lift content above the keyboard (pair with `scroll` for forms). */
  keyboardAware?: boolean;
  /** Safe-area edges to inset. Defaults to all. */
  edges?: Edge[];
  /** Classes for the inner content container. */
  contentClassName?: string;
};

/**
 * Canvas-backed, safe-area-aware screen container. The single entry point every
 * screen uses so background, insets, scrolling, and keyboard behaviour stay
 * consistent across the app.
 */
export function Screen({
  children,
  scroll = false,
  keyboardAware = false,
  edges = ['top', 'bottom', 'left', 'right'],
  contentClassName,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('grow', contentClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={cn('flex-1', contentClassName)}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-canvas">
      {keyboardAware ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}
