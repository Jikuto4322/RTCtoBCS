import React from 'react';
import type { Message } from './types';

const ChatMessages: React.FC<{
  messages: Message[];
  loggedInUserId: string;
  loading?: boolean;
  error?: string | null;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ messages, loggedInUserId, loading, error, messagesEndRef }) => (
  <div
    role="log"
    aria-live="polite"
    aria-relevant="additions"
    style={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}
    tabIndex={0}
  >
    {loading && <div>Loading...</div>}
    {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
    {messages.map(msg => (
      <div
        key={msg.id}
        aria-label={`${msg.senderId === loggedInUserId ? 'You' : msg.senderId}: ${msg.body}`}
        style={{
          textAlign: msg.senderId === loggedInUserId ? 'right' : 'left',
          margin: '4px 0',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: msg.senderId === loggedInUserId ? '#90caf9' : '#eee', // darker blue for sent
            color: '#222', // dark text for both
            borderRadius: 12,
            padding: '6px 12px',
            maxWidth: '70%',
            wordBreak: 'break-word',
          }}
        >
          {msg.body}
        </span>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;