// videogen.ai/src/app/vision-board/components/TextItem.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TextItemProps {
  content: string;
}

const TextItem: React.FC<TextItemProps> = ({ content }) => {
  return (
    <div className="bg-gray-600 p-3 rounded shadow prose prose-invert">
      {/* The 'prose' and 'prose-invert' classes from Tailwind typography plugin are helpful for styling markdown here.
          If Tailwind typography plugin is not installed, these classes won't have an effect,
          and styling might need to be handled differently or it might look okay by default.
          For now, let's assume base styling or Tailwind typography might be present.
      */}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default TextItem;
