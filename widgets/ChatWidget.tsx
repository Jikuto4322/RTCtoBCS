import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ChatWidget.css';
import ChatLogin from './ChatLogin';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/ws';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch conversations for the logged in user
  const fetchConversations = useCallback(async () => {
    if (!loggedInUser) return;
    setLoading(true); // <-- Start loading
    try {
      const res = await fetch(`${API_URL}/conversations?userId=${loggedInUser.id}`);
      const data = await res.json();
      setConversations(data);

      if (data.length > 0) {
        const firstConv = data[0];
        setConversationId(firstConv.id);
        setMessages(firstConv.messages);
      } else {
        setConversationId(null);
        setMessages([]);
      }
    } catch (e) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false); // <-- Stop loading
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchConversations();
  }, [loggedInUser, fetchConversations]);

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
      if (msg.type === 'message') {
        // 1. If this is the open conversation, append to messages
        if (msg.payload.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg.payload]);
        }
        // 2. Update the conversations array so the sidebar and switching stay in sync
        setConversations((prevConvs) =>
          prevConvs.map((conv) =>
            conv.id === msg.payload.conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, msg.payload],
                }
              : conv
          )
        );
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
    await fetch(`${API_URL}/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: loggedInUser.id }),
    });
  };

  if (!loggedInUser) {
    return <ChatLogin onLogin={setLoggedInUser} />;
  }

  return (
    <div className="chat-widget-container">
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={conversationId}
        onSelect={id => {
          setConversationId(id);
          const conv = conversations.find(c => c.id === id);
          setMessages(conv ? conv.messages : []);
        }}
        loggedInUserId={loggedInUser.id}
      />
      <div className="chat-widget-main">
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
    </div>
  );
};

export default ChatWidget;