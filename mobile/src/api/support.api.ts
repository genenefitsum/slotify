import { http } from '@/api/http';

export type SupportRole = 'user' | 'assistant';

export type SupportMessage = {
  role: SupportRole;
  content: string;
};

export const supportApi = {
  /** Send the chat history; the backend returns the assistant's next reply. */
  chat: (messages: SupportMessage[]) =>
    http.post<{ reply: string }>('/support/chat', { messages }),
};
