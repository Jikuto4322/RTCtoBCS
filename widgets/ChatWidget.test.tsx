import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWidget from './ChatWidget';

// Mock WebSocket and EventSource for testing
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
})) as any;

global.EventSource = jest.fn(() => ({
  addEventListener: jest.fn(),
  close: jest.fn(),
  onmessage: null,
  onerror: null,
  onopen: null,
})) as any;

describe('ChatWidget', () => {
  test('renders ChatWidget and sends a message', () => {
    render(<ChatWidget />);
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('shows unread badge when there are unread messages', () => {
    render(<ChatWidget />);
    // Simulate unread messages by updating props/state if needed
    // For demonstration, assume unread badge with "2" appears
    expect(screen.queryByText('2')).toBeInTheDocument();
  });

  test('shows typing indicator when another user is typing', () => {
    render(<ChatWidget />);
    // Simulate typing event
    // For demonstration, assume "is typing..." appears
    expect(screen.queryByText(/is typing/i)).toBeInTheDocument();
  });

  test('shows presence indicator (online/offline)', () => {
    render(<ChatWidget />);
    // Simulate presence state
    // For demonstration, assume "Online" or "Offline" appears
    expect(screen.queryByText(/Online|Offline/)).toBeInTheDocument();
  });

  test('is accessible by keyboard', () => {
    render(<ChatWidget />);
    const sidebar = screen.getByRole('button');
    sidebar.focus();
    expect(sidebar).toHaveFocus();
    fireEvent.keyDown(sidebar, { key: 'Enter', code: 'Enter' });
    // Should open the chat or select the conversation
  });

  test('renders chat bubbles with correct styling', () => {
    render(<ChatWidget />);
    // For demonstration, check for chat bubble class or style
    expect(screen.getByText('Hello')).toHaveStyle('border-radius: 12px');
  });
});