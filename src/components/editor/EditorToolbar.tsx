'use client';

import React from 'react';

interface EditorToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};