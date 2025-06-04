// videogen.ai/src/app/vision-board/components/ImageItem.tsx
import React from 'react';

interface ImageItemProps {
  src: string;
  alt: string;
}

const ImageItem: React.FC<ImageItemProps> = ({ src, alt }) => {
  return (
    <div className="bg-gray-600 p-2 rounded shadow">
      <img src={src} alt={alt} className="w-full h-auto rounded" />
      <p className="text-sm text-gray-300 mt-1 truncate">{alt}</p>
    </div>
  );
};

export default ImageItem;
