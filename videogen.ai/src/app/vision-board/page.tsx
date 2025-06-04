// videogen.ai/src/app/vision-board/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  VisionBoardLayout,
  ImageItem,
  VideoItem,
  TextItem,
  DocumentItem,
  MusicItem,
  ChatInput,
  ChatDisplay,
  ChatMessageType,
  BoardItemType // Import BoardItemType
} from './components';

export default function VisionBoardPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [boardItems, setBoardItems] = useState<BoardItemType[]>([
    // Initial example items (optional)
    { id: 'initial-text-1', type: 'text', content: 'Welcome to your dynamic vision board! Try asking the AI to find something, like "search for inspirational quotes".' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false); // For board updates
  const [isFullWidthView, setIsFullWidthView] = useState(false); // New state

  useEffect(() => {
    // Keep initial AI welcome message or fetch initial state if needed
    if (messages.length === 0) {
        setMessages([
            {
                id: 'init',
                text: 'Welcome to the AI Vision Board! You can chat with me or ask me to search for things to add to your board (e.g., "search for images of space"). To add my response to the board, end your request with "[add to board]".',
                sender: 'ai',
                timestamp: new Date()
            },
        ]);
    }
  }, [messages.length]); // Depend on messages.length to run only once after initial render

  const addAiMessage = (text: string, idSuffix: string = '') => {
    const aiMessage: ChatMessageType = {
      id: String(Date.now()) + '-ai' + idSuffix,
      text,
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, aiMessage]);
  };

  const addBoardItem = (item: BoardItemType) => {
    setBoardItems(prevItems => [...prevItems, item]);
  };

  // Helper function to detect image URLs (simple version)
  const isImageUrl = (url: string): boolean => {
      return /\.(jpeg|jpg|gif|png|webp)$/i.test(url.split('?')[0]); // Check extension, ignore query params for extension check
  };

  const extractImageUrls = (text: string): string[] => {
      const urlRegex = /(https?:\/\/[^\s]+)/g; // General URL regex
      const urls = text.match(urlRegex) || [];
      return urls.filter(isImageUrl);
  };

  const handleSendMessage = async (text: string) => {
      const userMessage: ChatMessageType = {
        id: String(Date.now()),
        text,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsLoading(true);

      // Keyword to trigger adding AI's response to the board
      const ADD_TO_BOARD_TRIGGER = "[add to board]";

      if (text.toLowerCase().startsWith('search for ') || text.toLowerCase().startsWith('find ') || text.toLowerCase().includes('images of') || text.toLowerCase().includes('pictures of')) {
        // Perplexity search logic
        const query = text.substring(text.indexOf(' ') + 1);
        addAiMessage(`Searching for: "${query}"...`, 'search-init');
        setIsLoadingBoard(true);
        try {
          const response = await fetch('/api/vision-board/search/perplexity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from Perplexity');
          }
          const data = await response.json();

          if (data.result) {
            const resultText = data.result;
            addAiMessage(`Perplexity found: ${resultText}`, 'search-result');

            const imageUrls = extractImageUrls(resultText);

            if (imageUrls.length > 0) {
              imageUrls.forEach((url, index) => {
                addBoardItem({
                  id: 'perplexity-image-' + String(Date.now()) + '-' + index,
                  type: 'image',
                  src: url,
                  alt: `Image related to: ${query}`,
                });
              });
              // If images are found, we might not want to add the raw text block if it's just URLs.
              // This can be refined based on how Perplexity structures responses with both text and images.
              // For now, if images are found, we don't add an additional text item from the same search result.
            } else {
              // No images found, add the text result as before
              addBoardItem({
                id: 'perplexity-text-' + String(Date.now()),
                type: 'text',
                content: resultText,
              });
            }
          } else {
            throw new Error('Unexpected response structure from Perplexity.');
          }
        } catch (error) {
          console.error('Error searching with Perplexity:', error);
          addAiMessage(`Error: ${error instanceof Error ? error.message : 'Could not connect to Perplexity.'}`, 'search-error');
        } finally {
          setIsLoadingBoard(false);
        }
      } else {
        // Default to OpenRouter chat
        try {
          const apiMessages = messages.slice(-5).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          }));
          apiMessages.push({ role: 'user', content: text });

          const response = await fetch('/api/vision-board/chat/openrouter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: apiMessages }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response from AI chat');
          }
          const data = await response.json();

          if (data.reply) {
            let aiResponseText = data.reply;

            // Display the AI's response in chat normally *before* processing for board
            addAiMessage(aiResponseText, 'ai-chat-reply');

            // Check if the user's original message contained the trigger
            if (text.toLowerCase().includes(ADD_TO_BOARD_TRIGGER.toLowerCase())) {
              const cleanedAiResponseText = aiResponseText.trim();
              const imageUrls = extractImageUrls(cleanedAiResponseText);

              if (imageUrls.length > 0) {
                addAiMessage(`Found images in AI response to add to the board.`, 'ai-board-image-signal');
                imageUrls.forEach((url, index) => {
                  addBoardItem({
                    id: 'ai-image-' + String(Date.now()) + '-' + index,
                    type: 'image',
                    src: url,
                    alt: `AI generated image ${index + 1}`,
                  });
                });
              } else if (cleanedAiResponseText) { // Only add text if there's actual text and no images
                addAiMessage(`Adding AI text response to the board: "${cleanedAiResponseText.substring(0, 50)}..."`, 'ai-board-text-signal');
                addBoardItem({
                  id: 'ai-text-' + String(Date.now()),
                  type: 'text',
                  content: cleanedAiResponseText,
                });
              }
            }
          } else {
            throw new Error('Unexpected response structure from AI chat.');
          }
        } catch (error) {
          console.error('Error sending message to AI chat:', error);
          addAiMessage(`Error: ${error instanceof Error ? error.message : 'Could not connect to AI chat.'}`, 'ai-chat-error');
        }
      }
      setIsLoading(false);
    };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Apply conditional styling to this container */}
      <div className={`container mx-auto ${isFullWidthView ? 'w-full' : 'max-w-7xl'}`}>
        <header className="text-center mb-6"> {/* Reduced mb-12 to mb-6 to make space for button */}
          <h1 className="text-4xl font-bold text-purple-400">AI Vision Board</h1>
          <p className="text-xl text-gray-300 mt-2">
            Craft your digital creations with the power of AI.
          </p>
        </header>

        {/* Add Toggle Button */}
        <div className="text-center mb-6"> {/* New div for button centering and margin */}
          <button
            onClick={() => setIsFullWidthView(!isFullWidthView)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
          >
            {isFullWidthView ? 'Exit Full Width' : 'Go Full Width'}
          </button>
        </div>

        {/* The rest of the layout (grid, etc.) remains inside this conditionally styled container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-200">Vision Board</h2>
                {isLoadingBoard && <p className="text-sm text-yellow-400">Updating board...</p>}
            </div>
            <VisionBoardLayout>
              {boardItems.map(item => {
                switch (item.type) {
                  case 'text':
                    return <TextItem key={item.id} content={item.content} />;
                  case 'image':
                    return <ImageItem key={item.id} src={item.src} alt={item.alt} />;
                  case 'video':
                    return <VideoItem key={item.id} src={item.src} title={item.title} />;
                  case 'document':
                    return <DocumentItem key={item.id} url={item.url} name={item.name} />;
                  case 'music':
                    return <MusicItem key={item.id} src={item.src} title={item.title} />;
                  default:
                    return null;
                }
              })}
            </VisionBoardLayout>
            {boardItems.length === 0 && !isLoadingBoard && (
                <p className="text-center text-gray-400 mt-4">Your vision board is empty. Try searching for something!</p>
            )}
          </div>

          <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow-xl flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
            <h2 className="text-2xl font-semibold text-center text-gray-200 py-4">AI Chat</h2>
            <ChatDisplay messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
            {isLoading && <p className="text-center text-sm text-gray-400 p-2">AI is thinking...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
