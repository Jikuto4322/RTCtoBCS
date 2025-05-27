import React from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend }) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSend();
    }}
    style={{ display: 'flex', gap: 8 }}
    aria-label="Send message form"
  >
    <input
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
      placeholder="Type a message..."
      style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
      aria-label="Message input"
    />
    <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#0d6efd', color: '#fff', border: 'none' }}>
      Send
    </button>
  </form>
);

export default ChatInput;