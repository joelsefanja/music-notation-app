'use client';

import React from 'react';
import { NotationFormat } from '../../types';

interface FormatSelectorProps {
  value: NotationFormat;
  onChange: (format: NotationFormat) => void;
  label?: string;
  className?: string;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  label = "Format",
  className = ""
}) => {
  const formatOptions = [
    { value: NotationFormat.CHORDPRO, label: 'ChordPro' },
    { value: NotationFormat.GUITAR_TABS, label: 'Guitar Tabs' },
    { value: NotationFormat.NASHVILLE, label: 'Nashville' },
    { value: NotationFormat.ONSONG, label: 'OnSong' },
    { value: NotationFormat.SONGBOOK, label: 'Songbook' },
    { value: NotationFormat.PLANNING_CENTER, label: 'Planning Center' }
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as NotationFormat)}
        className="
          w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          text-gray-900 dark:text-white text-sm transition-colors
        "
      >
        {formatOptions.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};