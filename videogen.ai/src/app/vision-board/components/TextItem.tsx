// videogen.ai/src/app/vision-board/components/TextItem.tsx
import React from 'react';

interface TextItemProps {
  content: string;
}

const TextItem: React.FC<TextItemProps> = ({ content }) => {
  return (
    <div className="bg-gray-600 p-3 rounded shadow">
      <p className="text-gray-200 whitespace-pre-wrap">{content}</p>
    </div>
  );
};

export default TextItem;
