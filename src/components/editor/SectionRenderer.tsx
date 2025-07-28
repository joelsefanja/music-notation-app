'use client';

import React from 'react';
import { Section } from '../../types/section';
import { LineRenderer } from './LineRenderer';

interface SectionRendererProps {
  section: Section;
  className?: string;
}

/**
 * Renders a section with its title and lines
 */
export const SectionRenderer: React.FC<SectionRendererProps> = ({ section, className = '' }) => {
  const getSectionStyles = (type: Section['type']) => {
    switch (type) {
      case 'verse':
        return 'border-l-4 border-blue-300 bg-blue-50/30';
      case 'chorus':
        return 'border-l-4 border-green-300 bg-green-50/30';
      case 'bridge':
        return 'border-l-4 border-purple-300 bg-purple-50/30';
      case 'pre-chorus':
        return 'border-l-4 border-yellow-300 bg-yellow-50/30';
      case 'intro':
      case 'outro':
        return 'border-l-4 border-gray-300 bg-gray-50/30';
      case 'instrumental':
      case 'solo':
        return 'border-l-4 border-orange-300 bg-orange-50/30';
      case 'coda':
      case 'tag':
        return 'border-l-4 border-red-300 bg-red-50/30';
      case 'note':
        return 'border-l-4 border-indigo-300 bg-indigo-50/30';
      case 'unknown':
      default:
        return 'border-l-4 border-gray-300 bg-gray-50/30';
    }
  };

  const getSectionTitle = (section: Section) => {
    if (section.title) {
      return section.title;
    }
    
    // Generate default titles based on section type
    switch (section.type) {
      case 'verse':
        return 'Verse';
      case 'chorus':
        return 'Chorus';
      case 'bridge':
        return 'Bridge';
      case 'pre-chorus':
        return 'Pre-Chorus';
      case 'intro':
        return 'Intro';
      case 'outro':
        return 'Outro';
      case 'instrumental':
        return 'Instrumental';
      case 'solo':
        return 'Solo';
      case 'coda':
        return 'Coda';
      case 'tag':
        return 'Tag';
      case 'note':
        return 'Note';
      case 'unknown':
      default:
        return 'Section';
    }
  };

  const shouldShowTitle = section.type !== 'unknown' || section.title;

  return (
    <div 
      className={`section mb-6 ${getSectionStyles(section.type)} ${className}`}
      role="region"
      aria-label={`${getSectionTitle(section)} section`}
    >
      {shouldShowTitle && (
        <div className="section-header px-4 py-2 bg-white/50 border-b border-gray-200/50">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {getSectionTitle(section)}
          </h3>
        </div>
      )}
      
      <div className="section-content px-4 py-3 space-y-2">
        {section.lines.length === 0 ? (
          <div className="text-gray-400 italic text-sm">
            (Empty section)
          </div>
        ) : (
          section.lines.map((line, index) => (
            <LineRenderer 
              key={`line-${index}`} 
              line={line} 
              className="mb-1"
            />
          ))
        )}
      </div>
    </div>
  );
};