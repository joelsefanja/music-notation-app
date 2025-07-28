
'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationState {
  activeAnimations: Set<string>;
  queuedAnimations: Array<{
    id: string;
    type: 'chord' | 'format' | 'loading' | 'progress';
    priority: number;
    duration: number;
  }>;
  isCoordinating: boolean;
  performanceMode: 'high' | 'balanced' | 'low';
}

type AnimationAction =
  | { type: 'START_ANIMATION'; payload: { id: string; animationType: string; priority: number; duration: number } }
  | { type: 'END_ANIMATION'; payload: { id: string } }
  | { type: 'QUEUE_ANIMATION'; payload: { id: string; animationType: string; priority: number; duration: number } }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'SET_PERFORMANCE_MODE'; payload: { mode: 'high' | 'balanced' | 'low' } }
  | { type: 'SET_COORDINATING'; payload: { isCoordinating: boolean } };

interface AnimationContextType {
  state: AnimationState;
  startAnimation: (id: string, type: string, priority?: number, duration?: number) => void;
  endAnimation: (id: string) => void;
  isAnimationActive: (id: string) => boolean;
  canStartAnimation: (priority: number) => boolean;
  setPerformanceMode: (mode: 'high' | 'balanced' | 'low') => void;
  getOptimalSettings: () => {
    reducedMotion: boolean;
    maxConcurrentAnimations: number;
    defaultDuration: number;
  };
}

const AnimationContext = createContext<AnimationContextType | null>(null);

/**
 * Animation state reducer
 */
const animationReducer = (state: AnimationState, action: AnimationAction): AnimationState => {
  switch (action.type) {
    case 'START_ANIMATION':
      return {
        ...state,
        activeAnimations: new Set([...state.activeAnimations, action.payload.id]),
        queuedAnimations: state.queuedAnimations.filter(anim => anim.id !== action.payload.id),
      };

    case 'END_ANIMATION':
      const newActiveAnimations = new Set(state.activeAnimations);
      newActiveAnimations.delete(action.payload.id);
      
      // Start next queued animation if any
      const nextAnimation = state.queuedAnimations
        .sort((a, b) => b.priority - a.priority)[0];
      
      if (nextAnimation && newActiveAnimations.size < getMaxConcurrentAnimations(state.performanceMode)) {
        newActiveAnimations.add(nextAnimation.id);
        return {
          ...state,
          activeAnimations: newActiveAnimations,
          queuedAnimations: state.queuedAnimations.filter(anim => anim.id !== nextAnimation.id),
        };
      }

      return {
        ...state,
        activeAnimations: newActiveAnimations,
      };

    case 'QUEUE_ANIMATION':
      // If we can start immediately, do so
      if (state.activeAnimations.size < getMaxConcurrentAnimations(state.performanceMode)) {
        return {
          ...state,
          activeAnimations: new Set([...state.activeAnimations, action.payload.id]),
        };
      }

      return {
        ...state,
        queuedAnimations: [
          ...state.queuedAnimations.filter(anim => anim.id !== action.payload.id),
          {
            id: action.payload.id,
            type: action.payload.animationType as any,
            priority: action.payload.priority,
            duration: action.payload.duration,
          },
        ],
      };

    case 'CLEAR_QUEUE':
      return {
        ...state,
        queuedAnimations: [],
      };

    case 'SET_PERFORMANCE_MODE':
      return {
        ...state,
        performanceMode: action.payload.mode,
      };

    case 'SET_COORDINATING':
      return {
        ...state,
        isCoordinating: action.payload.isCoordinating,
      };

    default:
      return state;
  }
};

/**
 * Get maximum concurrent animations based on performance mode
 */
const getMaxConcurrentAnimations = (mode: 'high' | 'balanced' | 'low'): number => {
  switch (mode) {
    case 'high': return 10;
    case 'balanced': return 5;
    case 'low': return 2;
    default: return 5;
  }
};

/**
 * Animation coordinator provider
 */
export const AnimationCoordinator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, {
    activeAnimations: new Set(),
    queuedAnimations: [],
    isCoordinating: false,
    performanceMode: 'balanced',
  });

  const startAnimation = useCallback((
    id: string, 
    type: string, 
    priority: number = 1, 
    duration: number = 500
  ) => {
    dispatch({
      type: 'QUEUE_ANIMATION',
      payload: { id, animationType: type, priority, duration },
    });

    // Auto-end animation after duration
    setTimeout(() => {
      dispatch({ type: 'END_ANIMATION', payload: { id } });
    }, duration);
  }, []);

  const endAnimation = useCallback((id: string) => {
    dispatch({ type: 'END_ANIMATION', payload: { id } });
  }, []);

  const isAnimationActive = useCallback((id: string) => {
    return state.activeAnimations.has(id);
  }, [state.activeAnimations]);

  const canStartAnimation = useCallback((priority: number) => {
    const maxConcurrent = getMaxConcurrentAnimations(state.performanceMode);
    const currentCount = state.activeAnimations.size;
    
    if (currentCount < maxConcurrent) return true;
    
    // Check if this animation has higher priority than queued ones
    const lowestQueuedPriority = Math.min(
      ...state.queuedAnimations.map(anim => anim.priority),
      Infinity
    );
    
    return priority > lowestQueuedPriority;
  }, [state.activeAnimations.size, state.queuedAnimations, state.performanceMode]);

  const setPerformanceMode = useCallback((mode: 'high' | 'balanced' | 'low') => {
    dispatch({ type: 'SET_PERFORMANCE_MODE', payload: { mode } });
  }, []);

  const getOptimalSettings = useCallback(() => {
    const reducedMotion = state.performanceMode === 'low' || 
      (typeof window !== 'undefined' && 
       window.matchMedia && 
       window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    return {
      reducedMotion,
      maxConcurrentAnimations: getMaxConcurrentAnimations(state.performanceMode),
      defaultDuration: state.performanceMode === 'high' ? 600 : 
                      state.performanceMode === 'balanced' ? 400 : 200,
    };
  }, [state.performanceMode]);

  const contextValue: AnimationContextType = {
    state,
    startAnimation,
    endAnimation,
    isAnimationActive,
    canStartAnimation,
    setPerformanceMode,
    getOptimalSettings,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Hook to use animation coordination
 */
export const useAnimationCoordinator = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationCoordinator must be used within AnimationCoordinator');
  }
  return context;
};

/**
 * Hook for simplified animation usage (backward compatibility)
 */
export const useAnimation = () => {
  const { isAnimationActive, startAnimation, endAnimation } = useAnimationCoordinator();
  
  return {
    isAnimating: false, // For backward compatibility
    setAnimating: (animating: boolean) => {
      if (animating) {
        startAnimation('generic', 'generic');
      } else {
        endAnimation('generic');
      }
    },
  };
};

/**
 * Higher-order component for coordinated animations
 */
export const withAnimationCoordination = <P extends object>(
  Component: React.ComponentType<P>,
  animationId: string,
  animationType: string = 'generic',
  priority: number = 1
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { startAnimation, endAnimation, isAnimationActive, getOptimalSettings } = useAnimationCoordinator();
    const [isVisible, setIsVisible] = React.useState(true);
    const settings = getOptimalSettings();

    const handleAnimationStart = useCallback(() => {
      startAnimation(animationId, animationType, priority, settings.defaultDuration);
    }, [startAnimation, settings.defaultDuration]);

    const handleAnimationEnd = useCallback(() => {
      endAnimation(animationId);
    }, [endAnimation]);

    const isActive = isAnimationActive(animationId);

    return (
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: settings.reducedMotion ? 0.1 : settings.defaultDuration / 1000,
              ease: "easeInOut",
            }}
            onAnimationStart={handleAnimationStart}
            onAnimationComplete={handleAnimationEnd}
          >
            <Component 
              {...props} 
              ref={ref}
              isAnimating={isActive}
              animationSettings={settings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  });
};

/**
 * Performance monitor component
 */
export const AnimationPerformanceMonitor: React.FC<{
  onPerformanceChange?: (metrics: {
    fps: number;
    activeAnimations: number;
    queuedAnimations: number;
    recommendedMode: 'high' | 'balanced' | 'low';
  }) => void;
}> = ({ onPerformanceChange }) => {
  const { state, setPerformanceMode } = useAnimationCoordinator();
  const [fps, setFps] = React.useState(60);
  const frameCountRef = React.useRef(0);
  const lastTimeRef = React.useRef(performance.now());

  React.useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      
      if (now - lastTimeRef.current >= 1000) {
        const currentFPS = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(currentFPS);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Auto-adjust performance mode based on FPS
        let recommendedMode: 'high' | 'balanced' | 'low' = 'balanced';
        if (currentFPS >= 55) {
          recommendedMode = 'high';
        } else if (currentFPS >= 30) {
          recommendedMode = 'balanced';
        } else {
          recommendedMode = 'low';
        }

        // Auto-adjust if performance is poor
        if (currentFPS < 30 && state.performanceMode !== 'low') {
          setPerformanceMode('low');
        } else if (currentFPS >= 55 && state.performanceMode === 'low') {
          setPerformanceMode('balanced');
        }

        onPerformanceChange?.({
          fps: currentFPS,
          activeAnimations: state.activeAnimations.size,
          queuedAnimations: state.queuedAnimations.length,
          recommendedMode,
        });
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(rafId);
  }, [state, setPerformanceMode, onPerformanceChange]);

  return null; // This is a monitoring component, no UI
};
