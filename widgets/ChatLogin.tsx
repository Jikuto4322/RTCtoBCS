import React from 'react';

interface ChatLoginProps {
  users: { id: string; label: string }[];
  onLogin: (user: { id: string; label: string }) => void;
}

const ChatLogin: React.FC<ChatLoginProps> = ({ users, onLogin }) => (
  <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fff', textAlign: 'center' }}>
    <h2>Login as:</h2>
    {users.map(u => (
      <button
        key={u.id}
        onClick={() => onLogin(u)}
        style={{
          margin: 8,
          padding: '12px 24px',
          borderRadius: 4,
          background: '#0d6efd',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {u.label}
      </button>
    ))}
  </div>
);

export default ChatLogin;