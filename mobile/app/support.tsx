import { useRef, useState } from 'react';
import { ArrowUp, Mail } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type SupportMessage } from '@/api/support.api';
import { BackButton } from '@/components/ui/BackButton';
import { useHaptics } from '@/hooks/useHaptics';
import { useSupportChat } from '@/hooks/useSupportChat';
import { env } from '@/lib/env';
import { colors } from '@/theme/colors';

function Bubble({ message }: { message: SupportMessage }) {
  const isUser = message.role === 'user';
  return (
    <View className={isUser ? 'items-end' : 'items-start'}>
      <View
        className={
          isUser
            ? 'max-w-[82%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5'
            : 'max-w-[82%] rounded-2xl rounded-bl-md border border-ink/12 bg-white px-4 py-2.5'
        }
      >
        <Text
          className={
            isUser
              ? 'font-sans text-[15px] leading-relaxed text-canvas'
              : 'font-sans text-[15px] leading-relaxed text-ink'
          }
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { messages, send, isSending } = useSupportChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<SupportMessage>>(null);

  const onSend = () => {
    const text = draft.trim();
    if (!text || isSending) return;
    haptics.light();
    setDraft('');
    void send(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-2">
        <BackButton />
        <Pressable
          hitSlop={8}
          className="flex-row items-center gap-1.5"
          onPress={() => void Linking.openURL(`mailto:${env.supportEmail}`)}
        >
          <Mail size={14} color={colors.ink} />
          <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/60">
            Email us
          </Text>
        </Pressable>
      </View>

      <View className="px-6 pb-3 pt-2">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Support</Text>
        <Text className="mt-1 font-display text-4xl uppercase leading-[0.9] tracking-tight text-ink">
          Ask Slotify
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <Bubble message={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isSending ? (
              <View className="mt-3 items-start">
                <View className="rounded-2xl rounded-bl-md border border-ink/12 bg-white px-4 py-3">
                  <ActivityIndicator color={colors.ink} />
                </View>
              </View>
            ) : undefined
          }
        />

        {/* Composer */}
        <View
          className="flex-row items-end gap-2 border-t border-ink/10 bg-canvas px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <View className="flex-1 rounded-2xl border border-ink/15 bg-white px-4 py-2.5">
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your question…"
              placeholderTextColor={colors.inkSubtle}
              multiline
              className="max-h-28 font-sans text-[15px] text-ink"
              onSubmitEditing={onSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim() || isSending}
            onPress={onSend}
            className={
              draft.trim() && !isSending
                ? 'h-11 w-11 items-center justify-center rounded-full bg-ink'
                : 'h-11 w-11 items-center justify-center rounded-full bg-ink/20'
            }
          >
            <ArrowUp size={20} color={colors.canvas} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
