'use client';

import React, { useCallback } from 'react';

interface InputEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const InputEditor: React.FC<InputEditorProps> = ({
  value,
  onChange,
  placeholder = "Paste your chord sheet here...",
  disabled = false
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Input</h3>
      </div>
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="
            w-full h-full p-4 font-mono text-sm border-0 resize-none 
            focus:outline-none focus:ring-0 
            bg-white dark:bg-dark-bg
            text-gray-900 dark:text-dark-text
            placeholder-gray-500 dark:placeholder-gray-400
            disabled:bg-gray-50 dark:disabled:bg-gray-800 
            disabled:text-gray-500 dark:disabled:text-gray-400
            transition-colors duration-200
          "
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};