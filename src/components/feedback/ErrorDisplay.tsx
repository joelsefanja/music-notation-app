'use client';

import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss
}) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 transition-colors duration-200">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
            Conversion Error
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{error}</p>
          </div>
          {onDismiss && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onDismiss}
                className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 focus:outline-none focus:underline transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex bg-red-50 dark:bg-red-900/20 rounded-md p-1.5 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 dark:focus:ring-offset-red-900 focus:ring-red-600 dark:focus:ring-red-500 transition-colors duration-200"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};