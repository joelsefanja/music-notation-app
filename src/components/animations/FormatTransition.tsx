'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface FormatTransitionProps {
  currentFormat: string;
  previousFormat?: string;
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'flip';
  duration?: number;
  className?: string;
}

interface FormatIndicatorProps {
  format: string;
  isActive: boolean;
  className?: string;
}

/**
 * Animation variants for different transition types
 */
const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
} as const;

/**
 * Container variants for coordinated animations
 */
const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Content variants for smooth content transitions
 */
const contentVariants: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Format indicator component with animation
 */
const FormatIndicator: React.FC<FormatIndicatorProps> = ({
  format,
  isActive,
  className = '',
}) => {
  return (
    <motion.div
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
        transition-colors duration-200 ${className}
        ${
          isActive
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }
      `}
      animate={{
        scale: isActive ? 1.05 : 1,
        boxShadow: isActive
          ? '0 4px 12px rgba(59, 130, 246, 0.15)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.1 },
      }}
    >
      <motion.div
        className="w-2 h-2 rounded-full mr-2"
        animate={{
          backgroundColor: isActive ? '#3B82F6' : '#9CA3AF',
        }}
        transition={{ duration: 0.2 }}
      />
      {format.toUpperCase()}
    </motion.div>
  );
};

/**
 * Format transition component with smooth animations between different output formats
 */
export const FormatTransition: React.FC<FormatTransitionProps> = ({
  currentFormat,
  previousFormat,
  children,
  transitionType = 'fade',
  duration = 0.5,
  className = '',
}) => {
  const variants = transitionVariants[transitionType];

  return (
    <div className={`relative ${className}`}>
      {/* Format indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Format:</span>
          <FormatIndicator format={currentFormat} isActive={true} />
          {previousFormat && previousFormat !== currentFormat && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0.5, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-1"
            >
              <span className="text-xs text-gray-400">from</span>
              <FormatIndicator format={previousFormat} isActive={false} />
            </motion.div>
          )}
        </div>

        {/* Transition progress indicator */}
        <motion.div
          className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: duration, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>

      {/* Content transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFormat}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: duration,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <motion.div
            variants={variants}
            transition={{
              duration: duration,
              ease: 'easeInOut',
            }}
            style={{
              transformOrigin: 'center',
            }}
          >
            <motion.div variants={contentVariants} className="relative">
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Hook for managing format transitions
 */
export const useFormatTransition = () => {
  const [currentFormat, setCurrentFormat] = React.useState<string>('');
  const [previousFormat, setPreviousFormat] = React.useState<string>('');
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const changeFormat = React.useCallback(
    (newFormat: string) => {
      if (newFormat === currentFormat) return;

      setIsTransitioning(true);
      setPreviousFormat(currentFormat);

      // Small delay to ensure smooth transition
      setTimeout(() => {
        setCurrentFormat(newFormat);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500); // Match transition duration
      }, 50);
    },
    [currentFormat]
  );

  const resetTransition = React.useCallback(() => {
    setIsTransitioning(false);
    setPreviousFormat('');
  }, []);

  return {
    currentFormat,
    previousFormat,
    isTransitioning,
    changeFormat,
    resetTransition,
  };
};

/**
 * Format transition wrapper with preset configurations
 */
export const PresetFormatTransition: React.FC<{
  format: string;
  children: React.ReactNode;
  preset?: 'smooth' | 'quick' | 'dramatic';
  className?: string;
}> = ({ format, children, preset = 'smooth', className }) => {
  const presetConfigs = {
    smooth: { transitionType: 'fade' as const, duration: 0.4 },
    quick: { transitionType: 'slide' as const, duration: 0.2 },
    dramatic: { transitionType: 'flip' as const, duration: 0.6 },
  };

  const config = presetConfigs[preset];

  return (
    <FormatTransition
      currentFormat={format}
      transitionType={config.transitionType}
      duration={config.duration}
      className={className}
    >
      {children}
    </FormatTransition>
  );
};
'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotationFormat } from '../../types';

interface FormatTransitionProps {
  children: ReactNode;
  currentFormat: NotationFormat;
  transitionType?: 'fade' | 'slide' | 'scale';
  duration?: number;
}

export const FormatTransition: React.FC<FormatTransitionProps> = ({
  children,
  currentFormat,
  transitionType = 'fade',
  duration = 0.3,
}) => {
  const getAnimationVariants = () => {
    switch (transitionType) {
      case 'slide':
        return {
          initial: { x: 20, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: -20, opacity: 0 },
        };
      case 'scale':
        return {
          initial: { scale: 0.95, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.95, opacity: 0 },
        };
      default: // fade
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentFormat}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
