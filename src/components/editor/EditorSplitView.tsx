'use client';

import React from 'react';
import { InputEditor } from './InputEditor';
import { OutputPreview } from './OutputPreview';

interface EditorSplitViewProps {
  inputValue: string;
  outputValue: string;
  onInputChange: (value: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const EditorSplitView: React.FC<EditorSplitViewProps> = ({
  inputValue,
  outputValue,
  onInputChange,
  isLoading = false,
  error = null
}) => {
  return (
    <div className="flex-1 flex bg-white dark:bg-dark-bg rounded-lg shadow-sm border border-gray-200 dark:border-dark-border overflow-hidden transition-colors duration-200">
      {/* Input Editor */}
      <div className="flex-1 border-r border-gray-200 dark:border-dark-border">
        <InputEditor
          value={inputValue}
          onChange={onInputChange}
          disabled={isLoading}
        />
      </div>
      
      {/* Output Preview */}
      <div className="flex-1">
        <OutputPreview
          value={outputValue}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};