'use client';

import React, { useRef, useState } from 'react';
import { FileOperations, ImportResult } from '../../services/file-operations';

interface FileImportButtonProps {
  onImport: (result: ImportResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Button component for importing chord sheet files
 */
export const FileImportButton: React.FC<FileImportButtonProps> = ({
  onImport,
  onError,
  disabled = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileOperations = new FileOperations();

  const handleButtonClick = () => {
    if (disabled || isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const result = await fileOperations.importFile(file);
      onImport(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import file';
      onError(errorMessage);
    } finally {
      setIsImporting(false);
      // Reset file input to allow importing the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pro,.chopro,.chord"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      
      <button
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isImporting}
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
          text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-label="Import chord sheet file"
        title="Import a chord sheet file (.txt, .pro, .chopro)"
      >
        {isImporting ? (
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
            Importing...
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" 
              />
            </svg>
            Import File
          </>
        )}
      </button>
    </div>
  );
};

export default FileImportButton;