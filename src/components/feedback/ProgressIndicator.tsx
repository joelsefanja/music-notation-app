'use client';

import React from 'react';
import { motion, useSpring, useTransform, Variants } from 'framer-motion';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'stepped' | 'gradient';
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  animated?: boolean;
  steps?: number; // For stepped variant
}

/**
 * Animation variants for progress indicators
 */
const progressVariants: Variants = {
  initial: { width: '0%' },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  }),
};

const circularVariants: Variants = {
  initial: { pathLength: 0 },
  animate: (progress: number) => ({
    pathLength: progress / 100,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  }),
};

/**
 * Performance-optimized linear progress bar with Framer Motion
 */
const LinearProgress: React.FC<{
  progress: number;
  size: 'sm' | 'md' | 'lg';
  color: string;
  animated: boolean;
  className?: string;
}> = ({ progress, size, color, animated, className = '' }) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const springProgress = useSpring(clampedProgress, { stiffness: 100, damping: 30 });

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]} ${className}`}>
      {animated ? (
        <motion.div
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          variants={progressVariants}
          initial="initial"
          animate="animate"
          custom={clampedProgress}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      ) : (
        <motion.div
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: useTransform(springProgress, (value) => `${value}%`) }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      )}
    </div>
  );
};

/**
 * Enhanced circular progress with smooth animations
 */
const CircularProgress: React.FC<{
  progress: number;
  size: 'sm' | 'md' | 'lg';
  color: string;
  animated: boolean;
  className?: string;
}> = ({ progress, size, color, animated, className = '' }) => {
  const sizeClasses = {
    sm: { size: 32, strokeWidth: 3 },
    md: { size: 48, strokeWidth: 4 },
    lg: { size: 64, strokeWidth: 5 }
  };

  const colorClasses = {
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    purple: '#8B5CF6',
  };

  const { size: svgSize, strokeWidth } = sizeClasses[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={svgSize}
        height={svgSize}
        className="transform -rotate-90"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke={colorClasses[color as keyof typeof colorClasses]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeLinecap="round"
          variants={circularVariants}
          initial="initial"
          animate="animate"
          custom={clampedProgress}
        />
      </svg>
      {/* Animated percentage text */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(clampedProgress)}%
        </motion.span>
      </motion.span>
    </div>
  );
};

/**
 * Stepped progress indicator
 */
const SteppedProgress: React.FC<{
  progress: number;
  steps: number;
  size: 'sm' | 'md' | 'lg';
  color: string;
  className?: string;
}> = ({ progress, steps, size, color, className = '' }) => {
  const stepSizeClasses = {
    sm: 'h-1 w-4',
    md: 'h-2 w-6',
    lg: 'h-3 w-8'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const completedSteps = Math.floor((clampedProgress / 100) * steps);

  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: steps }, (_, index) => (
        <motion.div
          key={index}
          className={`${stepSizeClasses[size]} rounded-sm ${
            index < completedSteps 
              ? colorClasses[color as keyof typeof colorClasses]
              : 'bg-gray-200'
          }`}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ 
            scale: index < completedSteps ? 1 : 0.8,
            opacity: index < completedSteps ? 1 : 0.5,
          }}
          transition={{ 
            delay: index * 0.1,
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Gradient progress indicator
 */
const GradientProgress: React.FC<{
  progress: number;
  size: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ progress, size, className = '' }) => {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]} ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        variants={progressVariants}
        initial="initial"
        animate="animate"
        custom={clampedProgress}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

/**
 * Performance-optimized progress indicator with advanced animations
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  text,
  size = 'md',
  variant = 'linear',
  className = '',
  showPercentage = false,
  color = 'blue',
  animated = true,
  steps = 5
}) => {
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <motion.div 
      className={`progress-indicator ${className}`} 
      role="status" 
      aria-live="polite"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {text && (
        <motion.div 
          className={`mb-2 text-gray-700 ${textSizeClasses[size]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {text}
          {showPercentage && (
            <motion.span 
              className="ml-2 text-gray-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              ({Math.round(clampedProgress)}%)
            </motion.span>
          )}
        </motion.div>
      )}
      
      {variant === 'linear' && (
        <LinearProgress 
          progress={clampedProgress} 
          size={size} 
          color={color} 
          animated={animated}
        />
      )}
      
      {variant === 'circular' && (
        <div className="flex justify-center">
          <CircularProgress 
            progress={clampedProgress} 
            size={size} 
            color={color} 
            animated={animated}
          />
        </div>
      )}
      
      {variant === 'stepped' && (
        <div className="flex justify-center">
          <SteppedProgress 
            progress={clampedProgress} 
            steps={steps} 
            size={size} 
            color={color}
          />
        </div>
      )}
      
      {variant === 'gradient' && (
        <GradientProgress 
          progress={clampedProgress} 
          size={size}
        />
      )}
      
      <span className="sr-only">
        {text ? `${text}: ` : ''}Progress: {Math.round(clampedProgress)} percent complete
      </span>
    </motion.div>
  );
};