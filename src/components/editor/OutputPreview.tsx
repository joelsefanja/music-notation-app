'use client';

import React from 'react';
import { NotationFormat } from '../../types';

interface OutputPreviewProps {
  content: string;
  format: NotationFormat;
  className?: string;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({
  content,
  format,
  className = ""
}) => {
  if (!content) {
    return (
      <div className={`h-80 flex items-center justify-center text-gray-400 dark:text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🎼</div>
          <p>Converted output will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <pre className="
        whitespace-pre-wrap font-mono text-sm leading-relaxed 
        text-gray-900 dark:text-white bg-gray-50/80 dark:bg-gray-900/80 
        backdrop-blur-sm p-4 rounded-xl overflow-x-auto 
        border-2 border-gray-200/50 dark:border-gray-700/50 shadow-inner
        max-h-80 overflow-y-auto
      ">
        {content}
      </pre>

      {/* Format indicator */}
      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
        {format.toUpperCase()}
      </div>
    </div>
  );
};