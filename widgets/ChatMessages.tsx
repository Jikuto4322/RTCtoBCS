import React from 'react';
import type { RefObject } from 'react';

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface ChatMessagesProps {
  messages: Message[];
  loggedInUserId: string;
  loading: boolean;
  error: string | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  loggedInUserId,
  loading,
  error,
  messagesEndRef,
}) => (
  <div style={{ height: 300, overflowY: 'auto', marginBottom: 8, background: '#f9f9f9', borderRadius: 4, padding: 8 }}>
    {loading ? (
      <div>Loading...</div>
    ) : error ? (
      <div style={{ color: 'red' }}>{error}</div>
    ) : messages.length === 0 ? (
      <div>No messages yet.</div>
    ) : (
      messages.map((msg) => (
        <div key={msg.id} style={{ margin: '8px 0', textAlign: msg.senderId === loggedInUserId ? 'right' : 'left' }}>
          <span
            className="chat-message-bubble"
            style={{
              display: 'inline-block',
              background: msg.senderId === loggedInUserId ? '#d1e7dd' : '#e2e3e5',
              color: '#222',
              borderRadius: 16,
              padding: '8px 12px',
              maxWidth: '70%',
              wordBreak: 'break-word',
            }}
            aria-label={msg.senderId === loggedInUserId ? 'You' : 'Other'}
          >
            {msg.body}
          </span>
          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
            {new Date(msg.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;