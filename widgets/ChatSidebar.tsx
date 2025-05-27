import React from 'react';

interface Conversation {
  id: string;
  participants: { id: string; userId: string; role: string }[];
  messages: { id: string; body: string }[];
}

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
      const other = conv.participants.find(p => p.userId !== loggedInUserId);
      return (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          style={{
            padding: 8,
            cursor: 'pointer',
            background: selectedConversationId === conv.id ? '#e7f1ff' : '#fff', // or a darker color for dark mode
            borderRadius: 4,
            marginBottom: 4,
            color: '#222', // <-- set text color for light mode
            fontWeight: 'bold',
          }}
        >
          <div style={{ color: '#222' /* or '#f1f1f1' for dark mode */ }}>
            {other ? other.role : 'Unknown'}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].body : 'No messages'}
          </div>
        </div>
      );
    })}
  </div>
);

export default ChatSidebar;