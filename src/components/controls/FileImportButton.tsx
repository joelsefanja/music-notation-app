'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface FileImportButtonProps {
  onFileContent: (content: string) => void;
  acceptedTypes?: string[];
  className?: string;
}

export const FileImportButton: React.FC<FileImportButtonProps> = ({
  onFileContent,
  acceptedTypes = ['.txt', '.chordpro', '.cho', '.pro'],
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain' || file.name.match(/\.(txt|chordpro|cho|pro)$/i)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
      <motion.button
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center justify-center px-4 py-2 
          bg-gray-500 hover:bg-gray-600 text-white 
          rounded-lg font-medium text-sm transition-colors
          focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          ${className}
        `}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Import
      </motion.button>
    </>
  );
};