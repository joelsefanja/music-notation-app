'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  status: 'ready' | 'processing' | 'success' | 'error';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = ""
}) => {
  const config = {
    ready: { color: 'bg-gray-400', label: 'Ready' },
    processing: { color: 'bg-blue-500', label: 'Processing' },
    success: { color: 'bg-green-500', label: 'Success' },
    error: { color: 'bg-red-500', label: 'Error' }
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <motion.div
        animate={status === 'processing' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: status === 'processing' ? Infinity : 0 }}
        className={`${sizeClasses[size]} ${config[status].color} rounded-full`}
      />
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {config[status].label}
        </span>
      )}
    </div>
  );
};