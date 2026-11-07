import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { getErrorMessage } from '@/api/http';
import { type SupportMessage, supportApi } from '@/api/support.api';
import { env } from '@/lib/env';

const GREETING: SupportMessage = {
  role: 'assistant',
  content: "Hi! I'm the Slotify assistant. Ask me anything about booking, cancellations, reviews, or your account.",
};

/**
 * Drives the support chat: holds the message history, sends it to the backend,
 * and appends the reply. On failure it appends an assistant bubble pointing to
 * the support email so the user always has a next step.
 */
export function useSupportChat() {
  const [messages, setMessages] = useState<SupportMessage[]>([GREETING]);

  const mutation = useMutation({
    mutationFn: (history: SupportMessage[]) => supportApi.chat(history),
  });

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || mutation.isPending) return;

      // History sent to the server excludes the local greeting bubble.
      const history = messages.filter((m) => m !== GREETING);
      const nextHistory: SupportMessage[] = [...history, { role: 'user', content: trimmed }];
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);

      try {
        const { reply } = await mutation.mutateAsync(nextHistory);
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch (error) {
        const detail = getErrorMessage(error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry — I couldn't answer that right now (${detail}). You can email us at ${env.supportEmail}.`,
          },
        ]);
      }
    },
    [messages, mutation]
  );

  return { messages, send, isSending: mutation.isPending };
}
