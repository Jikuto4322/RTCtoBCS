import React from 'react';

const ChatIsTyping: React.FC<{ typingUsers: string[] }> = ({ typingUsers }) =>
  typingUsers.length > 0 ? (
    <div style={{ fontStyle: 'italic', color: '#888', margin: 4 }}>
      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
    </div>
  ) : null;

export default ChatIsTyping;