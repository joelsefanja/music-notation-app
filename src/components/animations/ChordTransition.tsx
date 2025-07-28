'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ChordTransitionProps {
  chords: Array<{
    id: string;
    value: string;
    originalValue?: string;
    position: { x: number; y: number };
    isChanging?: boolean;
  }>;
  animationDuration?: number;
  staggerDelay?: number;
  className?: string;
}

interface SingleChordTransitionProps {
  chord: {
    id: string;
    value: string;
    originalValue?: string;
    position: { x: number; y: number };
    isChanging?: boolean;
  };
  index: number;
  animationDuration: number;
  staggerDelay: number;
  className?: string;
}

/**
 * Animation variants for chord transitions
 */
const chordVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
  changing: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    y: [0, -4, 0],
    rotateX: [0, 180, 360],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      times: [0, 0.5, 1],
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  enter: {
    scale: [0.8, 1.1, 1],
    opacity: [0, 0.7, 1],
    y: [10, -2, 0],
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Animation variants for staggered chord animations
 */
const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Single chord transition component
 */
const SingleChordTransition: React.FC<SingleChordTransitionProps> = ({
  chord,
  index,
  animationDuration,
  staggerDelay,
  className = ''
}) => {
  const isChanging = chord.isChanging || chord.value !== chord.originalValue;

  return (
    <motion.div
      key={chord.id}
      className={`absolute inline-block ${className}`}
      style={{
        left: chord.position.x,
        top: chord.position.y,
      }}
      variants={chordVariants}
      initial="initial"
      animate={isChanging ? "changing" : "initial"}
      transition={{
        delay: index * staggerDelay,
        duration: animationDuration,
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={chord.value}
          className={`
            inline-block px-2 py-1 rounded-md font-semibold text-sm
            ${isChanging 
              ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm' 
              : 'bg-gray-100 text-gray-700 border border-gray-300'
            }
          `}
          variants={chordVariants}
          initial="enter"
          animate="initial"
          exit="exit"
          layout
        >
          {chord.value}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Chord transition component with staggered animations for multiple chords
 */
export const ChordTransition: React.FC<ChordTransitionProps> = ({
  chords,
  animationDuration = 0.6,
  staggerDelay = 0.1,
  className = ''
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      role="group"
      aria-label="Chord transitions"
    >
      {chords.map((chord, index) => (
        <SingleChordTransition
          key={chord.id}
          chord={chord}
          index={index}
          animationDuration={animationDuration}
          staggerDelay={staggerDelay}
          className="transition-all duration-200"
        />
      ))}
    </motion.div>
  );
};

/**
 * Hook for managing chord transition state
 */
export const useChordTransition = () => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [transitionQueue, setTransitionQueue] = React.useState<string[]>([]);

  const startTransition = React.useCallback((chordIds: string[]) => {
    setIsTransitioning(true);
    setTransitionQueue(chordIds);
  }, []);

  const completeTransition = React.useCallback(() => {
    setIsTransitioning(false);
    setTransitionQueue([]);
  }, []);

  const isChordTransitioning = React.useCallback((chordId: string) => {
    return transitionQueue.includes(chordId);
  }, [transitionQueue]);

  return {
    isTransitioning,
    startTransition,
    completeTransition,
    isChordTransitioning,
  };
};

/**
 * Utility function to calculate chord positions from text
 */
export const calculateChordPositions = (
  text: string,
  chords: Array<{ value: string; startIndex: number; endIndex: number }>,
  fontSize: number = 14,
  lineHeight: number = 1.5
): Array<{ x: number; y: number }> => {
  const charWidth = fontSize * 0.6; // Approximate character width for monospace font
  const lineHeightPx = fontSize * lineHeight;

  return chords.map(chord => {
    const lines = text.substring(0, chord.startIndex).split('\n');
    const lineIndex = lines.length - 1;
    const columnIndex = lines[lineIndex].length;

    return {
      x: columnIndex * charWidth,
      y: lineIndex * lineHeightPx - lineHeightPx * 0.5, // Position above text
    };
  });
};