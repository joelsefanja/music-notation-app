'use client';

import React, { useState, useEffect } from 'react';

interface CopyToClipboardProps {
  content: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

/**
 * Button component for copying content to clipboard
 */
export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  content,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  label = 'Copy to Clipboard'
}) => {
  const [isCopying, setIsCopying] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  // Reset "just copied" state after a delay
  useEffect(() => {
    if (justCopied) {
      const timer = setTimeout(() => setJustCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justCopied]);

  const handleCopy = async () => {
    if (disabled || isCopying || !content.trim()) return;

    setIsCopying(true);

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers or non-secure contexts
        await fallbackCopyToClipboard(content);
      }

      setJustCopied(true);
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to copy to clipboard';
      onError?.(errorMessage);
    } finally {
      setIsCopying(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCopy();
    }
  };

  const isEmpty = !content.trim();

  return (
    <button
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      disabled={disabled || isCopying || isEmpty}
      className={`
        inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
        text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${justCopied ? 'bg-green-50 border-green-300 text-green-700' : ''}
        ${className}
      `}
      aria-label={label}
      title={isEmpty ? "No content to copy" : label}
    >
      {isCopying ? (
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
          Copying...
        </>
      ) : justCopied ? (
        <>
          <svg 
            className="-ml-1 mr-2 h-4 w-4 text-green-500" 
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
              d="M5 13l4 4L19 7" 
            />
          </svg>
          Copied!
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          Copy
        </>
      )}
    </button>
  );
};

/**
 * Fallback copy method for older browsers
 */
async function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('aria-hidden', 'true');
    textArea.setAttribute('tabindex', '-1');
    
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      if (successful) {
        resolve();
      } else {
        reject(new Error('Copy command failed'));
      }
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export default CopyToClipboard;