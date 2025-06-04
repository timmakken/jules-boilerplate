// videogen.ai/src/app/vision-board/components/VisionBoardLayout.tsx
import React from 'react';

interface VisionBoardLayoutProps {
  children: React.ReactNode;
}

const VisionBoardLayout: React.FC<VisionBoardLayoutProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-700 rounded-md">
      {children}
    </div>
  );
};

export default VisionBoardLayout;
