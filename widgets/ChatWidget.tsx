import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

interface Participant {
  id: string;
  userId: string;
  role: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
}

const API_URL = 'http://localhost:3000'; // Update if needed

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial conversation/messages
  useEffect(() => {
    async function fetchConversation() {
      setLoading(true);
      setError(null);
      try {
        // For demo: fetch the first conversation
        const res = await fetch(`${API_URL}/conversations`);
        const data: Conversation[] = await res.json();
        if (data.length > 0) {
          setMessages(data[0].messages);
        }
      } catch (e) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    }
    fetchConversation();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message (demo: just append locally)
  const handleSend = async () => {
    if (!input.trim()) return;
    // TODO: POST to /messages endpoint when implemented
    setMessages((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        senderId: 'me',
        body: input,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  return (
    <div style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8, padding: 16, background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ height: 300, overflowY: 'auto', marginBottom: 8, background: '#f9f9f9', borderRadius: 4, padding: 8 }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : messages.length === 0 ? (
          <div>No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ margin: '8px 0', textAlign: msg.senderId === 'me' ? 'right' : 'left' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: msg.senderId === 'me' ? '#d1e7dd' : '#e2e3e5',
                  color: '#222',
                  borderRadius: 16,
                  padding: '8px 12px',
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                }}
                aria-label={msg.senderId === 'me' ? 'You' : 'Agent'}
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
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
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
    </div>
  );
};

export default ChatWidget;