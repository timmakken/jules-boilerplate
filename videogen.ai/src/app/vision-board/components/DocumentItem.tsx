// videogen.ai/src/app/vision-board/components/DocumentItem.tsx
import React from 'react';

interface DocumentItemProps {
  url: string;
  name: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ url, name }) => {
  return (
    <div className="bg-gray-600 p-3 rounded shadow flex items-center space-x-2">
      {/* Placeholder for a document icon */}
      <span className="text-xl">📄</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline truncate">
        {name}
      </a>
    </div>
  );
};

export default DocumentItem;
