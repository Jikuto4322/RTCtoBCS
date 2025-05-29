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
    />
    <button type="submit">Send</button>
  </form>
);

export default ChatInput;