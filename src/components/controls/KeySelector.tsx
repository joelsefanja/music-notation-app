'use client';

import React from 'react';

interface KeySelectorProps {
  value: string;
  onChange: (key: string) => void;
  label: string;
  disabled?: boolean;
}

const keys = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'
];

export const KeySelector: React.FC<KeySelectorProps> = ({
  value,
  onChange,
  label,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        {keys.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};