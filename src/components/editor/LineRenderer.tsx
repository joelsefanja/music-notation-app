'use client';

import React from 'react';
import { Line, TextLine, EmptyLine, AnnotationLine, isTextLine, isEmptyLine, isAnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';

interface LineRendererProps {
  line: Line;
  className?: string;
}

interface TextLineRendererProps {
  line: TextLine;
  className?: string;
}

interface EmptyLineRendererProps {
  line: EmptyLine;
  className?: string;
}

interface AnnotationLineRendererProps {
  line: AnnotationLine;
  className?: string;
}

interface ChordPlacementRendererProps {
  text: string;
  chords: ChordPlacement[];
  placement?: 'above' | 'inline' | 'between';
}

/**
 * Renders chord placements above text (ChordPro style)
 */
const ChordAboveRenderer: React.FC<ChordPlacementRendererProps> = ({ text, chords }) => {
  if (chords.length === 0) {
    return <span>{text}</span>;
  }

  // Create chord line and text line
  const chordLine = Array(text.length).fill(' ');
  chords.forEach(chord => {
    const chordText = chord.value;
    for (let i = 0; i < chordText.length && chord.startIndex + i < chordLine.length; i++) {
      chordLine[chord.startIndex + i] = chordText[i];
    }
  });

  return (
    <div className="font-mono leading-tight">
      <div className="text-blue-600 font-semibold whitespace-pre">
        {chordLine.join('')}
      </div>
      <div className="whitespace-pre">
        {text}
      </div>
    </div>
  );
};

/**
 * Renders chord placements inline with text (OnSong style)
 */
const ChordInlineRenderer: React.FC<ChordPlacementRendererProps> = ({ text, chords }) => {
  if (chords.length === 0) {
    return <span>{text}</span>;
  }

  // Sort chords by position to process them in order
  const sortedChords = [...chords].sort((a, b) => a.startIndex - b.startIndex);
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedChords.forEach((chord, index) => {
    // Add text before chord
    if (chord.startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, chord.startIndex));
    }

    // Add chord
    parts.push(
      <span key={`chord-${index}`} className="inline-flex items-center">
        <span className="text-blue-600 font-semibold bg-blue-50 px-1 py-0.5 rounded text-xs border border-blue-200">
          {chord.value}
        </span>
      </span>
    );

    lastIndex = chord.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
};

/**
 * Renders a text line with chords
 */
const TextLineRenderer: React.FC<TextLineRendererProps> = ({ line, className = '' }) => {
  const hasChords = line.chords && line.chords.length > 0;
  
  // Determine chord placement style - default to 'above' for better readability
  const placement = line.chords?.[0]?.placement || 'above';

  return (
    <div className={`text-line ${className}`} role="text" aria-label={`Text line: ${line.text}`}>
      {hasChords ? (
        placement === 'inline' ? (
          <div className="font-mono text-sm leading-relaxed">
            <ChordInlineRenderer text={line.text} chords={line.chords} placement={placement} />
          </div>
        ) : placement === 'between' ? (
          // For 'between' placement, treat it similar to 'above' but with different spacing
          <div className="font-mono text-sm leading-relaxed">
            <ChordAboveRenderer text={line.text} chords={line.chords} placement={placement} />
          </div>
        ) : (
          <ChordAboveRenderer text={line.text} chords={line.chords} placement={placement} />
        )
      ) : (
        <div className="font-mono text-sm leading-relaxed whitespace-pre">
          {line.text}
        </div>
      )}
    </div>
  );
};

/**
 * Renders empty lines with appropriate whitespace
 */
const EmptyLineRenderer: React.FC<EmptyLineRendererProps> = ({ line, className = '' }) => {
  const count = line.count || 1;
  
  return (
    <div 
      className={`empty-line ${className}`}
      role="presentation"
      aria-hidden="true"
      style={{ height: `${count * 1.5}rem` }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="h-6" />
      ))}
    </div>
  );
};

/**
 * Renders annotation lines with proper formatting
 */
const AnnotationLineRenderer: React.FC<AnnotationLineRendererProps> = ({ line, className = '' }) => {
  const getAnnotationStyles = (type: AnnotationLine['annotationType']) => {
    switch (type) {
      case 'comment':
        return 'text-gray-600 italic bg-gray-50 border-l-4 border-gray-300 pl-3 py-1';
      case 'instruction':
        return 'text-orange-700 font-medium bg-orange-50 border-l-4 border-orange-300 pl-3 py-1';
      case 'tempo':
        return 'text-green-700 font-medium bg-green-50 border-l-4 border-green-300 pl-3 py-1';
      case 'dynamics':
        return 'text-purple-700 font-medium bg-purple-50 border-l-4 border-purple-300 pl-3 py-1';
      default:
        return 'text-gray-600 bg-gray-50 border-l-4 border-gray-300 pl-3 py-1';
    }
  };

  const getAnnotationLabel = (type: AnnotationLine['annotationType']) => {
    switch (type) {
      case 'comment':
        return 'Comment';
      case 'instruction':
        return 'Instruction';
      case 'tempo':
        return 'Tempo';
      case 'dynamics':
        return 'Dynamics';
      default:
        return 'Annotation';
    }
  };

  return (
    <div 
      className={`annotation-line ${getAnnotationStyles(line.annotationType)} ${className}`}
      role="note"
      aria-label={`${getAnnotationLabel(line.annotationType)}: ${line.value}`}
    >
      <div className="font-mono text-sm">
        <span className="text-xs uppercase tracking-wide opacity-75 mr-2">
          {getAnnotationLabel(line.annotationType)}:
        </span>
        {line.value}
      </div>
    </div>
  );
};

/**
 * Main line renderer that handles all line types
 */
export const LineRenderer: React.FC<LineRendererProps> = ({ line, className = '' }) => {
  if (isTextLine(line)) {
    return <TextLineRenderer line={line} className={className} />;
  }
  
  if (isEmptyLine(line)) {
    return <EmptyLineRenderer line={line} className={className} />;
  }
  
  if (isAnnotationLine(line)) {
    return <AnnotationLineRenderer line={line} className={className} />;
  }

  // Fallback for unknown line types
  return (
    <div className={`unknown-line text-red-500 bg-red-50 p-2 border border-red-200 rounded ${className}`}>
      <span className="text-xs font-medium">Unknown line type:</span>
      <pre className="text-xs mt-1">{JSON.stringify(line, null, 2)}</pre>
    </div>
  );
};

export { TextLineRenderer, EmptyLineRenderer, AnnotationLineRenderer };