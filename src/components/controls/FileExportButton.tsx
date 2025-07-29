'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NotationFormat } from '../../types';

interface FileExportButtonProps {
  content: string;
  format: NotationFormat;
  filename?: string;
  className?: string;
}

export const FileExportButton: React.FC<FileExportButtonProps> = ({
  content,
  format,
  filename,
  className = ""
}) => {
  const getFileExtension = (format: NotationFormat): string => {
    switch (format) {
      case NotationFormat.CHORDPRO:
        return '.chordpro';
      case NotationFormat.GUITAR_TABS:
        return '.tab';
      case NotationFormat.NASHVILLE:
        return '.nashville';
      case NotationFormat.ONSONG:
        return '.onsong';
      case NotationFormat.SONGBOOK:
        return '.songbook';
      default:
        return '.txt';
    }
  };

  const handleExport = () => {
    const extension = getFileExtension(format);
    const defaultFilename = `converted-song${extension}`;
    const finalFilename = filename || defaultFilename;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.button
      onClick={handleExport}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-center px-4 py-2 
        bg-green-500 hover:bg-green-600 text-white 
        rounded-lg font-medium text-sm transition-colors
        focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        ${className}
      `}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export
    </motion.button>
  );
};