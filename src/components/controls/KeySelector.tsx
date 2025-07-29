'use client';

import React from 'react';

interface KeySelectorProps {
  value: string;
  onChange: (key: string) => void;
  label?: string;
  className?: string;
}

export const KeySelector: React.FC<KeySelectorProps> = ({
  value,
  onChange,
  label = "Key",
  className = ""
}) => {
  const keys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          text-gray-900 dark:text-white text-sm transition-colors
        "
      >
        {keys.map(key => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};