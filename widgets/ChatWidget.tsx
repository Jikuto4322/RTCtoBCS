import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ChatWidget.css';
import ChatLogin from './ChatLogin';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import ChatIsTyping from './ChatIsTyping';
import type { Message, Conversation } from './types';

const API_URL = 'http://localhost:3000';

const ChatWidget: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; label: string } | null>(null);
  const [jwt, setJwt] = useState<string | null>(null); // <-- Add JWT state
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ id: string; label: string; conversationId: string }[]>([]);
  const [presenceUsers, setPresenceUsers] = useState<{ id: string; online: boolean }[]>([]);
  const [wsReady, setWsReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const loggedInUserRef = useRef<{ id: string; label: string } | null>(null);

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

  // WebSocket connection & reconnection logic
  useEffect(() => {
    if (!loggedInUser || !jwt) return; // <-- Only connect if jwt is set

    const WS_URL = `ws://localhost:3000/ws?token=${jwt}`;
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    let shouldReconnect = true;

    const connect = () => {
      ws = new window.WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsReady(true);
        reconnectAttempts = 0;
        // Send join for all conversations
        conversations.forEach(conv => {
          ws!.send(
            JSON.stringify({
              type: 'join',
              payload: {
                userId: loggedInUser.id,
                conversationId: conv.id,
              },
            })
          );
        });
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'message') {
          setConversations(prevConvs =>
            prevConvs.map(conv => {
              if (conv.id === msg.payload.conversationId) {
                const isActive = conversationIdRef.current === msg.payload.conversationId;
                const isSender = msg.payload.senderId === loggedInUserRef.current?.id;
                const alreadyExists = conv.messages.some(m => m.id === msg.payload.id);
                // Remove optimistic message if it matches sender/body and has a temp id
                const filteredMessages = conv.messages.filter(
                  m =>
                    !(
                      m.senderId === msg.payload.senderId &&
                      m.body === msg.payload.body &&
                      m.id.length < 20 // crude check: temp ids are usually shorter than DB ids
                    )
                );
                return {
                  ...conv,
                  messages: alreadyExists
                    ? conv.messages
                    : [...filteredMessages, msg.payload],
                  unreadCount: isSender || isActive
                    ? 0
                    : (conv.unreadCount ?? 0) + (alreadyExists ? 0 : 1),
                };
              }
              return conv;
            })
          );
        } else if (msg.type === 'typing') {
          const { senderId, senderLabel, isTyping } = msg.payload;
          if (!loggedInUser) return;
          setTypingUsers((prev) => {
            // Remove any previous entry for this user in any conversation
            const filtered = prev.filter((user) => user.id !== senderId);
            if (isTyping) {
              return [...filtered, { id: senderId, label: senderLabel, conversationId: msg.payload.conversationId }];
            } else {
              return filtered;
            }
          });
        } else if (msg.type === 'presence') {
          // msg.payload: { userId: string, online: boolean }
          setPresenceUsers(prev => {
            // Update or add the user's presence
            const filtered = prev.filter(u => u.id !== msg.payload.userId);
            return [...filtered, { id: msg.payload.userId, online: msg.payload.online }];
          });
        }
      };

      ws.onclose = () => {
        setWsReady(false);
        wsRef.current = null;
        if (shouldReconnect) {
          reconnectAttempts++;
          const timeout = Math.min(1000 * 2 ** reconnectAttempts, 10000);
          reconnectTimeout.current = setTimeout(connect, timeout);
        }
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      ws?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, jwt, conversations.length]); // <-- Add jwt as dependency

  // Send message via WebSocket
  const handleSend = async () => {
    if (!input.trim() || !loggedInUser || !conversationId) return;

    // Create a temporary message object for optimistic UI
    const newMessage = {
      id: Date.now().toString(), // temporary id
      conversationId,
      senderId: loggedInUser.id,
      body: input,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update conversations and messages
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );

    setInput('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'message',
          payload: {
            conversationId,
            senderId: loggedInUser.id,
            body: input,
          },
        })
      );
      wsRef.current.send(
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
  };

  // Handle typing indication
  const handleTyping = (value: string) => {
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
      if (ws && ws.readyState === ws.OPEN) {
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

  // Send join for new conversations (after initial connect)
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !loggedInUser) return;
    conversations.forEach(conv => {
      wsRef.current!.send(
        JSON.stringify({
          type: 'join',
          payload: {
            userId: loggedInUser.id,
            conversationId: conv.id,
          },
        })
      );
    });
  }, [conversations, loggedInUser]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    const conv = conversations.find(c => c.id === conversationId);
    setMessages(conv ? conv.messages : []);
  }, [conversations, conversationId]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    loggedInUserRef.current = loggedInUser;
  }, [loggedInUser]);

  if (!loggedInUser) {
    // Pass setJwt to ChatLogin so it can set the JWT after login
    return <ChatLogin onLogin={(user, token) => { setLoggedInUser(user); setJwt(token); }} />;
  }

  const otherTypingUsers = typingUsers
    .filter(u => u.id !== loggedInUser.id && u.conversationId === conversationId);

  return (
    <div className="chat-widget-container">
      <ChatSidebar
        conversations={conversations}
        selectedConversationId={conversationId}
        onSelect={id => {
          setConversationId(id);
          const conv = conversations.find(c => c.id === id);
          setMessages(conv ? conv.messages : []);
          setConversations(prevConvs =>
            prevConvs.map(conv =>
              conv.id === id ? { ...conv, unreadCount: 0 } : conv
            )
          );
        }}
        loggedInUserId={loggedInUser.id}
        presenceUsers={presenceUsers}
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