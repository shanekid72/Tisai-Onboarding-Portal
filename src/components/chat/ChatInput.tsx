import React, { useState } from 'react';
import type { KeyboardEvent, ChangeEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className={`p-3 bg-dark border-t border-white/10 transition-all ${isFocused ? 'border-secondary/50' : ''}`}>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Type your message..."
          rows={1}
          className="w-full bg-white bg-opacity-5 border border-white/10 rounded-lg py-3 px-4 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-secondary/30 text-white placeholder-white/50 disabled:opacity-50"
          style={{ maxHeight: '150px' }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className={`absolute right-2 bottom-2 rounded-full p-2 transition-colors ${
            disabled || !value.trim()
              ? 'bg-white/5 text-white/30'
              : 'bg-secondary text-white hover:bg-secondary/90'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      
      {/* Optional: Quick response suggestions */}
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => {
            if (!disabled) {
              onChange({ target: { value: 'Yes, please connect me.' } } as ChangeEvent<HTMLTextAreaElement>);
            }
          }}
          disabled={disabled}
          className="text-xs bg-white bg-opacity-5 hover:bg-opacity-10 text-white/70 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
        >
          Yes, please connect me
        </button>
        <button
          onClick={() => {
            if (!disabled) {
              onChange({ target: { value: 'What features does WorldAPI offer?' } } as ChangeEvent<HTMLTextAreaElement>);
            }
          }}
          disabled={disabled}
          className="text-xs bg-white bg-opacity-5 hover:bg-opacity-10 text-white/70 py-1 px-3 rounded-full transition-colors disabled:opacity-50"
        >
          What features does WorldAPI offer?
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 