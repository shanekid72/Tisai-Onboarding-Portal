import React from 'react';
import type { Message } from './ChatInterface';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, sender, timestamp } = message;
  
  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
  
  const isTisAi = sender === 'tisai';
  
  return (
    <div className={`chat-message flex ${isTisAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isTisAi ? 'bg-secondary bg-opacity-10 mr-3' : 'bg-accent bg-opacity-10 ml-3'
        }`}
      >
        <span className="text-lg">{isTisAi ? '🤖' : '👤'}</span>
      </div>
      
      {/* Message content */}
      <div 
        className={`max-w-[75%] rounded-2xl p-4 ${
          isTisAi 
            ? 'bg-dark text-white rounded-tl-none' 
            : 'bg-accent bg-opacity-20 text-white rounded-tr-none'
        }`}
      >
        <div className="mb-1">
          <span className="font-medium">{isTisAi ? 'TisAi' : 'You'}</span>
          <span className="text-xs text-white/50 ml-2">{formattedTime}</span>
        </div>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
};

export default ChatMessage; 