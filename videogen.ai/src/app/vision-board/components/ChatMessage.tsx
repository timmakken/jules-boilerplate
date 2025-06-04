// videogen.ai/src/app/vision-board/components/ChatMessage.tsx
import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <span className="text-xs text-opacity-75 mt-1 block text-right">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
