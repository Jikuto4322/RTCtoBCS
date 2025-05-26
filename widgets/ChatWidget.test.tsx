import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWidget from './ChatWidget';

test('renders ChatWidget and sends a message', () => {
  render(<ChatWidget />);
  const input = screen.getByPlaceholderText('Type a message...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  expect(screen.getByText('Hello')).toBeInTheDocument();
});