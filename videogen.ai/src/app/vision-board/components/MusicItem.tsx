// videogen.ai/src/app/vision-board/components/MusicItem.tsx
import React from 'react';

interface MusicItemProps {
  src: string;
  title: string;
}

const MusicItem: React.FC<MusicItemProps> = ({ src, title }) => {
  return (
    <div className="bg-gray-600 p-3 rounded shadow">
      <p className="text-sm text-gray-300 mb-1 truncate">{title}</p>
      <audio controls src={src} className="w-full">
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default MusicItem;
