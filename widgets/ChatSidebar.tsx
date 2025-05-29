import React from 'react';
import type { ChatSidebarProps } from './types';

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelect,
  loggedInUserId,
  presenceUsers,
}) => (
  <div style={{ width: 220, borderRight: '1px solid #eee', padding: 8 }}>
    <h4>Chats</h4>
    {conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== loggedInUserId);
      const lastMessage = conv.messages[conv.messages.length - 1];
      // Find presence for the other participant
      const isOnline = presenceUsers.find(u => u.id === otherParticipant?.userId)?.online;
      return (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`sidebar-conv${conv.id === selectedConversationId ? ' selected' : ''}`}
          style={{
            padding: 8,
            cursor: 'pointer',
            background: selectedConversationId === conv.id ? '#e7f1ff' : '#fff',
            borderRadius: 4,
            marginBottom: 4,
            color: '#222',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Presence dot */}
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isOnline ? '#4caf50' : '#bbb',
              marginRight: 6,
              border: '1px solid #888',
            }}
            title={isOnline ? 'Online' : 'Offline'}
          />
          <div style={{ flex: 1 }}>
            <div style={{ color: '#222' }}>
              {otherParticipant?.user?.name || otherParticipant?.userId}
              {/* Online/Offline text */}
              <span style={{ fontSize: 11, color: isOnline ? '#4caf50' : '#bbb', marginLeft: 8 }}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {lastMessage ? lastMessage.body : ''}
            </div>
          </div>
          {(conv.unreadCount ?? 0) > 0 && (
            <span className="unread-badge">{conv.unreadCount}</span>
          )}
        </div>
      );
    })}
  </div>
);

export default ChatSidebar;