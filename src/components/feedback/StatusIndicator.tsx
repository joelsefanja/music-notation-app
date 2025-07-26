'use client';

import React from 'react';
import { NotationFormat } from '../../types';
import { FormatDetectionResult } from '../../services/format-detector';
import { KeyDetectionResult } from '../../services/auto-key-detection';

interface StatusIndicatorProps {
  formatDetection: FormatDetectionResult | null;
  keyDetection: KeyDetectionResult | null;
  isDetecting?: boolean;
}

const formatLabels: Record<NotationFormat, string> = {
  [NotationFormat.NASHVILLE]: 'Nashville Numbers',
  [NotationFormat.ONSONG]: 'OnSong',
  [NotationFormat.SONGBOOK]: 'Songbook Pro',
  [NotationFormat.CHORDPRO]: 'ChordPro',
  [NotationFormat.GUITAR_TABS]: 'Guitar Tabs',
  [NotationFormat.PCO]: 'Planning Center'
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  formatDetection,
  keyDetection,
  isDetecting = false
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  if (isDetecting) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Detecting format and key...</span>
        </div>
      </div>
    );
  }

  if (!formatDetection && !keyDetection) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="text-sm text-gray-500 italic">
          Enter text to see format and key detection results
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Format Detection */}
        {formatDetection && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Detected Format</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {formatLabels[formatDetection.format]}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(formatDetection.confidence)}`}>
                {getConfidenceText(formatDetection.confidence)} ({Math.round(formatDetection.confidence * 100)}%)
              </span>
            </div>
            {formatDetection.indicators.length > 0 && (
              <div className="text-xs text-gray-500">
                Indicators: {formatDetection.indicators.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Key Detection */}
        {keyDetection && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Detected Key</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {keyDetection.key}{keyDetection.isMinor ? ' minor' : ' major'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(keyDetection.confidence)}`}>
                {getConfidenceText(keyDetection.confidence)} ({Math.round(keyDetection.confidence * 100)}%)
              </span>
            </div>
            {keyDetection.analysis.progressionMatches.length > 0 && (
              <div className="text-xs text-gray-500">
                Progressions: {keyDetection.analysis.progressionMatches.slice(0, 3).join(', ')}
                {keyDetection.analysis.progressionMatches.length > 3 && '...'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};