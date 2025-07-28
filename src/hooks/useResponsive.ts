'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
}

/**
 * Custom hook for responsive design breakpoints
 * Breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px  
 * - desktop: >= 1024px
 */
export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    breakpoint: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint;
      if (width < 768) {
        breakpoint = 'mobile';
      } else if (width < 1024) {
        breakpoint = 'tablet';
      } else {
        breakpoint = 'desktop';
      }

      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
        height,
      });
    };

    // Set initial state
    updateState();

    // Add event listener
    window.addEventListener('resize', updateState);

    // Cleanup
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return state;
};