'use client';

import React from 'react';

interface OutputPreviewProps {
  value: string;
  isLoading?: boolean;
  error?: string | null;
}

export const OutputPreview: React.FC<OutputPreviewProps> = ({
  value,
  isLoading = false,
  error = null
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-2 bg-gray-100 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
      </div>
      <div className="flex-1 relative">
        {isLoading && !error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Converting...</span>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full p-4 overflow-auto">
            <pre
              className="font-mono text-sm whitespace-pre-wrap text-gray-900 leading-relaxed"
              style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
                lineHeight: '1.5',
                tabSize: 2
              }}
            >
              {value || (
                <span className="text-gray-400 italic">
                  Converted output will appear here...
                </span>
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};