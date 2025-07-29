'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  className = "",
  showPercentage = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Converting...
        </span>
        {showPercentage && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};