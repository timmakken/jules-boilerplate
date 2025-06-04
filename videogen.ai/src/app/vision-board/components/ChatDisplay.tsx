// videogen.ai/src/app/vision-board/components/ChatDisplay.tsx
import React from 'react';
import ChatMessage, { Message } from './ChatMessage';

interface ChatDisplayProps {
  messages: Message[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  return (
    <div className="flex-grow h-96 overflow-y-auto p-4 bg-gray-700 rounded-t-lg space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-gray-400">No messages yet. Start a conversation!</p>
      )}
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
    </div>
  );
};

export default ChatDisplay;
