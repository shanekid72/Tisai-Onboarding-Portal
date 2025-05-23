import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInterface from './ChatInterface';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ChatInterface', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('properly advances through conversation steps', async () => {
    render(<ChatInterface mode="full" />);
    
    // Wait for initial greeting
    await waitFor(() => {
      expect(screen.getByText(/Welcome to TisAi WorldAPI Connect/)).toBeInTheDocument();
    });
    
    // Provide name
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Wait for assistant response about organization
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/What organization are you representing/)).toBeInTheDocument();
    });
    
    // Provide organization
    fireEvent.change(input, { target: { value: 'Acme Corp' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Wait for assistant to ask about email
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/what's your email address/i)).toBeInTheDocument();
    });
    
    // Verify state is stored in localStorage
    const storedState = JSON.parse(window.localStorage.getItem('tisai_chat_state') || '{}');
    expect(storedState.userData.name).toBe('John Doe');
    expect(storedState.userData.organization).toBe('Acme Corp');
  });

  test('correctly handles "no" response at api-questions step', async () => {
    // Set up the state to be at the api-questions step
    window.localStorage.setItem('tisai_chat_state', JSON.stringify({
      step: 'api-questions',
      messages: [
        {
          id: '1',
          sender: 'tisai',
          content: 'Welcome to TisAi WorldAPI Connect!',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          sender: 'user',
          content: 'John',
          timestamp: new Date().toISOString(),
        },
        {
          id: '3',
          sender: 'tisai',
          content: 'Is there anything specific you\'d like to know about the API?',
          timestamp: new Date().toISOString(),
        }
      ],
      userData: { name: 'John', organization: 'Acme Corp', email: 'john@acme.com' }
    }));
    
    render(<ChatInterface mode="full" />);
    
    // Send "no" response
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'no' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Wait for assistant to move to completed state
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText(/You're all set with the WorldAPI integration basics/i)).toBeInTheDocument();
    });
    
    // Verify state moved to completed
    const storedState = JSON.parse(window.localStorage.getItem('tisai_chat_state') || '{}');
    expect(storedState.step).toBe('completed');
  });

  test('allows resetting the conversation', async () => {
    // Set up existing state
    window.localStorage.setItem('tisai_chat_state', JSON.stringify({
      step: 'email',
      messages: [
        {
          id: '1',
          sender: 'tisai',
          content: 'Welcome to TisAi WorldAPI Connect!',
          timestamp: new Date().toISOString(),
        }
      ],
      userData: { name: 'Jane', organization: 'Test Corp' }
    }));
    
    render(<ChatInterface mode="full" />);
    
    // Click reset button
    fireEvent.click(screen.getByRole('button', { name: /Reset conversation/i }));
    
    // Verify localStorage is cleared and initial message is shown
    expect(window.localStorage.getItem('tisai_chat_state')).toBeNull();
    expect(screen.getByText(/Welcome to TisAi WorldAPI Connect/)).toBeInTheDocument();
  });
}); 