import React, { useEffect, useRef, useState, useCallback } from 'react';

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

const API_URL = 'http://localhost:3000';

const users = [
  { id: '1', label: 'Customer' },
  { id: '2', label: 'Agent' }
];

const ChatWidget: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; label: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation for the selected user
  const fetchConversation = useCallback(async () => {
    if (!loggedInUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/conversations?userId=${loggedInUser.id}`);
      const data: Conversation[] = await res.json();
      if (data.length > 0) {
        setConversationId(data[0].id);
        setMessages(data[0].messages);
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchConversation();
  }, [loggedInUser, fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !loggedInUser || !conversationId) return;
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: loggedInUser.id,
          body: input,
        }),
      });
      setInput('');
      // Re-fetch messages after sending
      fetchConversation();
    } catch (e) {
      setError('Failed to send message');
    }
  };

  // Login simulation UI
  if (!loggedInUser) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fff', textAlign: 'center' }}>
        <h2>Login as:</h2>
        {users.map(u => (
          <button
            key={u.id}
            onClick={() => setLoggedInUser(u)}
            style={{
              margin: 8,
              padding: '12px 24px',
              borderRadius: 4,
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {u.label}
          </button>
        ))}
      </div>
    );
  }

  // Chat UI
  return (
    <div style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8, padding: 16, background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Logged in as: {loggedInUser.label}</div>
      <div style={{ height: 300, overflowY: 'auto', marginBottom: 8, background: '#f9f9f9', borderRadius: 4, padding: 8 }}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : messages.length === 0 ? (
          <div>No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ margin: '8px 0', textAlign: msg.senderId === loggedInUser.id ? 'right' : 'left' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: msg.senderId === loggedInUser.id ? '#d1e7dd' : '#e2e3e5',
                  color: '#222',
                  borderRadius: 16,
                  padding: '8px 12px',
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                }}
                aria-label={msg.senderId === loggedInUser.id ? 'You' : 'Other'}
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