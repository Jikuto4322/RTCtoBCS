import type { RefObject } from 'react';

export interface User {
  id: string;
  label: string;
}

export interface Participant {
  id: string;
  userId: string;
  role: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: string; 
}

export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
  unreadCount?: number;
}

export interface ChatMessagesProps {
  messages: Message[];
  loggedInUserId: string;
  loading: boolean;
  error: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export interface ChatLoginProps {
  onLogin: (user: { id: string; label: string }, token: string) => void;
}

export interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  onTyping: (value: string) => void;
  conversationId: string | null;
  loggedInUser: { id: string; label: string } | null;
}

export type ChatSidebarProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelect: (id: string) => void;
  loggedInUserId: string;
  presenceUsers: { id: string; online: boolean }[]; // ✅ CORRECT
};