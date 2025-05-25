import React, { useState } from 'react';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([...messages, input]);
    setInput('');
    // TODO: Send message to backend via REST or WebSocket
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, width: 300 }}>
      <div style={{ height: 200, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: '4px 0' }}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        style={{ width: '80%' }}
      />
      <button onClick={handleSend} style={{ width: '18%', marginLeft: '2%' }}>
        Send
      </button>
    </div>
  );
};

export default ChatWidget;