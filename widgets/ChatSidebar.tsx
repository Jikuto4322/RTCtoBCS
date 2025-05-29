import React from 'react';

interface Conversation {
  id: string;
  participants: { id: string; userId: string; role: string; user?: { name?: string; email?: string } }[];
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
}) => (
  <div style={{ width: 220, borderRight: '1px solid #eee', padding: 8 }}>
    <h4>Chats</h4>
    {conversations.map(conv => {
      // Only show the CUSTOMER participant(s) for this conversation
      const customer = conv.participants.find(
        p => p.role === 'CUSTOMER'
      );
      if (!customer) return null; // Skip if no customer in this conversation

      return (
        <div
          key={conv.id}
          onClick={() => onSelect(conv.id)}
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
            {customer.user?.name || customer.userId}
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