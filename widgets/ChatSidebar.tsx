import React from 'react';
import type { Conversation } from './types';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelect: (id: string) => void;
  loggedInUserId: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  onSelect,
  loggedInUserId,
}) => (
  <div style={{ width: 220, borderRight: '1px solid #eee', padding: 8 }}>
    <h4>Chats</h4>
    {conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== loggedInUserId);
      const lastMessage = conv.messages[conv.messages.length - 1];
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
          }}
        >
          <div style={{ color: '#222' }}>
            {otherParticipant?.user?.name || otherParticipant?.userId}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {lastMessage ? lastMessage.body : ''}
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