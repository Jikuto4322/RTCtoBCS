import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ChatWidget.css';
import ChatLogin from './ChatLogin';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import ChatIsTyping from './ChatIsTyping';
import type {Message, Conversation} from './types';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/ws';

const ChatWidget: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; label: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; label: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations for the logged in user
  const fetchConversations = useCallback(async () => {
    if (!loggedInUser) return;
    setLoading(true); 
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
      setLoading(false);
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
    if (!loggedInUser || !conversationId) return;
    const ws = new window.WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'join',
          payload: {
            userId: loggedInUser.id,
            conversationId,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'message') {
        // Always update the conversations array for sidebar
        setConversations((prevConvs) =>
          prevConvs.map((conv) => {
            if (conv.id === msg.payload.conversationId) {
              // If not the currently open conversation, increment unreadCount
              const isActive = msg.payload.conversationId === conversationId;
              return {
                ...conv,
                messages: [...conv.messages, msg.payload],
                unreadCount: isActive ? 0 : (conv.unreadCount || 0) + 1,
              };
            }
            return conv;
          })
        );
        // Only update messages if this is the open conversation
        if (msg.payload.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg.payload]);
        }
      } else if (msg.type === 'typing') {
        const { senderId, senderLabel, isTyping } = msg.payload;
        console.log('typing event:', { senderId, loggedInUserId: loggedInUser.id, isTyping });
        setTypingUsers((prev) => {
          if (senderId === loggedInUser.id) return prev;
          if (isTyping) {
            if (!prev.find((user) => user.id === senderId)) {
              return [...prev, { id: senderId, label: senderLabel }];
            }
            return prev;
          } else {
            return prev.filter((user) => user.id !== senderId);
          }
        });
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

    // ...create conversation if needed...

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message',
          payload: {
            conversationId,
            senderId: loggedInUser.id,
            body: input,
            // add other fields as needed
          },
        })
      );
    }

    setInput('');
  };

  // Handle typing indication
  const handleTyping = (value: string) => {
    console.log('handleTyping', { loggedInUser, conversationId, value });
    if (!loggedInUser || !conversationId) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'typing',
          payload: {
            conversationId,
            senderId: loggedInUser.id,
            senderLabel: loggedInUser.label,
            isTyping: true,
          },
        })
      );
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      if (ws && ws.readyState === ws.OPEN && value.trim() === '') {
        ws.send(
          JSON.stringify({
            type: 'typing',
            payload: {
              conversationId,
              senderId: loggedInUser.id,
              senderLabel: loggedInUser.label,
              isTyping: false,
            },
          })
        );
      }
    }, 1500);
  };

  if (!loggedInUser) {
    return <ChatLogin onLogin={setLoggedInUser} />;
  }

  const otherTypingUsers = typingUsers.filter(u => u.id !== loggedInUser.id);

  return (
    <div className="chat-widget-container">
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={conversationId}
        onSelect={id => {
          setConversationId(id);
          const conv = conversations.find(c => c.id === id);
          setMessages(conv ? conv.messages : []);
          // Reset unread count for this conversation
          setConversations(prevConvs =>
            prevConvs.map(conv =>
              conv.id === id ? { ...conv, unreadCount: 0 } : conv
            )
          );
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
        {otherTypingUsers.length > 0 && (
          <ChatIsTyping typingUsers={otherTypingUsers.map(u => u.label)} />
        )}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onTyping={handleTyping}
          conversationId={conversationId}
          loggedInUser={loggedInUser}
        />
      </div>
    </div>
  );
};

export default ChatWidget;