'use client';

import React, { useMemo } from 'react';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { SectionRenderer } from './SectionRenderer';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ProgressIndicator } from '../feedback/ProgressIndicator';
import { ErrorDisplay } from '../feedback/ErrorDisplay';
import { useResponsive } from '../../hooks/useResponsive';

interface OutputPreviewProps {
  // Legacy string support for backward compatibility
  value?: string;
  // New structured data support
  chordsheet?: Chordsheet;
  sections?: Section[];
  // Loading and error states
  isLoading?: boolean;
  error?: string | null;
  // Progress for long operations
  progress?: number;
  progressText?: string;
  // Display options
  showLineNumbers?: boolean;
  compactMode?: boolean;
  className?: string;
}

interface EmptyStateProps {
  responsive: ReturnType<typeof useResponsive>;
}

/**
 * Empty state component with responsive design
 */
const EmptyState: React.FC<EmptyStateProps> = ({ responsive }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="mb-4">
      <svg 
        className={`mx-auto text-gray-300 dark:text-gray-600 ${responsive.isMobile ? 'h-12 w-12' : 'h-16 w-16'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
        />
      </svg>
    </div>
    <h3 className={`font-medium text-gray-900 dark:text-dark-text ${responsive.isMobile ? 'text-base' : 'text-lg'}`}>
      No content to preview
    </h3>
    <p className={`mt-2 text-gray-500 dark:text-gray-400 max-w-sm ${responsive.isMobile ? 'text-sm' : 'text-base'}`}>
      {responsive.isMobile 
        ? 'Enter or paste chord sheet content to see the preview.'
        : 'Enter or paste your chord sheet content in the editor to see the converted output here.'
      }
    </p>
  </div>
);

/**
 * Loading overlay component
 */
const LoadingOverlay: React.FC<{
  progress?: number;
  progressText?: string;
  responsive: ReturnType<typeof useResponsive>;
}> = ({ progress, progressText, responsive }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm z-10">
    <div className="text-center p-6 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border max-w-sm mx-4">
      {typeof progress === 'number' ? (
        <ProgressIndicator
          progress={progress}
          text={progressText || 'Converting...'}
          size={responsive.isMobile ? 'sm' : 'md'}
          showPercentage={true}
        />
      ) : (
        <LoadingSpinner
          text={progressText || 'Converting...'}
          size={responsive.isMobile ? 'sm' : 'md'}
          variant="spinner"
        />
      )}
    </div>
  </div>
);

/**
 * Legacy string content renderer
 */
const LegacyContentRenderer: React.FC<{
  value: string;
  showLineNumbers: boolean;
  responsive: ReturnType<typeof useResponsive>;
}> = ({ value, showLineNumbers, responsive }) => {
  const lines = value.split('\n');
  
  return (
    <div className="font-mono text-sm leading-relaxed">
      {showLineNumbers ? (
        <div className="flex">
          <div className="flex-shrink-0 pr-4 text-gray-400 dark:text-gray-500 text-right border-r border-gray-200 dark:border-dark-border mr-4">
            {lines.map((_, index) => (
              <div key={index} className="h-6 leading-6">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <pre className="whitespace-pre-wrap text-gray-900 dark:text-dark-text">
              {value}
            </pre>
          </div>
        </div>
      ) : (
        <pre 
          className="whitespace-pre-wrap text-gray-900 dark:text-dark-text"
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
            lineHeight: responsive.isMobile ? '1.4' : '1.5',
            fontSize: responsive.isMobile ? '0.75rem' : '0.875rem',
            tabSize: 2
          }}
        >
          {value}
        </pre>
      )}
    </div>
  );
};

/**
 * Enhanced OutputPreview component with discriminated Line union type support
 */
export const OutputPreview: React.FC<OutputPreviewProps> = ({
  value,
  chordsheet,
  sections,
  isLoading = false,
  error = null,
  progress,
  progressText,
  showLineNumbers = false,
  compactMode = false,
  className = ''
}) => {
  const responsive = useResponsive();

  // Determine what content to render
  const contentToRender = useMemo(() => {
    if (chordsheet) {
      return { type: 'chordsheet' as const, data: chordsheet };
    }
    if (sections && sections.length > 0) {
      return { type: 'sections' as const, data: sections };
    }
    if (value && value.trim()) {
      return { type: 'string' as const, data: value };
    }
    return { type: 'empty' as const, data: null };
  }, [chordsheet, sections, value]);

  const headerHeight = responsive.isMobile ? 'h-12' : 'h-14';
  const headerPadding = responsive.isMobile ? 'px-3 py-2' : 'px-4 py-3';
  const contentPadding = responsive.isMobile ? 'p-3' : 'p-4';

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden transition-colors duration-200 ${className}`}>
      {/* Header */}
      <div className={`flex-shrink-0 ${headerHeight} ${headerPadding} bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex items-center justify-between`}>
        <h3 className={`font-semibold text-gray-700 dark:text-gray-300 ${responsive.isMobile ? 'text-sm' : 'text-base'}`}>
          Preview
        </h3>
        
        {/* Header controls */}
        <div className="flex items-center space-x-2">
          {contentToRender.type !== 'empty' && (
            <div className="flex items-center space-x-2">
              {!responsive.isMobile && (
                <button
                  type="button"
                  onClick={() => {/* Toggle line numbers */}}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    showLineNumbers 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                      : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover'
                  }`}
                  aria-label="Toggle line numbers"
                >
                  #
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {/* Toggle compact mode */}}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  compactMode 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600' 
                    : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover'
                }`}
                aria-label="Toggle compact mode"
              >
                {responsive.isMobile ? '⋯' : 'Compact'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {isLoading && !error && (
          <LoadingOverlay 
            progress={progress} 
            progressText={progressText} 
            responsive={responsive}
          />
        )}

        {/* Error display */}
        {error && (
          <div className={contentPadding}>
            <ErrorDisplay error={error} />
          </div>
        )}

        {/* Content */}
        {!error && (
          <div className={`h-full overflow-auto ${contentPadding}`}>
            {contentToRender.type === 'empty' ? (
              <EmptyState responsive={responsive} />
            ) : contentToRender.type === 'chordsheet' ? (
              <div 
                className={`space-y-${compactMode ? '3' : '4'}`}
                role="main"
                aria-label="Chord sheet preview"
              >
                {/* Chordsheet metadata */}
                {contentToRender.data.title && (
                  <div className="mb-6 pb-4 border-b border-gray-200 dark:border-dark-border">
                    <h1 className={`font-bold text-gray-900 dark:text-dark-text ${responsive.isMobile ? 'text-lg' : 'text-xl'}`}>
                      {contentToRender.data.title}
                    </h1>
                    {contentToRender.data.artist && (
                      <p className={`text-gray-600 dark:text-gray-400 mt-1 ${responsive.isMobile ? 'text-sm' : 'text-base'}`}>
                        by {contentToRender.data.artist}
                      </p>
                    )}
                    {contentToRender.data.originalKey && (
                      <p className={`text-gray-500 dark:text-gray-400 mt-1 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>
                        Key: {contentToRender.data.originalKey}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Sections */}
                {contentToRender.data.sections.map((section, index) => (
                  <SectionRenderer 
                    key={`section-${index}`} 
                    section={section}
                    className={compactMode ? 'mb-2' : 'mb-4'}
                  />
                ))}
              </div>
            ) : contentToRender.type === 'sections' ? (
              <div 
                className={`space-y-${compactMode ? '3' : '4'}`}
                role="main"
                aria-label="Sections preview"
              >
                {contentToRender.data.map((section, index) => (
                  <SectionRenderer 
                    key={`section-${index}`} 
                    section={section}
                    className={compactMode ? 'mb-2' : 'mb-4'}
                  />
                ))}
              </div>
            ) : (
              <LegacyContentRenderer
                value={contentToRender.data}
                showLineNumbers={showLineNumbers}
                responsive={responsive}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};