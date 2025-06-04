// videogen.ai/src/app/vision-board/components/VideoItem.tsx
import React from 'react';

interface VideoItemProps {
  src: string;
  title: string;
}

const VideoItem: React.FC<VideoItemProps> = ({ src, title }) => {
  return (
    <div className="bg-gray-600 p-2 rounded shadow">
      <video controls src={src} className="w-full rounded">
        Your browser does not support the video tag.
      </video>
      <p className="text-sm text-gray-300 mt-1 truncate">{title}</p>
    </div>
  );
};

export default VideoItem;
