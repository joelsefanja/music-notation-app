'use client';

import React, { useState } from 'react';
import { OutputPreview } from '../editor/OutputPreview';
import { Chordsheet } from '../../types/chordsheet';
import { Section } from '../../types/section';
import { TextLine, EmptyLine, AnnotationLine } from '../../types/line';
import { ChordPlacement } from '../../types/chord';

/**
 * Demo component showcasing the enhanced OutputPreview with discriminated Line types
 */
export const OutputPreviewDemo: React.FC = () => {
  const [demoType, setDemoType] = useState<'chordsheet' | 'sections' | 'string' | 'loading' | 'error'>('chordsheet');

  // Sample chord placements
  const sampleChords: ChordPlacement[] = [
    {
      value: 'C',
      originalText: '[C]',
      startIndex: 0,
      endIndex: 0,
      placement: 'above'
    },
    {
      value: 'F',
      originalText: '[F]',
      startIndex: 8,
      endIndex: 8,
      placement: 'above'
    },
    {
      value: 'G',
      originalText: '[G]',
      startIndex: 16,
      endIndex: 16,
      placement: 'above'
    },
    {
      value: 'C',
      originalText: '[C]',
      startIndex: 28,
      endIndex: 28,
      placement: 'above'
    }
  ];

  // Sample lines with different types
  const sampleLines = [
    {
      type: 'text',
      text: 'Amazing grace how sweet the sound',
      chords: sampleChords
    } as TextLine,
    {
      type: 'text',
      text: 'That saved a wretch like me',
      chords: [
        {
          value: 'Am',
          originalText: '[Am]',
          startIndex: 5,
          endIndex: 5,
          placement: 'above'
        },
        {
          value: 'F',
          originalText: '[F]',
          startIndex: 15,
          endIndex: 15,
          placement: 'above'
        },
        {
          value: 'G',
          originalText: '[G]',
          startIndex: 25,
          endIndex: 25,
          placement: 'above'
        }
      ] as ChordPlacement[]
    } as TextLine,
    {
      type: 'empty',
      count: 2
    } as EmptyLine,
    {
      type: 'annotation',
      value: 'Play slowly and with feeling',
      annotationType: 'instruction'
    } as AnnotationLine,
    {
      type: 'empty',
      count: 1
    } as EmptyLine
  ];

  // Sample sections
  const sampleSections: Section[] = [
    {
      type: 'verse',
      title: 'Verse 1',
      lines: sampleLines
    },
    {
      type: 'chorus',
      lines: [
        {
          type: 'text',
          text: 'How sweet the sound',
          chords: [
            {
              value: 'C',
              originalText: '[C]',
              startIndex: 0,
              endIndex: 0,
              placement: 'above'
            },
            {
              value: 'G',
              originalText: '[G]',
              startIndex: 10,
              endIndex: 10,
              placement: 'above'
            }
          ]
        } as TextLine,
        {
          type: 'annotation',
          value: 'Repeat 2x',
          annotationType: 'comment'
        } as AnnotationLine
      ]
    },
    {
      type: 'bridge',
      lines: [
        {
          type: 'annotation',
          value: '120 BPM',
          annotationType: 'tempo'
        } as AnnotationLine,
        {
          type: 'text',
          text: 'I once was lost but now am found',
          chords: []
        } as TextLine,
        {
          type: 'annotation',
          value: 'forte',
          annotationType: 'dynamics'
        } as AnnotationLine
      ]
    }
  ];

  // Sample chordsheet
  const sampleChordsheet: Chordsheet = {
    id: 'demo-1',
    title: 'Amazing Grace',
    artist: 'John Newton',
    originalKey: 'C',
    sections: sampleSections
  };

  const renderDemo = () => {
    switch (demoType) {
      case 'chordsheet':
        return <OutputPreview chordsheet={sampleChordsheet} />;
      
      case 'sections':
        return <OutputPreview sections={sampleSections} />;
      
      case 'string':
        return <OutputPreview value="C       F       G       C\nAmazing grace how sweet the sound\nThat saved a wretch like me\n\n(Play slowly)" />;
      
      case 'loading':
        return <OutputPreview chordsheet={sampleChordsheet} isLoading={true} progress={65} progressText="Converting to ChordPro format..." />;
      
      case 'error':
        return <OutputPreview error="Failed to parse chord sheet: Invalid chord notation on line 3" />;
      
      default:
        return <OutputPreview />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Enhanced OutputPreview Demo</h1>
        <p className="text-gray-600 mb-4">
          This demo showcases the enhanced OutputPreview component with support for discriminated Line union types,
          responsive design, accessibility features, and improved UI components.
        </p>
        
        {/* Demo type selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'chordsheet', label: 'Full Chordsheet' },
            { key: 'sections', label: 'Sections Only' },
            { key: 'string', label: 'Legacy String' },
            { key: 'loading', label: 'Loading State' },
            { key: 'error', label: 'Error State' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDemoType(key as any)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                demoType === key
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Demo content */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="h-96">
          {renderDemo()}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Line Type Support</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• TextLine with chord positioning</li>
            <li>• EmptyLine with count support</li>
            <li>• AnnotationLine with type classification</li>
            <li>• Type-safe discriminated unions</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Responsive Design</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Mobile, tablet, desktop breakpoints</li>
            <li>• Adaptive font sizes and spacing</li>
            <li>• Touch-friendly controls</li>
            <li>• Optimized layouts per device</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• ARIA labels and roles</li>
            <li>• Screen reader support</li>
            <li>• Keyboard navigation</li>
            <li>• Semantic HTML structure</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Enhanced UI</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Progress indicators</li>
            <li>• Loading states with variants</li>
            <li>• Error handling and display</li>
            <li>• Consistent design system</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Chord Rendering</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Above-text positioning</li>
            <li>• Inline chord display</li>
            <li>• Original text preservation</li>
            <li>• Format-specific styling</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Section Support</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Color-coded section types</li>
            <li>• Verse, chorus, bridge styling</li>
            <li>• Custom section titles</li>
            <li>• Empty section handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};