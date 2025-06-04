// videogen.ai/src/app/vision-board/components/ChatInput.tsx
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-gray-700 rounded-b-lg">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Chat with the AI vision board..."
        className="flex-grow p-2 rounded-l-md bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="submit"
        className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-r-md"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
