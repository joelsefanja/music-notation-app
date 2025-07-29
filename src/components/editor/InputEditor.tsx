
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InputEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  height?: string;
  className?: string;
}

export const InputEditor: React.FC<InputEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your music notation here...",
  isLoading = false,
  height = "320px",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm 
          border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl
          resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/30 
          focus:border-blue-500/50 dark:focus:border-blue-400/50 
          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
          font-mono text-sm leading-relaxed transition-all shadow-inner
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        style={{ height }}
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      )}
      
      {/* Character count */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded">
        {value.length} chars
      </div>
    </div>
  );
};
