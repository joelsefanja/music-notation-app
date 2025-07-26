'use client';

import React from 'react';
import { NotationFormat } from '../../types';
import { FormatSelector } from '../controls/FormatSelector';
import { KeySelector } from '../controls/KeySelector';

interface EditorToolbarProps {
  sourceFormat: NotationFormat;
  targetFormat: NotationFormat;
  sourceKey: string;
  targetKey: string;
  onSourceFormatChange: (format: NotationFormat) => void;
  onTargetFormatChange: (format: NotationFormat) => void;
  onSourceKeyChange: (key: string) => void;
  onTargetKeyChange: (key: string) => void;
  disabled?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  sourceFormat,
  targetFormat,
  sourceKey,
  targetKey,
  onSourceFormatChange,
  onTargetFormatChange,
  onSourceKeyChange,
  onTargetKeyChange,
  disabled = false
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormatSelector
          value={sourceFormat}
          onChange={onSourceFormatChange}
          label="Source Format"
          disabled={disabled}
        />
        
        <KeySelector
          value={sourceKey}
          onChange={onSourceKeyChange}
          label="Source Key"
          disabled={disabled}
        />
        
        <FormatSelector
          value={targetFormat}
          onChange={onTargetFormatChange}
          label="Target Format"
          disabled={disabled}
        />
        
        <KeySelector
          value={targetKey}
          onChange={onTargetKeyChange}
          label="Target Key"
          disabled={disabled}
        />
      </div>
    </div>
  );
};