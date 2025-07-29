'use client';

import React from 'react';

interface MetadataDisplayProps {
  metadata: any;
  compact?: boolean;
  className?: string;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  metadata,
  compact = false,
  className = ""
}) => {
  if (!metadata) return null;

  const { title, artist, key, tempo, time_signature } = metadata;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-xs ${className}`}>
        {title && (
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
            {title}
          </span>
        )}
        {artist && (
          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
            {artist}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Song Info</h4>
      <div className="space-y-1">
        {title && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Title:</span> {title}
          </div>
        )}
        {artist && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Artist:</span> {artist}
          </div>
        )}
        {key && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Key:</span> {key}
          </div>
        )}
        {tempo && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Tempo:</span> {tempo}
          </div>
        )}
        {time_signature && (
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Time:</span> {time_signature}
          </div>
        )}
      </div>
    </div>
  );
};