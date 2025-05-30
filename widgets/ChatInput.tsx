import React from 'react';
import type { ChatInputProps } from './types';

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onTyping,
}) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSend();
    }}
    style={{ display: 'flex', gap: 8 }}
    role="search" // helps screen readers know this is an input area
    aria-label="Type and send a message"
  >
    <input
      type="text"
      value={input}
      onChange={e => {
        setInput(e.target.value);
        onTyping(e.target.value);
      }}
      style={{ flex: 1 }}
      placeholder="Type a message..."
      aria-label="Message input"
      autoComplete="off"
    />
    <button type="submit" aria-label="Send message">
      Send
    </button>
  </form>
);

export default ChatInput;