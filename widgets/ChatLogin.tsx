import React, { useState } from 'react';
import type { ChatLoginProps } from './types';

const API_URL = 'http://localhost:3000';

const ChatLogin: React.FC<ChatLoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin({ id: data.user.id, label: data.user.name, token: data.token });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fff', textAlign: 'center' }}>
      <h2 className="chat-login-heading">{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ margin: 8, padding: 8, width: '90%' }}
          />
        )}
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ margin: 8, padding: 8, width: '90%' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ margin: 8, padding: 8, width: '90%' }}
        />
        <button type="submit" style={{ margin: 8, padding: '12px 24px', borderRadius: 4, background: '#0d6efd', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <button onClick={() => setIsRegister(r => !r)} style={{ background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer' }}>
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default ChatLogin;