import React, { useEffect, useRef, useState, useCallback } from 'react';
import ChatLogin from './ChatLogin';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/ws';

const users = [
  { id: '1', label: 'Customer' },
  { id: '2', label: 'Agent' }
];

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

const ChatWidget: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; label: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Connect to WebSocket on login
  useEffect(() => {
    if (!loggedInUser) return;
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'message' && msg.payload.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg.payload]);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [loggedInUser, conversationId]);

  // Send message via WebSocket
  const handleSend = async () => {
    if (!input.trim() || !loggedInUser) return;
    let convId = conversationId;
    if (!convId) {
      // Create conversation
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: '1', // or loggedInUser.id
          businessId: '2', // or the other user's id
        }),
      });
      const data = await res.json();
      convId = data.id;
      setConversationId(convId);
    }
    const ws = wsRef.current;
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'message',
          payload: {
            conversationId: convId,
            senderId: loggedInUser.id,
            body: input,
            createdAt: new Date().toISOString(),
          },
        })
      );
      setInput('');
    }
    // Optionally, still POST to backend for persistence
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: convId,
        senderId: loggedInUser.id,
        body: input,
      }),
    });
  };

  if (!loggedInUser) {
    return <ChatLogin users={users} onLogin={setLoggedInUser} />;
  }

  return (
    <div style={{ maxWidth: 400, border: '1px solid #ccc', borderRadius: 8, padding: 16, background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Logged in as: {loggedInUser.label}</div>
      <ChatMessages
        messages={messages}
        loggedInUserId={loggedInUser.id}
        loading={loading}
        error={error}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput input={input} setInput={setInput} onSend={handleSend} />
    </div>
  );
};

export default ChatWidget;