'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'orbit';
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'gray';
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * Animation variants for different spinner types
 */
const spinnerVariants: Variants = {
  spinning: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

const dotsVariants: Variants = {
  bouncing: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const pulseVariants: Variants = {
  pulsing: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const waveVariants: Variants = {
  waving: {
    scaleY: [1, 2, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const orbitVariants: Variants = {
  orbiting: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

/**
 * Enhanced spinner variant with Framer Motion
 */
const SpinnerVariant: React.FC<{ size: string; color: string; speed: string }> = ({ size, color, speed }) => {
  const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.5 : 1;
  
  return (
    <motion.div
      className={`rounded-full border-2 border-gray-200 ${size}`}
      style={{
        borderTopColor: `var(--color-${color}-600)`,
      }}
      variants={spinnerVariants}
      animate="spinning"
      transition={{
        duration: speedMultiplier,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

/**
 * Enhanced dots variant with staggered animation
 */
const DotsVariant: React.FC<{ size: 'sm' | 'md' | 'lg'; color: string; speed: string }> = ({ size, color, speed }) => {
  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  const dotSize = dotSizeClasses[size];
  const colorClass = colorClasses[color as keyof typeof colorClasses];
  const speedMultiplier = speed === 'slow' ? 1.5 : speed === 'fast' ? 0.5 : 1;

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSize} ${colorClass} rounded-full`}
          variants={dotsVariants}
          animate="bouncing"
          transition={{
            duration: 0.6 * speedMultiplier,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Enhanced pulse variant
 */
const PulseVariant: React.FC<{ size: string; color: string; speed: string }> = ({ size, color, speed }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses];
  const speedMultiplier = speed === 'slow' ? 2 : speed === 'fast' ? 0.8 : 1.5;

  return (
    <motion.div
      className={`${colorClass} rounded-full ${size}`}
      variants={pulseVariants}
      animate="pulsing"
      transition={{
        duration: speedMultiplier,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/**
 * Wave variant with multiple bars
 */
const WaveVariant: React.FC<{ size: 'sm' | 'md' | 'lg'; color: string; speed: string }> = ({ size, color, speed }) => {
  const barHeights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6'
  };

  const barWidths = {
    sm: 'w-0.5',
    md: 'w-1',
    lg: 'w-1.5'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  const barHeight = barHeights[size];
  const barWidth = barWidths[size];
  const colorClass = colorClasses[color as keyof typeof colorClasses];
  const speedMultiplier = speed === 'slow' ? 1.2 : speed === 'fast' ? 0.6 : 0.8;

  return (
    <div className="flex items-end space-x-0.5">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={`${barWidth} ${barHeight} ${colorClass} rounded-sm`}
          variants={waveVariants}
          animate="waving"
          transition={{
            duration: speedMultiplier,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Orbit variant with rotating dots
 */
const OrbitVariant: React.FC<{ size: string; color: string; speed: string }> = ({ size, color, speed }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses];
  const speedMultiplier = speed === 'slow' ? 3 : (speed === 'fast' ? 1 : 2);

  return (
    <motion.div
      className={`relative ${size}`}
      variants={orbitVariants}
      animate="orbiting"
      transition={{
        duration: speedMultiplier,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className={`absolute top-0 left-1/2 w-1 h-1 ${colorClass} rounded-full transform -translate-x-1/2`} />
      <div className={`absolute bottom-0 left-1/2 w-1 h-1 ${colorClass} rounded-full transform -translate-x-1/2 opacity-50`} />
      <div className={`absolute left-0 top-1/2 w-1 h-1 ${colorClass} rounded-full transform -translate-y-1/2 opacity-75`} />
      <div className={`absolute right-0 top-1/2 w-1 h-1 ${colorClass} rounded-full transform -translate-y-1/2 opacity-25`} />
    </motion.div>
  );
};

/**
 * Performance-optimized loading spinner with Framer Motion animations
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
  variant = 'spinner',
  color = 'blue',
  speed = 'normal'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant size={size} color={color} speed={speed} />;
      case 'pulse':
        return <PulseVariant size={sizeClasses[size]} color={color} speed={speed} />;
      case 'wave':
        return <WaveVariant size={size} color={color} speed={speed} />;
      case 'orbit':
        return <OrbitVariant size={sizeClasses[size]} color={color} speed={speed} />;
      case 'spinner':
      default:
        return <SpinnerVariant size={sizeClasses[size]} color={color} speed={speed} />;
    }
  };

  return (
    <motion.div 
      className={`flex items-center justify-center space-x-3 ${className}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {renderSpinner()}
      {text && (
        <motion.span 
          className={`text-gray-600 dark:text-gray-400 ${textSizeClasses[size]} transition-colors duration-200`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {text}
        </motion.span>
      )}
      <span className="sr-only">
        {text || 'Loading...'}
      </span>
    </motion.div>
  );
};
