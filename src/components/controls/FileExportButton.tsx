'use client';

import React, { useState } from 'react';
import { NotationFormat } from '../../types';
import { FileOperations, ExportOptions } from '../../services/file-operations';
import { FileMetadata } from '../../services/storage/storage-provider.interface';

interface FileExportButtonProps {
  content: string;
  format: NotationFormat;
  metadata: FileMetadata;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
  exportOptions?: Partial<ExportOptions>;
}

/**
 * Button component for exporting chord sheet content to files
 */
export const FileExportButton: React.FC<FileExportButtonProps> = ({
  content,
  format,
  metadata,
  onError,
  disabled = false,
  className = '',
  exportOptions = {}
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const fileOperations = new FileOperations();

  const handleExport = async () => {
    if (disabled || isExporting || !content.trim()) return;

    setIsExporting(true);

    try {
      fileOperations.exportFile(content, format, metadata, exportOptions);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export file';
      onError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleExport();
    }
  };

  const isEmpty = !content.trim();

  return (
    <button
      onClick={handleExport}
      onKeyDown={handleKeyDown}
      disabled={disabled || isExporting || isEmpty}
      className={`
        inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
        text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      aria-label="Export chord sheet to file"
      title={isEmpty ? "No content to export" : `Export as ${format} file`}
    >
      {isExporting ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg 
            className="-ml-1 mr-2 h-4 w-4 text-gray-500" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          Export File
        </>
      )}
    </button>
  );
};

export default FileExportButton;