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
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(conv.id);
          }}
          className={`sidebar-conv${conv.id === selectedConversationId ? ' selected' : ''}`}
          tabIndex={0}
          role="button"
          aria-pressed={conv.id === selectedConversationId}
          aria-label={`Open chat with ${otherParticipant?.user?.name || otherParticipant?.userId}${(conv.unreadCount ?? 0) > 0 ? `, ${conv.unreadCount} unread messages` : ''}`}
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
            outline: 'none',
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
          {/* Unread badge */}
          {(conv.unreadCount ?? 0) > 0 && (
            <span
              className="unread-badge"
              style={{
                background: '#e53935',
                color: '#fff',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 'bold',
                marginLeft: 8,
                minWidth: 20,
                textAlign: 'center',
                display: 'inline-block',
              }}
              title={`${conv.unreadCount ?? 0} unread message${(conv.unreadCount ?? 0) > 1 ? 's' : ''}`}
            >
              {conv.unreadCount ?? 0}
            </span>
          )}
        </div>
      );
    })}
  </div>
);

export default ChatSidebar;