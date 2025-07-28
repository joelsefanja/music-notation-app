'use client';

import React from 'react';
import { NotationFormat } from '../../types';

interface FormatSelectorProps {
  value: NotationFormat;
  onChange: (format: NotationFormat) => void;
  label: string;
  disabled?: boolean;
}

const formatLabels: Record<NotationFormat, string> = {
  [NotationFormat.NASHVILLE]: 'Nashville Numbers',
  [NotationFormat.ONSONG]: 'OnSong',
  [NotationFormat.SONGBOOK]: 'Songbook Pro',
  [NotationFormat.CHORDPRO]: 'ChordPro',
  [NotationFormat.GUITAR_TABS]: 'Guitar Tabs',
  [NotationFormat.PCO]: 'Planning Center'
};

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  label,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as NotationFormat);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="
          px-3 py-2 text-sm 
          border border-gray-300 dark:border-dark-border 
          rounded-md 
          bg-white dark:bg-dark-surface
          text-gray-900 dark:text-dark-text
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 dark:disabled:bg-gray-800 
          disabled:text-gray-500 dark:disabled:text-gray-400 
          disabled:cursor-not-allowed
          transition-colors duration-200
        "
      >
        {Object.entries(formatLabels).map(([formatValue, formatLabel]) => (
          <option 
            key={formatValue} 
            value={formatValue}
            className="bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            {formatLabel}
          </option>
        ))}
      </select>
    </div>
  );
};